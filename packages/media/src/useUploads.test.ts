import { act, renderHook, waitFor } from '@testing-library/react';
import type { Body, Meta, Uppy } from '@uppy/core';
import { describe, expect, it, vi } from 'vitest';

import type { PresignedUploads } from '@panneau/data/uploads';

import { file } from './__fixtures__/render';
import { useUploads } from './useUploads';

const uploads: PresignedUploads = {
    signRequest: () => Promise.resolve({ url: 'https://storage.test/x' }),
    complete: (key, { name } = {}) => Promise.resolve({ id: 'upl_1', key, ...(name && { name }) }),
};

/** Sends each file at once, as `@uppy/aws-s3` reports a success. */
function installFake(uppy: Uppy<Meta, Body>) {
    uppy.addUploader(async (ids) => {
        for (const id of ids) {
            uppy.emit('upload-success', uppy.getFile(id), {
                status: 200,
                body: { key: 'u/upl_1' },
            });
        }
        await Promise.resolve();
    });
}

describe('useUploads', () => {
    it('uploads files directly to storage, and gives their upload', async () => {
        const onUploaded = vi.fn();
        const { result } = renderHook(() =>
            useUploads({ uploads, onUploaded, install: installFake }),
        );
        await waitFor(() => expect(result.current.items).toEqual([]));

        act(() => result.current.add([file('clip.mp4', 'video/mp4')]));

        await waitFor(() => expect(onUploaded).toHaveBeenCalledOnce());
        expect(onUploaded.mock.calls[0]?.[0]).toEqual({
            upload: 'upl_1',
            name: 'clip.mp4',
            mime: 'video/mp4',
            size: 10,
        });
    });

    it('gives the files themselves without direct uploads, and refuses others', () => {
        const onUploaded = vi.fn();
        const onRejected = vi.fn();
        const { result } = renderHook(() =>
            useUploads({ uploads: null, accept: ['text/*'], onUploaded, onRejected }),
        );
        const text = file('notes.txt', 'text/plain');
        const image = file('photo.jpg', 'image/jpeg');

        act(() => result.current.add([text, image]));

        expect(onUploaded).toHaveBeenCalledWith(text, null);
        expect(onRejected).toHaveBeenCalledWith(image, 'accept');
        expect(result.current.items).toEqual([]);
    });
});
