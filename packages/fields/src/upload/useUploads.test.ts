import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { UploadSource, UploadedFile, Uploader } from './types';
import { useUploads } from './useUploads';

const file = (name: string, type: string, size = 10) =>
    new File([new Uint8Array(size)], name, { type });

/** A source that uploads each file at once, as `upl_1`, `upl_2`… */
function createSource(): UploadSource & { destroyed: number } {
    const source = {
        destroyed: 0,
        createUploader({ onUploaded }: { onUploaded: (file: UploadedFile) => void }): Uploader {
            let next = 1;
            return {
                getItems: () => [],
                subscribe: () => () => undefined,
                add(files) {
                    for (const added of files) {
                        onUploaded({
                            upload: `upl_${String(next++)}`,
                            name: added.name,
                            mime: added.type,
                            size: added.size,
                        });
                    }
                },
                pause: () => undefined,
                resume: () => undefined,
                cancel: () => undefined,
                retry: () => undefined,
                destroy: () => {
                    source.destroyed += 1;
                },
            };
        },
    };
    return source;
}

describe('useUploads', () => {
    it('uploads files through its source, and gives their upload', async () => {
        const source = createSource();
        const onUploaded = vi.fn();
        const { result, unmount } = renderHook(() => useUploads({ source, onUploaded }));
        // The uploader is made after the first render.
        await waitFor(() => expect(result.current.items).toEqual([]));
        await act(async () => {
            await Promise.resolve();
        });

        act(() => result.current.add([file('clip.mp4', 'video/mp4')]));

        expect(onUploaded).toHaveBeenCalledWith({
            upload: 'upl_1',
            name: 'clip.mp4',
            mime: 'video/mp4',
            size: 10,
        });
        unmount();
        expect(source.destroyed).toBe(1);
    });

    it('gives the files themselves without a source, and refuses others', () => {
        const onUploaded = vi.fn();
        const onRejected = vi.fn();
        const { result } = renderHook(() =>
            useUploads({ source: null, accept: ['text/*'], maxSize: 100, onUploaded, onRejected }),
        );
        const text = file('notes.txt', 'text/plain');
        const image = file('photo.jpg', 'image/jpeg');
        const large = file('big.txt', 'text/plain', 200);

        act(() => result.current.add([text, image, large]));

        expect(onUploaded).toHaveBeenCalledExactlyOnceWith(text);
        expect(onRejected.mock.calls).toEqual([
            [image, 'accept'],
            [large, 'maxSize'],
        ]);
        expect(result.current.items).toEqual([]);
    });
});
