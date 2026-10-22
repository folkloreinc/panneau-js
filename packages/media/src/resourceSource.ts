import type { DataAdapter } from '@panneau/data';
import { getAccept, getMaxSize } from '@panneau/fields';
import type { Field, Item, MediaInfo, Resource } from '@panneau/protocol';

import type { MediaSort, MediaSource, PickerMedia } from './picker/types';

/** What a library source needs of an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaSourceAdapter = Pick<DataAdapter, 'list' | 'get' | 'create' | 'update'>;

/** The library resource a source reads: a resource of kind `media` of the definition. */
export type MediaLibrary = Pick<
    Resource,
    'id' | 'label' | 'itemTitle' | 'fields' | 'list' | 'abilities'
>;

/** Fields a picker never edits: the original file, and what the backend computes. */
const READ_ONLY = new Set(['file', 'media']);

/** Sorts that make more sense from the largest or the latest. */
const DESCENDING = new Set(['createdAt', 'updatedAt', 'size', 'pixels', 'duration']);

function toPickerMedia(item: Item, itemTitle: string, fields: readonly Field[]): PickerMedia {
    const { file, media, createdAt } = item as Item & {
        file?: { name?: unknown } | null;
        media?: MediaInfo;
        createdAt?: unknown;
    };
    const title = item[itemTitle];
    const fileName = typeof file?.name === 'string' ? file.name : null;
    return {
        id: item.id,
        label: typeof title === 'string' && title !== '' ? title : (fileName ?? item.id),
        fileName,
        createdAt: typeof createdAt === 'string' ? createdAt : null,
        media: media ?? { type: 'other' },
        values: Object.fromEntries(fields.map((field) => [field.name, item[field.name]])),
    };
}

/** The sorts of a library: those of its list, the default one first. */
function sortsOf(library: MediaLibrary): MediaSort[] {
    const sorts = (library.list?.sorts ?? []).map((key): MediaSort => {
        const label = library.fields.find((field) => field.name === key)?.label;
        return {
            id: DESCENDING.has(key) ? `-${key}` : key,
            ...(label !== undefined ? { label } : {}),
        };
    });
    const preferred = library.list?.defaultSort?.split(',')[0];
    const first = sorts.find(
        (sort) => sort.id === preferred || sort.id.replace(/^-/, '') === preferred,
    );
    return first !== undefined ? [first, ...sorts.filter((sort) => sort !== first)] : sorts;
}

/**
 * The source of a library resource (`kind: "media"`, decision 0027), for the media picker:
 *
 * - `list()` sends `GET /resources/{library}` with `q`, `filter`, `sort`, and the page number as
 *   the cursor;
 * - `create()` sends `POST /resources/{library}` with `{ file: { upload, name, mime, size } }`,
 *   or the file itself;
 * - `update()` sends `PATCH /resources/{library}/{id}` with the values edited in the details.
 *
 * Its filters and sorts are those of the resource's list, its fields those of the resource except
 * `file` (none when the user can't update the library), and `canCreate` its `create` ability.
 */
export function createResourceMediaSource(
    adapter: MediaSourceAdapter,
    library: MediaLibrary,
): MediaSource {
    const itemTitle = library.itemTitle ?? 'name';
    const file = library.fields.find((field) => field.name === 'file');
    const fields =
        library.abilities?.update === false
            ? []
            : library.fields.filter((field) => !READ_ONLY.has(field.name));
    const read = (item: Item) => toPickerMedia(item, itemTitle, fields);
    return {
        id: library.id,
        label: library.label.plural,
        accept: file !== undefined ? getAccept(file) : null,
        maxSize: file !== undefined ? getMaxSize(file) : null,
        filters: (library.list?.filters ?? []).filter((filter) => filter.id !== 'type'),
        sorts: sortsOf(library),
        fields,
        canCreate: library.abilities?.create !== false,
        async list({ q, filter, sort, cursor }, options) {
            const page = cursor === null || cursor === undefined ? 1 : Number(cursor);
            const response = await adapter.list(
                library.id,
                {
                    page,
                    ...(q !== undefined && q !== '' ? { q } : {}),
                    ...(filter !== undefined ? { filter } : {}),
                    ...(sort !== undefined ? { sort: [sort] } : {}),
                },
                options,
            );
            return {
                items: response.data.map(read),
                nextCursor: page < response.meta.lastPage ? String(page + 1) : null,
                total: response.meta.total,
            };
        },
        async get(id, options) {
            return read(await adapter.get(library.id, id, options));
        },
        async create(file, options) {
            // With what the browser knows of the file, which the backend may check first.
            const value =
                file instanceof File
                    ? file
                    : {
                          upload: file.upload,
                          name: file.name,
                          ...(file.mime !== null ? { mime: file.mime } : {}),
                          ...(file.size !== null ? { size: file.size } : {}),
                      };
            return read(await adapter.create(library.id, { file: value }, options));
        },
        async update(id, values, options) {
            return read(await adapter.update(library.id, id, values, options));
        },
    };
}
