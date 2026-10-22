/**
 * A sketch, for review, of the source the media picker would read, and of the picker's props.
 * Nothing here is built or published: it moves to `@panneau/media` with its tests when the picker
 * is built.
 *
 * The picker only knows `MediaSource`. Panneau gives one per library resource
 * (`createResourceMediaSource()`); a product with its own API implements it.
 */
import type { DataAdapter, Values } from '@panneau/data';
import { type UploadedFile, getAccept, getMaxSize } from '@panneau/fields';
import type {
    Field,
    Filter,
    FilterValue,
    Item,
    MediaInfo,
    MediaReference,
    Resource,
} from '@panneau/protocol';

/** The types of the built-in type filter: `filter[type]` of a library (decision 0026). */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

/** A media as the picker shows and returns it. */
export interface PickerMedia {
    id: string;
    /** The title of the media: the `itemTitle` of a library. */
    label: string;
    /** The name of the original file, for the details. */
    fileName?: string | null;
    createdAt?: string | null;
    media: MediaInfo;
    /** The values of the fields the picker can edit: alt text, description, tags… */
    values?: Record<string, unknown>;
}

/** A way to sort a library: `-createdAt`, `name`, `-size`, `-duration`… */
export interface MediaSort {
    /** Sent as `sort`, in the protocol's format: a `-` prefix sorts descending. */
    id: string;
    label: string;
}

export interface MediaQuery {
    q?: string;
    /** Values of the filters, keyed by filter id: `type`, and the library's or the opener's. */
    filter?: Record<string, FilterValue>;
    /** The id of one of the source's sorts. */
    sort?: string;
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
    /** The filters the library offers, after the built-in type filter: tags, author… */
    filters?: readonly Filter[];
    /** The sorts the library offers. The first one is the default. */
    sorts?: readonly MediaSort[];
    /** The fields of a media the picker can edit in its details. Empty: read-only details. */
    fields?: readonly Field[];
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
    /** Saves the values of `fields` edited in the details. Required when `fields` isn't empty. */
    update?(id: string, values: Values, options?: MediaRequestOptions): Promise<PickerMedia>;
}

/** The sorts every library gets, when its definition doesn't list its own. */
export const DEFAULT_SORTS: readonly MediaSort[] = [
    { id: '-createdAt', label: 'Newest' },
    { id: 'createdAt', label: 'Oldest' },
    { id: 'name', label: 'Name' },
    { id: '-size', label: 'File size' },
    { id: '-pixels', label: 'Dimensions' },
    { id: '-duration', label: 'Duration' },
];

/** The media the picker returns: with the source each one comes from. */
export interface PickedMedia extends MediaReference {
    source: string;
}

/**
 * The props of the picker. It opens as a dialog, controlled by `isOpen`, from the `media` field or
 * from a product's own screen.
 */
export interface MediaPickerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    /**
     * The libraries the user can pick from, in the switcher's order. The opener restricts the
     * picker to one or several libraries by giving only those.
     */
    sources: readonly MediaSource[];
    /** The library shown first. Defaults to the first one. */
    source?: string;
    multiple?: boolean;
    /** Media that don't match are shown, greyed out, with the reason: the field's rules. */
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** Filters the opener applies and the user can't change: the picker shows them as locked. */
    filter?: Record<string, FilterValue>;
    /** Filters the opener adds to those of the libraries. */
    filters?: readonly Filter[];
    /** Sorts the opener adds to those of the libraries, and the one it starts with. */
    sorts?: readonly MediaSort[];
    sort?: string;
    /** The media of the field's value: marked "Current", and replaced by a single pick. */
    value?: readonly MediaReference[];
    title?: string;
    /** The label of the primary button, with the number of media selected. */
    confirmLabel?: string | ((count: number) => string);
    /** With a single media: confirms as soon as a file is uploaded and made a media. */
    confirmOnUpload?: boolean;
    /**
     * Keeps the query, the pages loaded and the scroll position of each library under this key
     * when the picker closes, so that it opens again where the user left it.
     */
    stateKey?: string;
    onSelect: (media: PickedMedia[]) => void;
}

/** What a library source needs of an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaSourceAdapter = Pick<DataAdapter, 'list' | 'get' | 'create' | 'update'>;

/** Fields a picker never edits: the original file, and what the backend computes. */
const READ_ONLY_FIELDS = new Set(['file', 'media']);

function toPickerMedia(item: Item, itemTitle: string, fields: readonly Field[]): PickerMedia {
    const { file, media, createdAt } = item as Item & {
        file?: { name?: string } | null;
        media: MediaInfo;
        createdAt?: string;
    };
    const title = item[itemTitle];
    return {
        id: item.id,
        label: typeof title === 'string' ? title : (file?.name ?? item.id),
        fileName: file?.name ?? null,
        createdAt: createdAt ?? null,
        media,
        values: Object.fromEntries(fields.map((field) => [field.name, item[field.name]])),
    };
}

/**
 * The source of a library resource (`kind: "media"`): `GET /resources/{library}` with `q`,
 * `filter`, `sort` and pages as cursors, `POST /resources/{library}` with `{ file: { upload } }`,
 * and `PATCH` for the fields edited in the details. Its filters and sorts are those of the
 * resource's list; its fields, those of the resource that can be updated. The `media` field and
 * `@panneau/app` make one for each library the field allows.
 */
export function createResourceMediaSource(
    adapter: MediaSourceAdapter,
    library: Pick<Resource, 'id' | 'label' | 'itemTitle' | 'fields' | 'list' | 'abilities'>,
): MediaSource {
    const itemTitle = library.itemTitle ?? 'name';
    const file = library.fields.find((field) => field.name === 'file');
    const fields =
        library.abilities?.update === false
            ? []
            : library.fields.filter((field) => !READ_ONLY_FIELDS.has(field.name));
    const sorts = library.list?.sorts?.map((sort) => ({ id: sort, label: sort })) ?? DEFAULT_SORTS;
    const read = (item: Item) => toPickerMedia(item, itemTitle, fields);
    return {
        id: library.id,
        label: library.label.plural,
        accept: file !== undefined ? getAccept(file) : null,
        maxSize: file !== undefined ? getMaxSize(file) : null,
        filters: (library.list?.filters ?? []).filter((filter) => filter.id !== 'type'),
        sorts,
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
        async create(upload, options) {
            const value = upload instanceof File ? upload : { upload: upload.upload };
            return read(await adapter.create(library.id, { file: value }, options));
        },
        async update(id, values, options) {
            return read(await adapter.update(library.id, id, values, options));
        },
    };
}
