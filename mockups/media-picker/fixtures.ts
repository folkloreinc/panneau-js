import type { UploadItem } from '@panneau/fields';

import type { MediaType, PickerMedia } from './MediaSource';

/**
 * Fake media for the mockups: no network, so thumbnails are small SVG landscapes in data URLs.
 */
function landscape(hue: number, width: number, height: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="hsl(${hue} 70% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 75% 88%)"/>
</linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#s)"/>
<circle cx="${width * 0.72}" cy="${height * 0.32}" r="${Math.min(width, height) * 0.12}" fill="hsl(${(hue + 180) % 360} 90% 85%)"/>
<path d="M0 ${height * 0.78} L${width * 0.3} ${height * 0.45} L${width * 0.55} ${height * 0.7} L${width * 0.75} ${height * 0.5} L${width} ${height * 0.8} V${height} H0Z" fill="hsl(${hue} 35% 32%)"/>
<path d="M0 ${height * 0.9} Q${width * 0.5} ${height * 0.75} ${width} ${height * 0.92} V${height} H0Z" fill="hsl(${hue} 30% 22%)"/>
</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

let next = 0;

interface MediaOptions {
    name: string;
    type: MediaType;
    mime: string;
    size: number;
    hue?: number;
    width?: number;
    height?: number;
    duration?: number;
    status?: PickerMedia['media']['status'];
    alt?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
}

function media({
    name,
    type,
    mime,
    size,
    hue,
    width,
    height,
    duration,
    status,
    alt,
    description,
    tags,
    createdAt,
}: MediaOptions): PickerMedia {
    next += 1;
    const thumbnail =
        hue !== undefined && width !== undefined && height !== undefined
            ? landscape(hue, width / 10, height / 10)
            : null;
    return {
        id: `med_${String(next).padStart(3, '0')}`,
        label: name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        fileName: name,
        createdAt: createdAt ?? `2026-10-${String(20 - (next % 19)).padStart(2, '0')}`,
        values: {
            ...(alt !== undefined ? { alt } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(tags !== undefined ? { tags } : {}),
        },
        media: {
            type,
            mime,
            size,
            url: thumbnail,
            thumbnailUrl: status === 'pending' ? null : thumbnail,
            width: width ?? null,
            height: height ?? null,
            duration: duration ?? null,
            ...(status !== undefined ? { status } : {}),
        },
    };
}

const MB = 1024 * 1024;

export const images: PickerMedia[] = [
    media({
        name: 'harbour-at-dawn.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 2.4 * MB,
        hue: 200,
        width: 4032,
        height: 3024,
        alt: 'Fishing boats in a harbour at dawn',
        description: 'Cover of the spring issue.',
        tags: ['harbour', 'spring issue'],
    }),
    media({
        name: 'team-portrait.heic',
        type: 'image',
        mime: 'image/heic',
        size: 3.1 * MB,
        hue: 20,
        width: 3024,
        height: 4032,
    }),
    media({
        name: 'autumn-forest.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 1.8 * MB,
        hue: 30,
        width: 2400,
        height: 1600,
        alt: 'A path through a forest in autumn',
        tags: ['nature', 'autumn'],
    }),
    media({
        name: 'logo-wordmark.svg',
        type: 'image',
        mime: 'image/svg+xml',
        size: 14 * 1024,
        hue: 260,
        width: 1200,
        height: 400,
    }),
    media({
        name: 'studio-tour.mp4',
        type: 'video',
        mime: 'video/mp4',
        size: 812 * MB,
        hue: 320,
        width: 1920,
        height: 1080,
        duration: 754,
    }),
    media({
        name: 'mountain-lake.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 5.6 * MB,
        hue: 170,
        width: 6000,
        height: 4000,
        tags: ['nature', 'summer'],
    }),
    media({
        name: 'press-kit.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 7.2 * MB,
    }),
    media({
        name: 'city-at-night.png',
        type: 'image',
        mime: 'image/png',
        size: 12.4 * MB,
        hue: 230,
        width: 3840,
        height: 2160,
        tags: ['travel'],
    }),
    media({
        name: 'episode-12.mp3',
        type: 'audio',
        mime: 'audio/mpeg',
        size: 48 * MB,
        duration: 2710,
    }),
    media({
        name: 'desert-road.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 2.9 * MB,
        hue: 40,
        width: 2048,
        height: 1365,
        tags: ['nature', 'travel'],
    }),
    media({
        name: 'subscribers.csv',
        type: 'other',
        mime: 'text/csv',
        size: 220 * 1024,
    }),
    media({
        name: 'spring-garden.webp',
        type: 'image',
        mime: 'image/webp',
        size: 640 * 1024,
        hue: 110,
        width: 1600,
        height: 1600,
        tags: ['nature', 'spring issue'],
    }),
];

/** Media still being processed, and one whose processing failed. */
export const processing: PickerMedia[] = [
    media({
        name: 'launch-trailer.mov',
        type: 'video',
        mime: 'video/quicktime',
        size: 2.1 * 1024 * MB,
        width: 3840,
        height: 2160,
        status: 'pending',
        createdAt: '2026-10-22',
    }),
    media({
        name: 'workshop-photos-01.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 4.2 * MB,
        hue: 12,
        width: 4000,
        height: 3000,
        status: 'processing',
        createdAt: '2026-10-22',
    }),
    media({
        name: 'broken-scan.tiff',
        type: 'image',
        mime: 'image/tiff',
        size: 88 * MB,
        status: 'failed',
        createdAt: '2026-10-21',
    }),
];

export const documents: PickerMedia[] = [
    media({
        name: 'annual-report-2025.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 9.8 * MB,
    }),
    media({
        name: 'brand-guidelines.pdf',
        type: 'document',
        mime: 'application/pdf',
        size: 24 * MB,
    }),
    media({
        name: 'pricing.xlsx',
        type: 'document',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 180 * 1024,
    }),
    media({
        name: 'contract-template.docx',
        type: 'document',
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 96 * 1024,
    }),
    media({ name: 'speaker-notes.txt', type: 'document', mime: 'text/plain', size: 8 * 1024 }),
    media({ name: 'font-display.woff2', type: 'other', mime: 'font/woff2', size: 64 * 1024 }),
];

/** Files just uploaded from the Upload tab: they are media of the library now. */
export const uploaded: PickerMedia[] = [
    media({
        name: 'workshop-photos-02.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 3.8 * MB,
        hue: 350,
        width: 4000,
        height: 3000,
        status: 'processing',
        createdAt: '2026-10-22',
    }),
    media({
        name: 'workshop-photos-03.jpg',
        type: 'image',
        mime: 'image/jpeg',
        size: 4.0 * MB,
        hue: 60,
        width: 4000,
        height: 3000,
        createdAt: '2026-10-22',
    }),
];

const upload = (overrides: Partial<UploadItem> & Pick<UploadItem, 'id' | 'name'>): UploadItem => ({
    size: 4 * MB,
    mime: 'image/jpeg',
    progress: 0.4,
    status: 'uploading',
    error: null,
    canPause: false,
    ...overrides,
});

/** Files being uploaded, in every status of the upload list. */
export const uploads: UploadItem[] = [
    upload({
        id: 'u1',
        name: 'workshop-video.mp4',
        mime: 'video/mp4',
        size: 1.6 * 1024 * MB,
        progress: 0.62,
        canPause: true,
    }),
    upload({
        id: 'u2',
        name: 'workshop-photos-04.jpg',
        progress: 0.18,
    }),
    upload({
        id: 'u3',
        name: 'drone-footage.mp4',
        mime: 'video/mp4',
        size: 3.2 * 1024 * MB,
        status: 'paused',
        progress: 0.35,
        canPause: true,
    }),
    upload({
        id: 'u4',
        name: 'workshop-photos-05.jpg',
        status: 'failed',
        progress: 0.7,
        error: 'Network error',
    }),
];

/** Files refused before they were sent, with why. */
export const rejected = [
    { name: 'installer.exe', reason: 'This type of file isn’t accepted.' },
    { name: 'raw-interview.mov', reason: 'Larger than the 2 GB limit (3.4 GB).' },
];
