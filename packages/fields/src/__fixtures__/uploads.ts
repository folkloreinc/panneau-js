import type { UploadItem, UploadSource, UploadedFile, Uploader } from '../upload/types';

export interface ExampleUploadSourceOptions {
    /** Time between two progress steps, in milliseconds. */
    interval?: number;
    /** Progress added at each step, from 0 to 1. */
    step?: number;
    /** Files larger than this, in bytes, can pause, as files sent in parts. */
    multipartThreshold?: number;
}

/**
 * An upload source that sends nothing: each file progresses on a timer, then becomes an upload
 * (`upl_1`, `upl_2`…). A file whose name starts with `fail` fails once, until it is retried.
 */
export function createExampleUploadSource({
    interval = 100,
    step = 0.25,
    multipartThreshold = 1024,
}: ExampleUploadSourceOptions = {}): UploadSource {
    let next = 1;
    let added = 0;
    return {
        createUploader({ onUploaded }: { onUploaded: (file: UploadedFile) => void }): Uploader {
            const files = new Map<string, File>();
            const failedOnce = new Set<string>();
            const listeners = new Set<() => void>();
            let items: readonly UploadItem[] = [];

            const emit = () => listeners.forEach((listener) => listener());
            const patch = (id: string, change: Partial<UploadItem>) => {
                items = items.map((item) => (item.id === id ? { ...item, ...change } : item));
                emit();
            };
            const remove = (id: string) => {
                files.delete(id);
                items = items.filter((item) => item.id !== id);
                emit();
            };

            const timer = setInterval(() => {
                for (const item of items) {
                    if (item.status !== 'uploading') {
                        continue;
                    }
                    const progress = Math.min(1, (item.progress ?? 0) + step);
                    const file = files.get(item.id);
                    if (file === undefined) {
                        continue;
                    }
                    if (
                        file.name.startsWith('fail') &&
                        !failedOnce.has(item.id) &&
                        progress >= 0.5
                    ) {
                        failedOnce.add(item.id);
                        patch(item.id, { status: 'failed', error: 'Network error' });
                    } else if (progress < 1) {
                        patch(item.id, { progress });
                    } else {
                        remove(item.id);
                        onUploaded({
                            upload: `upl_${String(next++)}`,
                            name: file.name,
                            mime: file.type !== '' ? file.type : null,
                            size: file.size,
                        });
                    }
                }
            }, interval);

            return {
                getItems: () => items,
                subscribe(listener) {
                    listeners.add(listener);
                    return () => listeners.delete(listener);
                },
                add(chosen) {
                    for (const file of chosen) {
                        added += 1;
                        const id = `file-${String(added)}`;
                        files.set(id, file);
                        items = [
                            ...items,
                            {
                                id,
                                name: file.name,
                                size: file.size,
                                mime: file.type !== '' ? file.type : null,
                                progress: 0,
                                status: 'uploading',
                                error: null,
                                canPause: file.size > multipartThreshold,
                            },
                        ];
                    }
                    emit();
                },
                pause: (id) => patch(id, { status: 'paused' }),
                resume: (id) => patch(id, { status: 'uploading' }),
                cancel: remove,
                retry: (id) => patch(id, { status: 'uploading', error: null }),
                destroy() {
                    clearInterval(timer);
                    listeners.clear();
                },
            };
        },
    };
}

/** A file of a size, for stories and tests. */
export const exampleFile = (name: string, type: string, size = 10) =>
    new File([new Uint8Array(size)], name, { type });

/** The file input of a picker. */
export function fileInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (input === null) {
        throw new Error('No file input.');
    }
    return input;
}
