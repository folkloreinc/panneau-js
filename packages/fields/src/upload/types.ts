/** Where a file is: sent to storage, paused, completed with the backend, or failed. */
export type UploadItemStatus = 'uploading' | 'paused' | 'completing' | 'failed';

/** A file being uploaded, as an upload list shows it. */
export interface UploadItem {
    id: string;
    name: string;
    size: number | null;
    mime: string | null;
    /** From 0 to 1, or null until the upload reports one. */
    progress: number | null;
    status: UploadItemStatus;
    /** Why it failed. */
    error: string | null;
    /** Whether it can pause: only a file sent in parts can. */
    canPause: boolean;
}

/**
 * A file uploaded directly to storage: the reference that values send (`{ upload }`), with what
 * the browser knows of the file, so that fields can show it and check it before saving. Backends
 * only trust `upload`.
 */
export interface UploadedFile {
    upload: string;
    name: string;
    mime: string | null;
    size: number | null;
}

/** Why a file was refused before it was sent. */
export type UploadRejection = 'accept' | 'maxSize';

/** Uploads files and keeps their state, for an upload list. */
export interface Uploader {
    /** The files being uploaded, in the order they were added. Done files leave the list. */
    getItems(): readonly UploadItem[];
    /** Calls the listener when the items change. Returns a function that unsubscribes. */
    subscribe(listener: () => void): () => void;
    /** Sends files. */
    add(files: Iterable<File>): void;
    pause(id: string): void;
    resume(id: string): void;
    /** Stops a file and removes it from the list. */
    cancel(id: string): void;
    /** Sends a failed file again. */
    retry(id: string): void;
    /** Stops every upload. The uploader can't be used after. */
    destroy(): void;
}

/**
 * Where fields that take files upload them directly to storage (decision 0025):
 * `createUppyUploadSource()` of `@panneau/fields/uppy`, with the signing routes of the backend.
 * Without one, fields give the files themselves, which the adapter sends in `multipart/form-data`.
 */
export interface UploadSource {
    /** An uploader for a field, which calls `onUploaded` with each file once it is uploaded. */
    createUploader(options: { onUploaded: (file: UploadedFile) => void }): Uploader;
}
