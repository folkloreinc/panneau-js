const path = require('path');
const fs = require('fs');
const express = require('express');
const _ = require('lodash');
const dayjs = require('dayjs');
const { sync: globSync } = require('glob');
const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const send = require('@polka/send-type');

// NOTE: storybook uses polka now instead of express and it's not great.

module.exports = () => {
    const router = express.Router();

    // Not strict: actions without data (ex: clone) send a `null` body
    router.use(express.json({ strict: false }));
    router.use(express.urlencoded());

    const dataPath = path.join(__dirname, '/items');

    const resourceExists = (resource) => fs.existsSync(path.join(dataPath, resource));

    const updatedResources = {};

    const deletedResources = {};

    const getResourceItems = (resource) => {
        const updatedItems = updatedResources[resource] || [];
        const deletedItems = deletedResources[resource] || [];
        const updatedResourcesIds = updatedItems.map((it) => it.id);
        const items = globSync(path.join(dataPath, `${resource}/*.{js,json}`))
            .map((filePath) =>
                filePath.match(/\.json$/)
                    ? JSON.parse(fs.readFileSync(filePath))
                    : require(filePath),
            )
            .filter(
                (it) =>
                    updatedResourcesIds.indexOf(it.id) === -1 && deletedItems.indexOf(it.id) === -1,
            );
        return [...items, ...updatedItems];
    };

    const getItemsPage = (items = [], page = 1, count = 10) => {
        const startIndex = (page - 1) * count;
        const endIndex = startIndex + count;
        const total = items.length;
        const lastPage = Math.ceil(total / count);
        const value = {
            pagination: { page, last_page: lastPage, total, per_page: count },
            data: items.slice(startIndex, endIndex),
        };
        return value;
    };

    const getSortValue = (item, field) => {
        const value = _.get(item, field, null);
        if (_.isPlainObject(value)) {
            // Localized values: sort on the first locale
            return getSortValue(value, Object.keys(value)[0]);
        }
        if (isString(value) && value.match(/^[0-9]+$/) !== null) {
            return parseInt(value, 10);
        }
        return isString(value) ? _.deburr(value).toLowerCase() : value;
    };

    const sortItems = (items, field = null, direction = 'asc') => {
        if (field === null) {
            return items;
        }
        const sortedItems = _.sortBy(items, (it) => getSortValue(it, field));
        return direction.toLowerCase() === 'desc' ? _.reverse(sortedItems) : sortedItems;
    };

    // Collect every string value of an item (including localized values like title.fr)
    const getSearchableValues = (value) => {
        if (isString(value)) {
            return [value];
        }
        if (isArray(value)) {
            return value.reduce((all, it) => [...all, ...getSearchableValues(it)], []);
        }
        if (_.isPlainObject(value)) {
            return Object.keys(value).reduce(
                (all, key) => [...all, ...getSearchableValues(value[key])],
                [],
            );
        }
        return [];
    };

    const matchesSearch = (item, search) => {
        const normalizedSearch = _.deburr(search).toLowerCase();
        const { title = null, name = null, slug = null } = item || {};
        return getSearchableValues([title, name, slug]).some(
            (value) => _.deburr(value).toLowerCase().indexOf(normalizedSearch) !== -1,
        );
    };

    const normalizeFilterValue = (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    };

    // Compare a query value (string, boolean or list of values) to an item value
    const matchesFilter = (itemValue, queryValue) => {
        const values = (isArray(queryValue) ? queryValue : [queryValue]).map(normalizeFilterValue);
        const itemValues = (isArray(itemValue) ? itemValue : [itemValue]).map((it) =>
            _.isPlainObject(it) && typeof it.id !== 'undefined' ? it.id : it,
        );
        return itemValues.some((it) => values.some((value) => `${it}` === `${value}`));
    };

    const filterItems = (items, query = null) => {
        if (query === null || Object.keys(query).length === 0) {
            return items;
        }

        // Express 5 doesn't parse "key[]=value" params as arrays, so normalize the keys
        const normalizedQuery = Object.keys(query).reduce((all, key) => {
            const normalizedKey = key.replace(/\[\]$/, '');
            return { ...all, [normalizedKey]: query[key] };
        }, {});

        // "types" is used by the medias browser to filter on the media type
        const { search = null, q = null, types = null, ...otherFilters } = normalizedQuery;
        const filters = types !== null ? { ...otherFilters, type: types } : otherFilters;
        const searchQuery = search || q;

        // Only filter on keys that exist on the items, so unknown query params are ignored
        const activeFilters = Object.keys(filters).filter(
            (key) =>
                filters[key] !== null &&
                filters[key] !== '' &&
                items.some((it) => it !== null && typeof it[key] !== 'undefined'),
        );

        return items.filter(
            (it) =>
                it !== null &&
                (searchQuery === null || searchQuery === '' || matchesSearch(it, searchQuery)) &&
                activeFilters.every((key) => matchesFilter(it[key], filters[key])),
        );
    };

    // The items are not sorted by id (ex: 1, 10, 11, 2...), so take the highest id
    const getNextId = (items) =>
        items.reduce((maxId, { id }) => Math.max(maxId, parseInt(id, 10) || 0), 0) + 1;

    const addResourceItem = (resource, item) => {
        if (typeof updatedResources[resource] === 'undefined') {
            updatedResources[resource] = [];
        }
        updatedResources[resource] = [...updatedResources[resource], item];
    };

    const updateResourceItem = (resource, newItem) => {
        if (typeof updatedResources[resource] === 'undefined') {
            updatedResources[resource] = [];
        }
        const alreadyUpdated =
            updatedResources[resource].find((it) => it.id === newItem.id) || null;
        if (alreadyUpdated === null) {
            addResourceItem(resource, newItem);
            return;
        }
        updatedResources[resource] = updatedResources[resource].map((it) =>
            it.id === newItem.id
                ? {
                      ...it,
                      ...newItem,
                  }
                : it,
        );
    };

    const deleteResourceItem = (resource, id) => {
        if (typeof deletedResources[resource] === 'undefined') {
            deletedResources[resource] = [];
        }
        deletedResources[resource] = [...deletedResources[resource], id];
    };

    // router.use(
    //     '/',
    //     express.static(dataPath, {
    //         index: false,
    //         extensions: ['json'],
    //     }),
    // );

    let loggedInUser = require(path.join(dataPath, '/me'));

    router.get('/auth/check', (req, res) => {
        send(res, 200, loggedInUser);
        res.end();
    });

    router.post('/auth/login', (req, res) => {
        send(res, 200, loggedInUser);
        res.end();
    });

    router.post('/auth/logout', (req, res) => {
        send(res, 200, null);
        res.end();
    });

    router.get('/csrf-cookie', (req, res) => {
        send(res, 200, null);
        res.end();
    });

    // Fake upload endpoint (uppy xhr transport): the file is ignored
    router.post('/upload', (req, res) => {
        req.resume();
        req.on('end', () => {
            send(res, 200, {
                url: 'https://picsum.photos/id/1015/1200/800',
                thumbnail_url: 'https://picsum.photos/id/1015/300/200',
            });
            res.end();
        });
    });

    router.post('/batch', (req, res) => {
        send(res, 200, ['123']);
        res.end();
    });

    /**
     * Resource index
     */
    router.get('/:resource', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            return;
        }

        // Test unauthorized request here
        // res.status(401);

        const defaultCount = 10;
        const {
            page = null,
            count = null,
            sort = 'id',
            sort_direction: sortDirection = 'asc',
            order = null,
            order_direction: orderDirection = null,
            paginate = true,
            paginated = true,
            // Exceptions for storybook
            id,
            viewMode,
            // The rest
            ...query
        } = req.query;

        const items = getResourceItems(resource);

        const filteredItems = sortItems(
            filterItems(items, query),
            order || sort,
            orderDirection || sortDirection,
        );

        if (page !== null) {
            send(
                res,
                200,
                getItemsPage(
                    filteredItems,
                    parseInt(page, 10),
                    parseInt(count || defaultCount, 10),
                ),
            );
        } else {
            send(
                res,
                200,
                count !== null && (paginate === false || paginated === false)
                    ? filteredItems.slice(0, count - 1)
                    : filteredItems,
            );
        }
        res.end();
    });

    router.get('/:resource/trash', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            return;
        }

        // Test unauthorized request here
        // res.status(401);

        const defaultCount = 10;
        const {
            page = null,
            count = null,
            sort = 'id',
            sort_direction: sortDirection = 'asc',
            paginate = true,
            paginated = true,
            // Exceptions for storybook
            id,
            viewMode,
            // The rest
            ...query
        } = req.query;

        const items = getResourceItems(resource);
        const filteredItems = sortItems(filterItems(items, query), sort, sortDirection);

        if (page !== null) {
            send(
                res,
                200,
                getItemsPage(
                    filteredItems,
                    parseInt(page, 10),
                    parseInt(count || defaultCount, 10),
                ),
            );
        } else {
            send(
                res,
                200,
                count !== null && (paginate === false || paginated === false)
                    ? filteredItems.slice(0, count - 1)
                    : filteredItems,
            );
        }
        res.end();
    });

    /**
     * Resource by slug
     */
    router.get('/:resource/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            return;
        }
        const { id: itemId } = req.params;
        const items = getResourceItems(resource);
        const item = items.find(({ id, slug = null }) => id === itemId || slug === itemId) || null;
        if (item === null) {
            send(res, 404);
            return;
        }
        send(res, 200, item);
        res.end();
    });

    /**
     * Resource store
     */
    router.post('/:resource', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        const currentItems = getResourceItems(resource);
        const nextId = getNextId(currentItems);
        const item = req.body;
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const newItem = {
            ...item,
            id: `${nextId}`,
            created_at: now,
            updated_at: now,
        };
        addResourceItem(resource, newItem);
        send(res, 200, newItem);
        res.end();
    });

    const updateResource = (req, res) => {
        const { resource, id } = req.params;
        const currentItems = getResourceItems(resource);
        const currentItem = currentItems.find((it) => it.id === id) || null;
        if (currentItem === null) {
            send(res, 404);
            res.end();
            return;
        }
        const { _method, ...item } = req.body;

        const newItem = {
            ...currentItem,
            ...item,
            updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        // DECOMMENT TO Simulate validation error
        // res.status(422).json({
        //     message: 'Validation failed: fields are required.',
        //     errors: {
        //         title: ['Title is required.'],
        //         'title.fr': ['Title.fr is required.'],
        //         'title.en': ['Title.en is required.'],
        //         description: ['Description is required.', 'Description should be a string.'],
        //         'colors.test-select-color-number': ['Colors.test... is required'],
        //         'colors.date': ['Colors.date is required'],
        //     },
        // });
        // res.end();

        updateResourceItem(resource, newItem);
        send(res, 200, newItem);
        res.end();
    };

    const deleteResource = (req, res) => {
        const { resource, id } = req.params;
        const currentItems = getResourceItems(resource);
        const currentItem = currentItems.find((it) => it.id === id) || null;
        if (currentItem === null) {
            send(res, 404);
            res.end();
            return;
        }
        deleteResourceItem(resource, id);
        send(res, 200, currentItem);
        res.end();
    };

    /**
     * Resource update
     */
    router.post('/:resource/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        const { _method: methodOverride = null } = req.body;
        if (methodOverride !== null && methodOverride.toUpperCase() === 'DELETE') {
            deleteResource(req, res);
        } else {
            updateResource(req, res);
        }
    });

    /**
     * Resource clone (duplicate)
     */
    router.post('/:resource/:id/clone', (req, res) => {
        const { resource, id } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        const currentItems = getResourceItems(resource);
        const currentItem = currentItems.find((it) => it.id === id) || null;
        if (currentItem === null) {
            send(res, 404);
            res.end();
            return;
        }
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const newItem = {
            ...currentItem,
            id: `${getNextId(currentItems)}`,
            created_at: now,
            updated_at: now,
        };
        addResourceItem(resource, newItem);
        send(res, 200, newItem);
        res.end();
    });

    /**
     * Resource delete
     */

    router.delete('/:resource/trash/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        // TODO implement trashed state
        return deleteResource(req, res);
    });

    router.post('/:resource/restore/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        // TODO implement trashed state...
        res.sendStatus(200);
    });

    router.delete('/:resource/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            send(res, 404);
            res.end();
            return;
        }
        return deleteResource(req, res);
    });

    return router;
};
