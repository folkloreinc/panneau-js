import type { Body, Meta, Uppy } from '@uppy/core';
import { describe, expect, it, vi } from 'vitest';

import type { UploadedFile } from '../upload/types';
import { type PresignedUploadsLike, createUppyUploadSource, createUppyUploader } from './uploader';

/** Signs nothing, and completes each key as an upload named after it. */
function createUploads(complete?: PresignedUploadsLike['complete']): PresignedUploadsLike {
    return {
        signRequest: () => Promise.resolve({ url: 'https://storage.test/x' }),
        complete:
            complete ??
            ((key, { name } = {}) =>
                Promise.resolve({ id: key.replace('uploads/', ''), key, ...(name && { name }) })),
    };
}

/**
 * Sends files like `@uppy/aws-s3` reports them: progress, then success with the key the backend
 * chose. A file named `fail…` fails, until it is retried.
 */
function installFake(uppy: Uppy<Meta, Body>) {
    let next = 1;
    const failed = new Set<string>();
    uppy.addUploader(async (ids) => {
        for (const id of ids) {
            const file = uppy.getFile(id);
            const total = file.size ?? 0;
            uppy.emit('upload-progress', file, {
                uploadStarted: Date.now(),
                bytesUploaded: total / 2,
                bytesTotal: total,
            });
            if (file.name.startsWith('fail') && !failed.has(id)) {
                failed.add(id);
                uppy.emit('upload-error', file, new Error('Network error'));
                continue;
            }
            const key = `uploads/upl_${String(next++)}`;
            uppy.emit('upload-success', file, { status: 200, body: { key } });
        }
        await Promise.resolve();
    });
}

const file = (name: string, type: string, size = 10) =>
    new File([new Uint8Array(size)], name, { type });

describe('createUppyUploader', () => {
    it('completes each upload with the backend, and gives its reference', async () => {
        const onUploaded = vi.fn<(file: UploadedFile) => void>();
        const uploader = createUppyUploadSource(createUploads(), {
            install: installFake,
        }).createUploader({ onUploaded });

        uploader.add([file('terms.pdf', 'application/pdf'), file('photo.jpg', 'image/jpeg', 20)]);

        await vi.waitFor(() => expect(onUploaded).toHaveBeenCalledTimes(2));
        expect(onUploaded.mock.calls.map(([uploaded]) => uploaded)).toEqual([
            { upload: 'upl_1', name: 'terms.pdf', mime: 'application/pdf', size: 10 },
            { upload: 'upl_2', name: 'photo.jpg', mime: 'image/jpeg', size: 20 },
        ]);
        expect(uploader.getItems()).toEqual([]);
    });

    it('keeps a failed file with its error, and sends it again on retry', async () => {
        const onUploaded = vi.fn();
        const listener = vi.fn();
        const uploader = createUppyUploader(createUploads(), { onUploaded, install: installFake });
        uploader.subscribe(listener);

        uploader.add([file('fail.csv', 'text/csv')]);

        await vi.waitFor(() => expect(uploader.getItems()[0]?.status).toBe('failed'));
        expect(uploader.getItems()[0]).toMatchObject({
            name: 'fail.csv',
            error: 'Network error',
            canPause: false,
        });
        expect(listener).toHaveBeenCalled();

        uploader.retry(uploader.getItems()[0]?.id ?? '');

        await vi.waitFor(() => expect(onUploaded).toHaveBeenCalledOnce());
        expect(uploader.getItems()).toEqual([]);
    });

    it('fails a file whose completion the backend refuses, and cancels it', async () => {
        const uploader = createUppyUploader(
            createUploads(() => Promise.reject(new Error('Upload not found.'))),
            { onUploaded: vi.fn(), install: installFake },
        );

        uploader.add([file('clip.mp4', 'video/mp4')]);

        await vi.waitFor(() =>
            expect(uploader.getItems()[0]).toMatchObject({
                status: 'failed',
                error: 'Upload not found.',
            }),
        );
        uploader.cancel(uploader.getItems()[0]?.id ?? '');
        expect(uploader.getItems()).toEqual([]);
    });
});
