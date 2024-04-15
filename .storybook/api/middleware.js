const path = require('path');
const fs = require('fs');
const express = require('express');
const _ = require('lodash');
const dayjs = require('dayjs');
const { sync: globSync } = require('glob');
const isString = require('lodash/isString');
const isArray = require('lodash/isArray');

module.exports = () => {
    const router = express.Router();

    router.use(express.json());
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

    const getItemsPage = (items, page, count) => {
        const startIndex = (page - 1) * count;
        const endIndex = startIndex + count;
        const total = items.length;
        const lastPage = Math.ceil(total / count);
        return {
            pagination: { page, last_page: lastPage, total, per_page: count },
            data: items.slice(startIndex, endIndex),
        };
    };

    const sortItems = (items, field = null, direction = 'asc') => {
        if (field === null) {
            return items;
        }
        const sortedItems = _.sortBy(items, field);
        return direction.toLowerCase() === 'desc' ? _.reverse(sortedItems) : sortedItems;
    };

    const filterItems = (items, query = null) => {
        if (query === null || Object.keys(query).length === 0) {
            return items;
        }

        // Types is exception for medias so u get results
        const { source, search = null, types = null, ...queryWithoutSource } = query;

        if (search !== null) {
            return _.values(
                _.filter(items, (it) =>
                    it !== null && typeof it.title !== 'undefined' && isString(it.title)
                        ? it.title.indexOf(search) !== -1
                        : true,
                ),
            );
        }

        if (isArray(types) && types !== null) {
            return _.values(
                _.filter(items, (it) =>
                    it !== null && typeof it.type !== 'undefined' && isString(it.type)
                        ? types.indexOf(it.type) !== -1
                        : true,
                ),
            );
        }

        return _.values(_.filter(items, _.matches(queryWithoutSource)));
    };

    const getNextId = (items) =>
        items.reduce((nextId, { id }) => (parseInt(id, 10) >= nextId ? nextId + 1 : nextId), 1);

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
        const foundResource =
            updatedResources[resource].find((it) => it.id === newItem.id) === null;
        if (foundResource === null) {
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

    router.use(
        '/',
        express.static(dataPath, {
            index: false,
            extensions: ['json'],
        }),
    );

    let loggedInUser = require(path.join(dataPath, '/me'));

    router.get('/auth/check', (req, res) => {
        res.json(loggedInUser);
        res.end();
    });

    router.post('/auth/login', (req, res) => {
        loggedInUser = require(path.join(dataPath, '/me'));
        res.json(loggedInUser);
        res.end();
    });

    router.post('/auth/logout', (req, res) => {
        loggedInUser = null;
        res.json(loggedInUser);
        res.end();
    });

    router.get('/csrf-cookie', (req, res) => {
        res.json(null);
        res.end();
    });

    router.post('/batch', (req, res) => {
        res.json(['123']);
        res.end();
    });

    /**
     * Resource index
     */
    router.get('/:resource', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            res.sendStatus(404);
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
        // console.log('query', query);
        const items = getResourceItems(resource);
        const filteredItems = sortItems(filterItems(items, query), sort, sortDirection);

        if (page !== null) {
            res.json(
                getItemsPage(
                    filteredItems,
                    parseInt(page, 10),
                    parseInt(count || defaultCount, 10),
                ),
            );
        } else {
            res.json(
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
            res.sendStatus(404);
            return;
        }
        const { id: itemId } = req.params;
        const items = getResourceItems(resource);
        const item = items.find(({ id, slug = null }) => id === itemId || slug === itemId) || null;
        if (item === null) {
            res.sendStatus(404);
            return;
        }
        res.json(item);
        res.end();
    });

    /**
     * Resource store
     */
    router.post('/:resource', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            res.sendStatus(404);
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
        // console.log('create', newItem);
        res.json(newItem);
        res.end();
    });

    const updateResource = (req, res) => {
        const { resource, id } = req.params;
        const currentItems = getResourceItems(resource);
        const currentItem = currentItems.find((it) => it.id === id) || null;
        if (currentItem === null) {
            res.sendStatus(404);
            return;
        }
        const { _method, ...item } = req.body;
        // console.log('update item', item);
        const newItem = {
            ...currentItem,
            ...item,
            updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        // console.log('update', newItem);
        updateResourceItem(resource, newItem);
        res.json(newItem);
        res.end();
    };

    const deleteResource = (req, res) => {
        const { resource, id } = req.params;
        const currentItems = getResourceItems(resource);
        const currentItem = currentItems.find((it) => it.id === id) || null;
        if (currentItem === null) {
            res.sendStatus(404);
            return;
        }
        deleteResourceItem(resource, id);
        res.json(currentItem);
        res.end();
    };

    /**
     * Resource update
     */
    router.post('/:resource/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            res.sendStatus(404);
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
     * Resource delete
     */
    router.delete('/:resource/:id', (req, res) => {
        const { resource } = req.params;
        if (!resourceExists(resource)) {
            res.sendStatus(404);
            return;
        }
        deleteResource(req, res);
    });

    return router;
};
