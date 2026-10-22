import type { UploadItem, UploadSource, UploadedFile } from '@panneau/fields';
import type { FilterValue } from '@panneau/protocol';

import type { MediaPage, MediaQuery, MediaSource, MediaType, PickerMedia } from '../picker/types';

/** A landscape in an SVG data URL: fake images, without network. */
function landscape(hue: number, width: number, height: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(width)} ${String(height)}" width="${String(width)}" height="${String(height)}"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${String(hue)} 70% 72%)"/><stop offset="1" stop-color="hsl(${String((hue + 40) % 360)} 75% 88%)"/></linearGradient></defs><rect width="${String(width)}" height="${String(height)}" fill="url(#s)"/><circle cx="${String(width * 0.72)}" cy="${String(height * 0.32)}" r="${String(Math.min(width, height) * 0.12)}" fill="hsl(${String((hue + 180) % 360)} 90% 85%)"/><path d="M0 ${String(height * 0.78)} L${String(width * 0.3)} ${String(height * 0.45)} L${String(width * 0.55)} ${String(height * 0.7)} L${String(width * 0.75)} ${String(height * 0.5)} L${String(width)} ${String(height * 0.8)} V${String(height)} H0Z" fill="hsl(${String(hue)} 35% 32%)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MB = 1024 * 1024;

interface MediaOptions {
    id: string;
    name: string;
    type: MediaType;
    mime: string;
    size: number;
    hue?: number;
    width?: number;
    height?: number;
    duration?: number;
    status?: PickerMedia['media']['status'];
    createdAt?: string;
    values?: Record<string, unknown>;
}

/** A fake media: a landscape for images and videos, an icon for the others. */
export function fakeMedia({
    id,
    name,
    type,
    mime,
    size,
    hue,
    width,
    height,
    duration,
    status,
    createdAt = '2026-10-14T10:00:00Z',
    values = {},
}: MediaOptions): PickerMedia {
    const picture =
        hue !== undefined && width !== undefined && height !== undefined
            ? landscape(hue, width / 10, height / 10)
            : null;
    const label = name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    return {
        id,
        label,
        fileName: name,
        createdAt,
        media: {
            type,
            mime,
            size,
            url: picture,
            thumbnailUrl: status === 'pending' ? null : picture,
            width: width ?? null,
            height: height ?? null,
            duration: duration ?? null,
            ...(status !== undefined ? { status } : {}),
        },
        values: { name: label, ...values },
    };
}

/** Images and other files, as a "Media" library holds them. */
export const libraryMedia: PickerMedia[] = [
    fakeMedia({
        id: 'med_01',
        name: 'harbour-at-dawn.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 2.4 * MB,
        hue: 200,
        width: 4032,
        height: 3024,
        createdAt: '2026-10-21T09:00:00Z',
        values: { alt: 'Fishing boats in a harbour at dawn', tags: ['harbour'] },
    }),
    fakeMedia({
        id: 'med_02',
        name: 'team-portrait.heic',
        type: 'image',
        mime: 'image/heic',
        size: 3.1 * MB,
        hue: 20,
        width: 3024,
        height: 4032,
        createdAt: '2026-10-20T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_03',
        name: 'autumn-forest.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 1.8 * MB,
        hue: 30,
        width: 2400,
        height: 1600,
        createdAt: '2026-10-19T09:00:00Z',
        values: { tags: ['nature'] },
    }),
    fakeMedia({
        id: 'med_04',
        name: 'studio-tour.mp4',
        type: 'video',
        mime: 'video/mp4',
        size: 812 * MB,
        hue: 320,
        width: 1920,
        height: 1080,
        duration: 754,
        createdAt: '2026-10-18T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_05',
        name: 'press-kit.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 7.2 * MB,
        createdAt: '2026-10-17T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_06',
        name: 'mountain-lake.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 5.6 * MB,
        hue: 170,
        width: 6000,
        height: 4000,
        createdAt: '2026-10-16T09:00:00Z',
        values: { tags: ['nature'] },
    }),
    fakeMedia({
        id: 'med_07',
        name: 'episode-12.mp3',
        type: 'audio',
        mime: 'audio/mpeg',
        size: 48 * MB,
        duration: 2710,
        createdAt: '2026-10-15T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_08',
        name: 'city-at-night.png',
        type: 'image',
        mime: 'image/png',
        size: 12.4 * MB,
        hue: 230,
        width: 3840,
        height: 2160,
        createdAt: '2026-10-14T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_09',
        name: 'subscribers.csv',
        type: 'other',
        mime: 'text/csv',
        size: 220 * 1024,
        createdAt: '2026-10-13T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_10',
        name: 'workshop-photos.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 4.2 * MB,
        hue: 12,
        width: 4000,
        height: 3000,
        status: 'processing',
        createdAt: '2026-10-22T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_11',
        name: 'broken-scan.tiff',
        type: 'image',
        mime: 'image/tiff',
        size: 88 * MB,
        status: 'failed',
        createdAt: '2026-10-12T09:00:00Z',
    }),
    fakeMedia({
        id: 'med_12',
        name: 'spring-garden.webp',
        type: 'image',
        mime: 'image/webp',
        size: 640 * 1024,
        hue: 110,
        width: 1600,
        height: 1600,
        createdAt: '2026-10-11T09:00:00Z',
        values: { tags: ['nature'] },
    }),
];

/** Files of a "Documents" library. */
export const documentMedia: PickerMedia[] = [
    fakeMedia({
        id: 'med_01',
        name: 'annual-report-2025.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 9.8 * MB,
    }),
    fakeMedia({
        id: 'doc_02',
        name: 'brand-guidelines.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 24 * MB,
    }),
    fakeMedia({
        id: 'doc_03',
        name: 'pricing.xlsx',
        type: 'document',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 180 * 1024,
    }),
];

function matches(item: PickerMedia, id: string, value: FilterValue): boolean {
    const actual = id === 'type' ? item.media.type : item.values?.[id];
    const wanted = Array.isArray(value) ? value : [value];
    const values = Array.isArray(actual) ? actual : [actual];
    return wanted.some((entry) => values.includes(entry));
}

function sortValue(item: PickerMedia, key: string): number | string {
    switch (key) {
        case 'name':
            return item.label;
        case 'size':
            return item.media.size ?? 0;
        case 'pixels':
            return (item.media.width ?? 0) * (item.media.height ?? 0);
        case 'duration':
            return item.media.duration ?? 0;
        default:
            return item.createdAt ?? '';
    }
}

export interface MemorySourceOptions extends Partial<
    Pick<MediaSource, 'accept' | 'maxSize' | 'filters' | 'sorts' | 'fields' | 'canCreate'>
> {
    id: string;
    label: string;
    items: readonly PickerMedia[];
    perPage?: number;
    /** Milliseconds before each answer. */
    delay?: number;
    /** `list()` never answers, or fails. */
    list?: 'loading' | 'error';
    /** What a media becomes once processed, read by `get()`. */
    processed?: (item: PickerMedia) => PickerMedia;
}

/**
 * A source that keeps its media in memory, for tests and stories: search on the label, filters on
 * the type and on `values`, sorts on the dates, names, sizes and durations, and pages as cursors.
 */
export function createMemorySource({
    id,
    label,
    items,
    perPage = 24,
    delay = 0,
    list: mode,
    processed = (item) => ({ ...item, media: { ...item.media, status: 'ready' } }),
    canCreate = true,
    ...rest
}: MemorySourceOptions): MediaSource & { media: PickerMedia[] } {
    const media = [...items];
    let next = 1;
    const wait = <T>(value: T): Promise<T> =>
        new Promise((done) => setTimeout(() => done(value), delay));
    return {
        id,
        label,
        canCreate,
        sorts: [{ id: '-createdAt' }, { id: 'createdAt' }, { id: 'name' }, { id: '-size' }],
        ...rest,
        media,
        list(query: MediaQuery): Promise<MediaPage> {
            if (mode === 'loading') {
                return new Promise(() => undefined);
            }
            if (mode === 'error') {
                return wait(null).then(() => Promise.reject(new Error('Service Unavailable')));
            }
            const q = query.q?.toLowerCase() ?? '';
            const found = media.filter(
                (item) =>
                    (q === '' || item.label.toLowerCase().includes(q)) &&
                    Object.entries(query.filter ?? {}).every(([key, value]) =>
                        matches(item, key, value),
                    ),
            );
            const sort = query.sort ?? '-createdAt';
            const descending = sort.startsWith('-');
            const key = descending ? sort.slice(1) : sort;
            found.sort((a, b) => {
                const left = sortValue(a, key);
                const right = sortValue(b, key);
                const order =
                    typeof left === 'number' && typeof right === 'number'
                        ? left - right
                        : String(left).localeCompare(String(right));
                return descending ? -order : order;
            });
            const start =
                query.cursor !== null && query.cursor !== undefined ? Number(query.cursor) : 0;
            const end = start + perPage;
            return wait({
                items: found.slice(start, end),
                nextCursor: end < found.length ? String(end) : null,
                total: found.length,
            });
        },
        get(mediaId) {
            const index = media.findIndex((item) => item.id === mediaId);
            const item = media[index];
            if (item === undefined) {
                return Promise.reject(new Error('Not Found'));
            }
            const fresh = processed(item);
            media[index] = fresh;
            return wait(fresh);
        },
        create(file) {
            const name = file.name;
            const mime = file instanceof File ? file.type : (file.mime ?? '');
            const created = fakeMedia({
                id: `new_${String(next++)}`,
                name,
                type: mime.startsWith('image/')
                    ? 'image'
                    : mime.startsWith('video/')
                      ? 'video'
                      : 'document',
                mime,
                size: file.size ?? 0,
                hue: 60,
                width: 1600,
                height: 1200,
                status: 'processing',
                createdAt: '2026-10-22T12:00:00Z',
            });
            media.unshift(created);
            return wait(created);
        },
        update(mediaId, values) {
            const index = media.findIndex((item) => item.id === mediaId);
            const item = media[index];
            if (item === undefined) {
                return Promise.reject(new Error('Not Found'));
            }
            const saved = {
                ...item,
                label: typeof values.name === 'string' ? values.name : item.label,
                values: { ...item.values, ...values },
            };
            media[index] = saved;
            return wait(saved);
        },
    };
}

const NO_ITEMS: readonly UploadItem[] = [];

/** Uploads every file at once. */
export const instantUploadSource: UploadSource = {
    createUploader({ onUploaded }: { onUploaded: (file: UploadedFile) => void }) {
        let next = 1;
        return {
            getItems: () => NO_ITEMS,
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
            destroy: () => undefined,
        };
    },
};
