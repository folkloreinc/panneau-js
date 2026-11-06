import {
    AudioLines,
    FileArchive,
    File as FileIcon,
    FileSpreadsheet,
    FileText,
    Film,
    Image as ImageIcon,
    Presentation,
} from 'lucide-react';
import { useState } from 'react';

import type { IconComponent } from '@panneau/ui';

import { cx } from '../shared/cx';
import styles from './FileThumbnail.module.css';

/** What a file is, for its icon: the `type` of a media, or what its MIME type says. */
export type FileKind =
    'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'other';

const KIND_ICONS: Record<FileKind, IconComponent> = {
    image: ImageIcon,
    video: Film,
    audio: AudioLines,
    document: FileText,
    spreadsheet: FileSpreadsheet,
    presentation: Presentation,
    archive: FileArchive,
    other: FileIcon,
};

const MEDIA_TYPES = new Set<string>(['image', 'video', 'audio', 'document']);

/** The kind of a file from its MIME type. */
export function kindOfMime(mime: string | null | undefined): FileKind {
    const type = (mime ?? '').toLowerCase();
    const family = type.split('/')[0] ?? '';
    if (family === 'image' || family === 'video' || family === 'audio') {
        return family;
    }
    if (/spreadsheet|excel|csv/.test(type)) {
        return 'spreadsheet';
    }
    if (/presentation|powerpoint|keynote/.test(type)) {
        return 'presentation';
    }
    if (/zip|compressed|tar|rar|7z|gzip/.test(type)) {
        return 'archive';
    }
    if (family === 'text' || /pdf|msword|wordprocessing|opendocument\.text|rtf/.test(type)) {
        return 'document';
    }
    return 'other';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The kind of a file value, a media or a media reference (`{ media }`), and the first of a list:
 * from the media's `type`, or the `mime` of the file. `null` for anything else.
 */
export function getFileKind(value: unknown): FileKind | null {
    const first: unknown = Array.isArray(value) ? value[0] : value;
    if (!isRecord(first)) {
        return null;
    }
    const source = isRecord(first.media) ? first.media : first;
    if (typeof source.mime === 'string' && source.mime !== '') {
        const kind = kindOfMime(source.mime);
        if (kind !== 'other' || typeof source.type !== 'string') {
            return kind;
        }
    }
    if (typeof source.type === 'string') {
        return MEDIA_TYPES.has(source.type) ? (source.type as FileKind) : 'other';
    }
    return null;
}

/** The extension of a file name, in capitals (`PDF`), or `null`. */
export function extensionOfName(name: string | null | undefined): string | null {
    const match = /\.([a-z0-9]{1,8})$/i.exec(name ?? '');
    return match?.[1]?.toUpperCase() ?? null;
}

/** The icon of a kind of file. */
export function FileKindIcon({
    kind,
    size = 24,
    className,
}: {
    kind: FileKind | null;
    size?: number;
    className?: string;
}) {
    const Icon = KIND_ICONS[kind ?? 'other'];
    return <Icon aria-hidden size={size} strokeWidth={1.5} className={className} />;
}

export interface FileThumbnailProps {
    /** The URL of the image to show. Without one, or when it fails to load, the icon of the kind. */
    src?: string | null;
    kind: FileKind | null;
    /** Shown under the icon, such as `PDF`. */
    extension?: string | null;
    /** Size of the icon, in pixels. */
    iconSize?: number;
    /** The text of the image. Empty by default: the name of the file is next to it. */
    alt?: string;
    className?: string;
    imageClassName?: string;
}

/**
 * The thumbnail of a file: its image, or the icon of its kind with its extension. An image that
 * fails to load (a document without a preview, an expired URL) falls back to the icon, never a
 * broken image.
 */
export function FileThumbnail({
    src = null,
    kind,
    extension = null,
    iconSize = 24,
    alt = '',
    className,
    imageClassName,
}: FileThumbnailProps) {
    const [failed, setFailed] = useState<string | null>(null);
    if (typeof src === 'string' && src !== '' && failed !== src) {
        return (
            <img
                className={cx(styles.image, imageClassName)}
                src={src}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(src)}
            />
        );
    }
    return (
        <span className={cx(styles.icon, className)} data-kind={kind ?? 'other'}>
            <FileKindIcon kind={kind} size={iconSize} />
            {extension !== null ? <span className={styles.extension}>{extension}</span> : null}
        </span>
    );
}
