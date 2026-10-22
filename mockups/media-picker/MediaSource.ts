/**
 * A sketch, for review, of the source the media picker would read. Nothing here is built or
 * published: once the UX is agreed, it moves to `@panneau/media` with its tests.
 *
 * The picker only knows `MediaSource`. Panneau gives one per library resource
 * (`createResourceMediaSource()`); a product with its own API implements it.
 */
import type { DataAdapter } from '@panneau/data';
import { type UploadedFile, getAccept, getMaxSize } from '@panneau/fields';
import type { Item, MediaInfo, Resource } from '@panneau/protocol';

/** The types of the type filter: `filter[type]` of a library (decision 0026). */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

/** A media as the picker shows and returns it. */
export interface PickerMedia {
    id: string;
    /** The title of the media: the `itemTitle` of a library. */
    label: string;
    /** The name of the original file, for the details. */
    fileName?: string | null;
    alt?: string | null;
    createdAt?: string | null;
    media: MediaInfo;
}

export interface MediaQuery {
    q?: string;
    /** Only these types. Empty or omitted: every type. */
    types?: readonly MediaType[];
    /** Where the previous page ended: `nextCursor` of that page. Omitted: the first page. */
    cursor?: string | null;
}

export interface MediaPage {
    items: PickerMedia[];
    /** Where the next page starts, or `null` on the last page. */
    nextCursor: string | null;
    /** How many media match the query, when the source knows. */
    total?: number | null;
}

export interface MediaRequestOptions {
    signal?: AbortSignal;
}

/** One library, as the picker reads it. */
export interface MediaSource {
    /** Unique among the sources given to a picker. */
    id: string;
    /** The name of the library, in the switcher: "Images", "Documents", "Médiathèque". */
    label: string;
    /** What the library takes, from the `file` field of its resource. */
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** Whether the user can add media to the library. Without it, the Upload tab is disabled. */
    canCreate: boolean;
    list(query: MediaQuery, options?: MediaRequestOptions): Promise<MediaPage>;
    /** One media, to refresh the ones being processed. */
    get(id: string, options?: MediaRequestOptions): Promise<PickerMedia>;
    /**
     * Makes a media of a file: an upload sent directly to storage (decision 0025), or the file
     * itself, which the source sends as it can.
     */
    create(file: UploadedFile | File, options?: MediaRequestOptions): Promise<PickerMedia>;
}

/** What a library source needs of an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaSourceAdapter = Pick<DataAdapter, 'list' | 'get' | 'create'>;

function toPickerMedia(item: Item, itemTitle: string): PickerMedia {
    const { file, media } = item as Item & {
        file?: { name?: string } | null;
        media: MediaInfo;
    };
    const title = item[itemTitle];
    return {
        id: item.id,
        label: typeof title === 'string' ? title : (file?.name ?? item.id),
        fileName: file?.name ?? null,
        media,
    };
}

/**
 * The source of a library resource (`kind: "media"`): `GET /resources/{library}` with `q`,
 * `filter[type]` and pages as cursors, and `POST /resources/{library}` with `{ file: { upload } }`.
 * The `media` field and `@panneau/app` make one for each library of the definition.
 */
export function createResourceMediaSource(
    adapter: MediaSourceAdapter,
    library: Pick<Resource, 'id' | 'label' | 'itemTitle' | 'fields' | 'abilities'>,
): MediaSource {
    const itemTitle = library.itemTitle ?? 'name';
    const file = library.fields.find((field) => field.name === 'file');
    return {
        id: library.id,
        label: library.label.plural,
        accept: file !== undefined ? getAccept(file) : null,
        maxSize: file !== undefined ? getMaxSize(file) : null,
        canCreate: library.abilities?.create !== false,
        async list({ q, types, cursor }, options) {
            const page = cursor === null || cursor === undefined ? 1 : Number(cursor);
            const response = await adapter.list(
                library.id,
                {
                    page,
                    ...(q !== undefined && q !== '' ? { q } : {}),
                    ...(types !== undefined && types.length > 0
                        ? { filter: { type: [...types] } }
                        : {}),
                },
                options,
            );
            return {
                items: response.data.map((item) => toPickerMedia(item, itemTitle)),
                nextCursor: page < response.meta.lastPage ? String(page + 1) : null,
                total: response.meta.total,
            };
        },
        async get(id, options) {
            return toPickerMedia(await adapter.get(library.id, id, options), itemTitle);
        },
        async create(upload, options) {
            const value = upload instanceof File ? upload : { upload: upload.upload };
            return toPickerMedia(
                await adapter.create(library.id, { file: value }, options),
                itemTitle,
            );
        },
    };
}
