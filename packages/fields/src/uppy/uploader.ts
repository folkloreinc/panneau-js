import AwsS3 from '@uppy/aws-s3';
import Uppy, { type Body, type Meta, type UppyFile } from '@uppy/core';

import type { Upload, UploadSignRequest } from '@panneau/protocol';

import type {
    UploadItem,
    UploadItemStatus,
    UploadSource,
    UploadedFile,
    Uploader,
} from '../upload/types';

/**
 * Signs and completes direct uploads: `adapter.presignedUploads()` of `@panneau/data` (or
 * `createPresignedUploads()`) gives one.
 */
export interface PresignedUploadsLike {
    signRequest(
        request: UploadSignRequest,
    ): Promise<{ url: string; key?: string; headers?: Record<string, string> }>;
    complete(key: string, options?: { name?: string }): Promise<Upload>;
}

export interface UppyUploadSourceOptions {
    /** Files larger than this, in bytes, are sent in parts, which can pause and resume. Defaults to 10 MB. */
    multipartThreshold?: number;
    /**
     * Installs what sends files on each Uppy instance: `@uppy/aws-s3` with the backend's
     * signatures by default. Tests install a fake one.
     */
    install?: (uppy: Uppy<Meta, Body>, uploads: PresignedUploadsLike) => void;
}

const MB = 1024 * 1024;

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function installAwsS3(uppy: Uppy<Meta, Body>, uploads: PresignedUploadsLike, threshold: number) {
    uppy.use(AwsS3<Meta, Body>, {
        // Uppy's request types are interfaces; the protocol's schema is an open object.
        signRequest: (request) => uploads.signRequest({ ...request }),
        shouldUseMultipart: (file) => (file.size ?? 0) > threshold,
    });
}

/**
 * An uploader on Uppy 6: files go to S3-compatible storage with URLs that the backend signs, in
 * parts when they are large, then each upload is completed with the backend.
 */
export function createUppyUploader(
    uploads: PresignedUploadsLike,
    {
        onUploaded,
        multipartThreshold = 10 * MB,
        install = (uppy, presigned) => installAwsS3(uppy, presigned, multipartThreshold),
    }: UppyUploadSourceOptions & { onUploaded: (file: UploadedFile, upload: Upload) => void },
): Uploader {
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
                uppy.addFile({ name: file.name, type: file.type, data: file });
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

/**
 * The upload source of fields on Uppy 6 (`@uppy/core` and `@uppy/aws-s3`, optional peer
 * dependencies of this entry point): pass it as `uploadSource` to `FieldsProvider` or
 * `FormView`, with the signing routes of the backend.
 *
 * ```ts
 * const uploadSource = createUppyUploadSource(adapter.presignedUploads());
 * ```
 */
export function createUppyUploadSource(
    uploads: PresignedUploadsLike,
    options: UppyUploadSourceOptions = {},
): UploadSource {
    return {
        createUploader: ({ onUploaded }) => createUppyUploader(uploads, { ...options, onUploaded }),
    };
}
