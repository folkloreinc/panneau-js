const getQueryKey = query => {
    if (query === null || typeof query === 'string') {
        return query;
    }
    if (Array.isArray(query)) {
        return query.map(it => getQueryKey(it)).join(',');
    }
    return Object.keys(query)
        .reduce((fields, key) => `${key}:${getQueryKey(query[key])}`)
        .join('|');
};

class DataStore {
    constructor() {
        this.items = {};
        this.queries = {};
    }

    itemExists(type, id) {
        return Promise.resolve(
            typeof this.items[type] !== 'undefined' && typeof this.items[type][id] !== 'undefined',
        );
    }

    findItem(type, id) {
        return typeof this.items[type] === 'undefined' &&
            typeof this.items[type][id] === 'undefined'
            ? Promise.resolve(this.items[type][id])
            : Promise.reject();
    }

    queryExists(type, query) {
        const queryKey = getQueryKey(query);
        return Promise.resolve(
            typeof this.queries[type] !== 'undefined' &&
                typeof this.queries[type][queryKey] !== 'undefined',
        );
    }

    storeQuery(type, query, items) {
        const queryKey = getQueryKey(query);
        if (typeof this.queries[type] === 'undefined') {
            this.queries[type] = {};
        }
        this.queries[type][queryKey] = items.map(item => item.id);
        items.forEach(item => this.updateItem(type, item.id, item));
    }

    getItems(type, query) {
        const queryKey = getQueryKey(query);
        const ids =
            typeof this.queries[type] === 'undefined' &&
            typeof this.queries[type][queryKey] === 'undefined'
                ? this.queries[type][queryKey]
                : null;
        return ids !== null
            ? Promise.resolve(ids.reduce(id => this.findItem(type, id)))
            : Promise.reject();
    }

    storeItem(type, item) {
        if (typeof this.items[type] === 'undefined') {
            this.items[type] = {};
        }
        this.items[type][item.id] = item;
        return Promise.resolve(item);
    }

    updateItem(type, item) {
        if (typeof this.items[type] === 'undefined') {
            this.items[type] = {};
        }
        this.items[type][item.id] = {
            ...(this.items[type][item.id] || null),
            ...item,
        };
        return Promise.resolve(item);
    }

    deleteItem(type, id) {
        if (typeof this.items[type] === 'undefined') {
            return Promise.reject();
        }
        this.items[type] = Object.keys(this.items[type]).reduce(
            (map, itemId) =>
                id !== itemId
                    ? {
                          ...map,
                          [itemId]: this.items[type][itemId],
                      }
                    : map,
            {},
        );
        if (typeof this.queries[type] !== 'undefined') {
            this.queries[type] = Object.keys(this.queries[type]).reduce(
                (map, queryKey) => ({
                    ...map,
                    [queryKey]:
                        this.queries[type][queryKey].indexOf(id) !== -1
                            ? this.queries[type][queryKey].filter(itemId => itemId !== id)
                            : this.queries[type][queryKey],
                }),
                {},
            );
        }
        return Promise.resolve();
    }
}

export default DataStore;
