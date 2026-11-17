import type { UploadSource, UploadedFile } from '@panneau/fields';
import type { Field, Filter, FilterValue, MediaInfo, MediaReference } from '@panneau/protocol';

/** The types of the built-in type filter: `filter[type]` of a library (decision 0026). */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

/** A media as a source gives it to the picker. */
export interface PickerMedia {
    id: string;
    /** The title of the media: the `itemTitle` of a library. */
    label: string;
    /** The name of the original file, for the details. */
    fileName?: string | null;
    /** When the media was added: an ISO 8601 date, for the details. */
    createdAt?: string | null;
    media: MediaInfo;
    /** The values of the source's `fields`, which the details edit. */
    values?: Record<string, unknown>;
    /**
     * The page of the media in the product, where it does more than the details: `MediaLibrary`
     * links to it from the details. The picker doesn't, so as not to leave its dialog.
     */
    href?: string | null;
}

/** A way to sort a source. */
export interface MediaSort {
    /** Sent as `sort`, in the protocol's format: a `-` prefix sorts descending (`-createdAt`). */
    id: string;
    /**
     * Shown in the sort menu. Without it, the picker names the sorts it knows (`-createdAt`,
     * `createdAt`, `name`, `-size`, `-pixels`, `-duration`), and shows the id of the others.
     */
    label?: string;
}

export interface MediaQuery {
    q?: string;
    /** Values of the filters, by id: `type`, the source's filters and the opener's. */
    filter?: Record<string, FilterValue>;
    /** The id of one of the sorts. */
    sort?: string;
    /** Where the previous page ended: its `nextCursor`. Omitted: the first page. */
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

/**
 * One library, as the picker reads it (decision 0027). `createResourceMediaSource()` of
 * `@panneau/media` gives one for a library resource; a product implements it on its own API.
 */
export interface MediaSource {
    /** Unique among the sources of a picker: the library's resource, for Panneau's sources. */
    id: string;
    /** The name of the library, in the switcher: "Images", "Médiathèque". */
    label: string;
    /** What the library takes: media that don't match are greyed out. */
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** The library's filters, after the type filter. `select`, `toggle` and `text` are shown. */
    filters?: readonly Filter[];
    /** The library's sorts. The first one is the default. */
    sorts?: readonly MediaSort[];
    /** The fields the details edit, with `update()`. Empty or omitted: read-only details. */
    fields?: readonly Field[];
    /** Whether the user can add media to the library. Without it, the Upload tab is disabled. */
    canCreate: boolean;
    list(query: MediaQuery, options?: MediaRequestOptions): Promise<MediaPage>;
    /** One media, to follow the ones being processed. */
    get(id: string, options?: MediaRequestOptions): Promise<PickerMedia>;
    /** Makes a media of a file: an upload sent directly to storage, or the file itself. */
    create(file: UploadedFile | File, options?: MediaRequestOptions): Promise<PickerMedia>;
    /** Saves the values of `fields` edited in the details. */
    update?(
        id: string,
        values: Record<string, unknown>,
        options?: MediaRequestOptions,
    ): Promise<PickerMedia>;
}

/** What a library shows: its sources, their query and its uploads (`MediaLibrary`, `MediaPicker`). */
export interface MediaLibraryOptions {
    /**
     * The libraries, in the order of the switcher. The opener restricts the library to some of
     * them by giving only their sources.
     */
    sources: readonly MediaSource[];
    /** The source shown first. Defaults to the first one. */
    source?: string;
    /** Media that don't match are shown greyed out, with the reason: the opener's rules. */
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** Filters the opener applies and the user can't change, shown as locked. */
    filter?: Readonly<Record<string, FilterValue>>;
    /** Filters the opener adds to those of the sources. */
    filters?: readonly Filter[];
    /** Sorts the opener adds to those of the sources. */
    sorts?: readonly MediaSort[];
    /** The sort the library starts with. Defaults to the source's first sort. */
    sort?: string;
    /**
     * Keeps the query, the pages and the scroll position of each source under this key, so that
     * the library opens again where the user left it.
     */
    stateKey?: string;
    /** Where files are uploaded directly. Defaults to the upload source of the fields context. */
    uploadSource?: UploadSource | null;
    /** How often to read media being processed again, in milliseconds. Defaults to 3 s. */
    refreshInterval?: number;
}

export interface MediaPickerProps extends MediaLibraryOptions {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    multiple?: boolean;
    /** The media of the opener's value: marked "Current", and replaced by a single pick. */
    value?: readonly MediaReference[];
    /** The title of the dialog. Defaults to "Choose media". */
    title?: string;
    /** The primary button, with the number of media selected. Defaults to "Select". */
    confirmLabel?: string | ((count: number) => string);
    /** With a single media: confirms as soon as an uploaded file is made a media. */
    confirmOnUpload?: boolean;
    /**
     * Called with the media chosen, each with its source as `resource`, then the picker closes.
     */
    onSelect: (media: MediaReference[]) => void;
}

/**
 * The library of the picker in a page (`MediaLibrary`): browse, search, filter, upload and edit
 * the details of media, with nothing to pick.
 */
export interface MediaLibraryProps extends MediaLibraryOptions {
    /** Names the region of the library for assistive technologies. Defaults to the library's. */
    'aria-label'?: string;
    className?: string;
}
