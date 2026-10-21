import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { PresignedUploads } from '@panneau/data/uploads';
import type { Upload } from '@panneau/protocol';

import { matchesMime } from './files';
import {
    type UploadItem,
    type UploadRejection,
    type UploadedFile,
    type Uploader,
    type UploaderOptions,
    createUploader,
} from './uploader';

export interface UseUploadsOptions extends Pick<
    UploaderOptions,
    'accept' | 'maxSize' | 'multipartThreshold' | 'install'
> {
    /** Signs and completes uploads. Without them, `add()` gives the files themselves. */
    uploads: PresignedUploads | null;
    /** Called with each file once it is uploaded: its upload, or the file itself without `uploads`. */
    onUploaded: (file: UploadedFile | File, upload: Upload | null) => void;
    onRejected?: (file: File, reason: UploadRejection) => void;
}

export interface UseUploadsResult {
    /** The files being uploaded. */
    items: readonly UploadItem[];
    add: (files: Iterable<File>) => void;
    pause: (id: string) => void;
    resume: (id: string) => void;
    cancel: (id: string) => void;
    retry: (id: string) => void;
}

const NO_ITEMS: readonly UploadItem[] = [];

function accepts(file: File, { accept, maxSize }: Pick<UseUploadsOptions, 'accept' | 'maxSize'>) {
    if (
        accept !== null &&
        accept !== undefined &&
        accept.length > 0 &&
        !matchesMime(file.type, accept)
    ) {
        return 'accept';
    }
    return maxSize !== null && maxSize !== undefined && file.size > maxSize ? 'maxSize' : null;
}

/**
 * Uploads files directly to storage with Uppy (`createUploader()`), and gives the state of each
 * file for an upload list. Without `uploads` (a backend without direct uploads), files are given
 * back as they are, to send in a multipart request. The uploader is made once per `uploads`, and
 * stopped when the component unmounts.
 */
export function useUploads(options: UseUploadsOptions): UseUploadsResult {
    // The latest callbacks and limits, read when files are added or uploaded.
    const latest = useRef(options);
    useEffect(() => {
        latest.current = options;
    });
    const { uploads, multipartThreshold, install } = options;
    const [uploader, setUploader] = useState<{
        uploads: PresignedUploads;
        uploader: Uploader;
    } | null>(null);
    const current = uploader !== null && uploader.uploads === uploads ? uploader.uploader : null;

    useEffect(() => {
        if (uploads === null) {
            return undefined;
        }
        const created = createUploader({
            uploads,
            ...(multipartThreshold !== undefined && { multipartThreshold }),
            ...(install !== undefined && { install }),
            onUploaded: (file, upload) => latest.current.onUploaded(file, upload),
        });
        setUploader({ uploads, uploader: created });
        return () => created.destroy();
    }, [uploads, multipartThreshold, install]);

    const items = useSyncExternalStore(
        (listener) => current?.subscribe(listener) ?? (() => undefined),
        () => current?.getItems() ?? NO_ITEMS,
        () => NO_ITEMS,
    );

    return {
        items,
        add(files) {
            for (const file of files) {
                const rejection = accepts(file, latest.current);
                if (rejection !== null) {
                    latest.current.onRejected?.(file, rejection);
                } else if (current === null) {
                    latest.current.onUploaded(file, null);
                } else {
                    current.add([file]);
                }
            }
        },
        pause: (id) => current?.pause(id),
        resume: (id) => current?.resume(id),
        cancel: (id) => current?.cancel(id),
        retry: (id) => current?.retry(id),
    };
}
