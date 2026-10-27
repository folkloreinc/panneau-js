import { formatSize, matchesMime } from '@panneau/fields';
import { mediaMessages as messages } from '@panneau/intl';
import type { usePanneauIntl } from '@panneau/ui';

import type { MediaSort, MediaType, PickerMedia } from './types';

type Intl = ReturnType<typeof usePanneauIntl>;

/** The extension of a media's file, in capitals (`JPG`), or its type. */
export function extensionOf(item: PickerMedia): string {
    const match = /\.([a-z0-9]+)$/i.exec(item.fileName ?? '');
    return match?.[1]?.toUpperCase() ?? item.media.type.toUpperCase();
}

/** A duration in seconds, as `m:ss` or `h:mm:ss`. */
export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const rest = String(Math.round(seconds % 60)).padStart(2, '0');
    return minutes >= 60
        ? `${String(Math.floor(minutes / 60))}:${String(minutes % 60).padStart(2, '0')}:${rest}`
        : `${String(minutes)}:${rest}`;
}

export function isProcessingMedia(item: PickerMedia): boolean {
    return item.media.status === 'pending' || item.media.status === 'processing';
}

/** Why a media can't be picked here, or `null`: its processing failed, or the opener's rules. */
export function refusalOf(
    item: PickerMedia,
    accept: readonly string[] | null,
    maxSize: number | null,
    intl: Intl,
): string | null {
    if (item.media.status === 'failed') {
        const reason = item.media.error?.message;
        return typeof reason === 'string' && reason !== ''
            ? intl.formatMessage(messages.statusFailedBecause, { error: reason })
            : intl.formatMessage(messages.statusFailed);
    }
    if (accept !== null && accept.length > 0 && !matchesMime(item.media.mime ?? '', accept)) {
        return intl.formatMessage(messages.pickerRefusedType, { type: extensionOf(item) });
    }
    if (maxSize !== null && (item.media.size ?? 0) > maxSize) {
        return intl.formatMessage(messages.pickerRefusedSize, {
            size: formatSize(maxSize, intl.locale),
        });
    }
    return null;
}

const TYPE_MESSAGES = {
    image: messages.pickerTypeImage,
    video: messages.pickerTypeVideo,
    audio: messages.pickerTypeAudio,
    document: messages.pickerTypeDocument,
    other: messages.pickerTypeOther,
} as const;

export const MEDIA_TYPES = Object.keys(TYPE_MESSAGES) as MediaType[];

export function typeLabel(type: MediaType, intl: Intl): string {
    return intl.formatMessage(TYPE_MESSAGES[type]);
}

/** What `accept` allows, for people: "Images, PDF". */
export function describeAccept(accept: readonly string[], intl: Intl): string {
    const names = accept.map((pattern) => {
        const type = pattern.endsWith('/*') ? pattern.slice(0, -2) : null;
        if (type !== null && type in TYPE_MESSAGES) {
            return typeLabel(type as MediaType, intl);
        }
        const subtype = pattern.split('/')[1] ?? pattern;
        return subtype.toUpperCase();
    });
    return new Intl.ListFormat(intl.locale, { type: 'unit' }).format(names);
}

const SORT_MESSAGES: Record<string, typeof messages.pickerSortNewest> = {
    '-createdAt': messages.pickerSortNewest,
    createdAt: messages.pickerSortOldest,
    name: messages.pickerSortName,
    '-size': messages.pickerSortSize,
    '-pixels': messages.pickerSortDimensions,
    '-duration': messages.pickerSortDuration,
};

/** The label of a sort: its own, the one the picker knows, or its id. */
export function sortLabel(sort: MediaSort, intl: Intl): string {
    if (sort.label !== undefined) {
        return sort.label;
    }
    const message = SORT_MESSAGES[sort.id];
    return message !== undefined ? intl.formatMessage(message) : sort.id;
}
