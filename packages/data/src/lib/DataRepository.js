class DataRepository {
    constructor({ types = [], store, api }) {
        this.store = store;
        this.api = api;

        this.buildTypesApi(types);
    }

    buildTypesApi(types) {
        types.forEach(type => {
            this[type] = this.getTypeApi(type);
        });
    }

    getTypeApi(type) {
        return {
            find: (...args) => this.findEntity(type, ...args),
            get: (...args) => this.getEntities(type, ...args),
            create: (...args) => this.createEntity(type, ...args),
            update: (...args) => this.updateEntity(type, ...args),
            delete: (...args) => this.deleteEntity(type, ...args),
        };
    }

    findEntity(type, key) {
        return this.store
            .itemExists(type, key)
            .catch(() => this.api.find(type, key).then(item => this.store.storeItem(type, key, item)))
            .then(() => this.store.findItem(type, key));
    }

    getEntities(type, query = null, fresh = false) {
        if (fresh) {
            return this.api
                .get(type, query)
                .then(items => this.store.storeQuery(type, query, items));
        }
        return this.store
            .queryExists(type, query)
            .catch(() =>
                this.api.get(type, query).then(items => this.store.storeQuery(type, query, items)),
            )
            .then(() => this.store.getItems(type, query));
    }

    createEntity(type, data) {
        return this.api
            .store(type, data)
            .then(({ key, item }) => this.store.storeItem(type, key, item));
    }

    updateEntity(type, key, data) {
        return this.api.update(type, key, data).then(item => this.store.updateItem(type, key, item));
    }

    deleteEntity(type, key) {
        return this.api.delete(type, key).then(() => this.store.deleteItem(type, key));
    }
}

export default DataRepository;
