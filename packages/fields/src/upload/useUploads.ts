import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { matchesMime } from './files';
import type { UploadItem, UploadRejection, UploadSource, UploadedFile, Uploader } from './types';

export interface UseUploadsOptions {
    /** Where files are uploaded. Without one, `add()` gives the files themselves. */
    source: UploadSource | null;
    /** Accepted MIME types (`image/*`). Others are refused before they are sent. */
    accept?: readonly string[] | null;
    /** Largest file, in bytes. Larger ones are refused before they are sent. */
    maxSize?: number | null;
    /** Called with each file once it is uploaded: its upload, or the file itself without a source. */
    onUploaded: (file: UploadedFile | File) => void;
    /** Called with each file refused before it was sent. */
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

function rejects(
    file: File,
    { accept, maxSize }: Pick<UseUploadsOptions, 'accept' | 'maxSize'>,
): UploadRejection | null {
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
 * Checks files against `accept` and `maxSize`, uploads them through an upload source, and gives
 * the state of each file for an upload list. Without a source, files are given back as they are,
 * to send in a multipart request. The uploader is made once per source, and stopped when the
 * component unmounts.
 */
export function useUploads(options: UseUploadsOptions): UseUploadsResult {
    // The latest callbacks and limits, read when files are added or uploaded.
    const latest = useRef(options);
    useEffect(() => {
        latest.current = options;
    });
    const { source } = options;
    const [state, setState] = useState<{ source: UploadSource; uploader: Uploader } | null>(null);
    const uploader = state !== null && state.source === source ? state.uploader : null;

    useEffect(() => {
        if (source === null) {
            return undefined;
        }
        const created = source.createUploader({
            onUploaded: (file) => latest.current.onUploaded(file),
        });
        setState({ source, uploader: created });
        return () => created.destroy();
    }, [source]);

    const items = useSyncExternalStore(
        (listener) => uploader?.subscribe(listener) ?? (() => undefined),
        () => uploader?.getItems() ?? NO_ITEMS,
        () => NO_ITEMS,
    );

    return {
        items,
        add(files) {
            for (const file of files) {
                const rejection = rejects(file, latest.current);
                if (rejection !== null) {
                    latest.current.onRejected?.(file, rejection);
                } else if (uploader === null) {
                    latest.current.onUploaded(file);
                } else {
                    uploader.add([file]);
                }
            }
        },
        pause: (id) => uploader?.pause(id),
        resume: (id) => uploader?.resume(id),
        cancel: (id) => uploader?.cancel(id),
        retry: (id) => uploader?.retry(id),
    };
}
