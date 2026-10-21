import AwsS3 from '@uppy/aws-s3';
import Uppy, { type Body, type Meta, type UppyFile } from '@uppy/core';

import type { PresignedUploads } from '@panneau/data/uploads';
import type { Upload } from '@panneau/protocol';

import { matchesMime } from './files';

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

export interface UploaderOptions {
    /** Signs and completes uploads: `adapter.presignedUploads()` of `@panneau/data`. */
    uploads: PresignedUploads;
    /** Accepted MIME types (`image/*`). Others are refused before they are sent. */
    accept?: readonly string[] | null;
    /** Largest file, in bytes. Larger ones are refused before they are sent. */
    maxSize?: number | null;
    /** Called with each file once its upload is complete. */
    onUploaded: (file: UploadedFile, upload: Upload) => void;
    /** Called with each file refused before it was sent. */
    onRejected?: (file: File, reason: UploadRejection) => void;
    /** Files larger than this, in bytes, are sent in parts, which can pause and resume. Defaults to 10 MB. */
    multipartThreshold?: number;
    /**
     * Installs what sends files on the Uppy instance: `@uppy/aws-s3` with the backend's
     * signatures by default. Tests install a fake one.
     */
    install?: (uppy: Uppy<Meta, Body>, uploads: PresignedUploads) => void;
}

/** Uploads files directly to storage, with Uppy, and keeps their state for an upload list. */
export interface Uploader {
    /** The files being uploaded, in the order they were added. Done files leave the list. */
    getItems(): readonly UploadItem[];
    /** Calls the listener when the items change. Returns a function that unsubscribes. */
    subscribe(listener: () => void): () => void;
    /** Checks and sends files. */
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

const MB = 1024 * 1024;

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function installAwsS3(uppy: Uppy<Meta, Body>, uploads: PresignedUploads, threshold: number) {
    uppy.use(AwsS3<Meta, Body>, {
        // Uppy's request types are interfaces; the protocol's schema is an open object.
        signRequest: (request) => uploads.signRequest({ ...request }),
        shouldUseMultipart: (file) => (file.size ?? 0) > threshold,
    });
}

/**
 * An uploader on Uppy 6: files go to S3-compatible storage with URLs that the backend signs, in
 * parts when they are large, then each upload is completed with the backend (decision 0025).
 */
export function createUploader({
    uploads,
    accept = null,
    maxSize = null,
    onUploaded,
    onRejected,
    multipartThreshold = 10 * MB,
    install = (uppy, presigned) => installAwsS3(uppy, presigned, multipartThreshold),
}: UploaderOptions): Uploader {
    const uppy = new Uppy<Meta, Body>({ autoProceed: true, allowMultipleUploadBatches: true });
    install(uppy, uploads);

    // What Uppy doesn't track: files being completed with the backend, and why one failed.
    const completing = new Set<string>();
    const failures = new Map<string, string>();
    const listeners = new Set<() => void>();
    let items: readonly UploadItem[] = [];

    const toItem = (file: UppyFile<Meta, Body>): UploadItem => {
        const { bytesUploaded, bytesTotal } = file.progress;
        const failure = failures.get(file.id) ?? null;
        let status: UploadItemStatus = 'uploading';
        if (failure !== null) {
            status = 'failed';
        } else if (completing.has(file.id)) {
            status = 'completing';
        } else if (file.isPaused === true) {
            status = 'paused';
        }
        return {
            id: file.id,
            name: file.name,
            size: file.size,
            mime: file.type !== '' ? file.type : null,
            progress:
                typeof bytesUploaded === 'number' && bytesTotal !== null && bytesTotal > 0
                    ? Math.min(1, bytesUploaded / bytesTotal)
                    : null,
            status,
            error: failure,
            canPause: (file.size ?? 0) > multipartThreshold,
        };
    };

    const update = () => {
        items = uppy.getFiles().map(toItem);
        listeners.forEach((listener) => listener());
    };

    const forget = (id: string) => {
        completing.delete(id);
        failures.delete(id);
        if (uppy.getFile(id) !== undefined) {
            uppy.removeFile(id);
        }
    };

    uppy.on('state-update', update);
    uppy.on('upload-error', (file, error) => {
        if (file !== undefined) {
            failures.set(file.id, errorMessage(error));
            update();
        }
    });
    uppy.on('upload-success', (file, response) => {
        if (file === undefined) {
            return;
        }
        const key = typeof response.body?.key === 'string' ? response.body.key : null;
        if (key === null) {
            failures.set(file.id, 'The storage gave no key for this file.');
            update();
            return;
        }
        completing.add(file.id);
        update();
        uploads
            .complete(key, { name: file.name })
            .then((upload) => {
                forget(file.id);
                onUploaded(
                    {
                        upload: upload.id,
                        name: upload.name ?? file.name,
                        mime: upload.mime ?? (file.type !== '' ? file.type : null),
                        size: upload.size ?? file.size,
                    },
                    upload,
                );
            })
            .catch((error: unknown) => {
                completing.delete(file.id);
                failures.set(file.id, errorMessage(error));
                update();
            });
    });

    return {
        getItems: () => items,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        add(files) {
            for (const file of files) {
                if (accept !== null && accept.length > 0 && !matchesMime(file.type, accept)) {
                    onRejected?.(file, 'accept');
                } else if (maxSize !== null && file.size > maxSize) {
                    onRejected?.(file, 'maxSize');
                } else {
                    uppy.addFile({ name: file.name, type: file.type, data: file });
                }
            }
        },
        pause(id) {
            if (uppy.getFile(id)?.isPaused !== true) {
                uppy.pauseResume(id);
            }
        },
        resume(id) {
            if (uppy.getFile(id)?.isPaused === true) {
                uppy.pauseResume(id);
            }
        },
        cancel(id) {
            forget(id);
            update();
        },
        retry(id) {
            if (!failures.has(id)) {
                return;
            }
            failures.delete(id);
            update();
            void uppy.retryUpload(id);
        },
        destroy() {
            listeners.clear();
            uppy.destroy();
        },
    };
}
