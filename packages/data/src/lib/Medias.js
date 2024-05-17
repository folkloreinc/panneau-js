import Base from './Base';

class MediasApi extends Base {
    constructor(opts = {}) {
        super({
            baseUrl: opts.baseUrl ? opts.baseUrl : null,
            routes: {
                index: 'medias',
                trashed: 'medias/trash',
                tags: 'medias/tags',
                show: 'medias/:media',
                store: 'medias',
                update: 'medias/:media',
                trash: 'medias/trash/:media',
                restore: 'medias/restore/:media',
                delete: 'medias/:media',
                replace: 'medias/replace/:media',
                ...(opts.routes || null),
            },
        });
    }

    find(id) {
        return this.requestGet(
            this.route('show', {
                media: id,
            }),
        );
    }

    get(query = {}, page = 1, count = 10) {
        const finalQuery = {
            ...query,
        };
        if (page !== null) {
            finalQuery.page = page;
        }
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.requestGet(this.route('index'), finalQuery);
    }

    getTrashed(query = {}, page = 1, count = 10) {
        const finalQuery = {
            ...query,
        };
        if (page !== null) {
            finalQuery.page = page;
        }
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.requestGet(this.route('trashed'), finalQuery);
    }

    getTags(query = {}, count = 10) {
        const finalQuery = {
            ...query,
        };
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.requestGet(this.route('tags'), finalQuery);
    }

    create(data) {
        return this.requestPost(this.route('store'), data);
    }

    update(id, data) {
        return this.requestPut(
            this.route('update', {
                media: id,
            }),
            data,
        );
    }

    trash(id) {
        return this.requestDelete(
            this.route('trash', {
                media: id,
            }),
        );
    }

    restore(id) {
        return this.requestPost(
            this.route('restore', {
                media: id
            })
        )
    }

    delete(id) {
        return this.requestDelete(
            this.route('delete', {
                media: id,
            }),
        );
    }

    replace(id, data) {
        return this.requestPost(
            this.route('replace', {
                media: id,
            }),
            data
        )
    }
}

export default MediasApi;
