import { Item } from './core';

export type MediaType = 'audio' | 'image' | 'video' | 'document' | 'font';

export interface MediaFile {
    url: string;
    type: string;
}

/**
 * Media file definition
 */
export interface Media extends Item {
    id: string;
    name: string;
    type: string;
    thumbnail_url?: string;
    thumbnailUrl?: string;
    url?: string;
    provider?: string;
    [key: string]: unknown;
    files?: Record<string, MediaFile> | null;
}

export interface VideoMedia extends Media {
    type: 'video';
    iframeUrl?: string;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
}

export interface AudioMedia extends Media {
    type: 'audio';
    duration?: number | null;
}
export interface ImageMedia extends Media {
    type: 'image';
}
