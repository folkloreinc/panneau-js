import Base from './Base';

class MediasApi extends Base {
    constructor(opts) {
        super({
            ...opts,
            routes: {
                index: 'medias',
                trashed: 'medias/trash',
                tags: 'medias/tags',
                show: 'medias/:media',
                store: 'medias',
                update: 'medias/:media',
                trash: 'medias/trash/:media',
                restore: 'medias/restore/:media',
                destroy: 'medias/:media',
                replace: 'medias/replace/:media',
                ...(opts?.routes || null),
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

    get(query: Record<string, unknown> = {}, page: number | null = 1, count: number | null = 10) {
        const finalQuery: Record<string, unknown> = {
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

    getTrashed(
        query: Record<string, unknown> = {},
        page: number | null = 1,
        count: number | null = 10,
    ) {
        return this.get({ trashed: true, ...query }, page, count);
    }

    getTags(query: Record<string, unknown> = {}, count: number | null = 10) {
        const finalQuery: Record<string, unknown> = {
            ...query,
        };
        if (count !== null) {
            finalQuery.count = count;
        }
        return this.requestGet(this.route('tags'), finalQuery);
    }

    create(data: Record<string, unknown>) {
        return this.requestPost(this.route('store'), data);
    }

    update(id: string, data: Record<string, unknown>) {
        return this.requestPut(
            this.route('update', {
                media: id,
            }),
            data,
        );
    }

    trash(id: string) {
        return this.requestDelete(
            this.route('trash', {
                media: id,
            }),
        );
    }

    restore(id: string) {
        return this.requestPost(
            this.route('restore', {
                media: id,
            }),
        );
    }

    destroy(id: string) {
        return this.requestDelete(
            this.route('destroy', {
                media: id,
            }),
        );
    }

    replace(id: string, data: Record<string, unknown>) {
        return this.requestPost(
            this.route('replace', {
                media: id,
            }),
            data,
        );
    }
}

export default MediasApi;
