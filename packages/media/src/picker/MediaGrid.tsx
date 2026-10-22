import { AudioLines, Check, File, FileText, Film, Image as ImageIcon, Info } from 'lucide-react';
import { GridList, GridListItem } from 'react-aria-components';

import { formatSize } from '@panneau/fields';
import { mediaMessages as messages } from '@panneau/intl';
import { Badge, IconButton, type IconComponent, usePanneauIntl } from '@panneau/ui';

import styles from './MediaPicker.module.css';
import { extensionOf, formatDuration, isProcessingMedia, refusalOf } from './format';
import type { PickerMedia } from './types';

const TYPE_ICONS: Record<string, IconComponent> = {
    image: ImageIcon,
    video: Film,
    audio: AudioLines,
    document: FileText,
};

/** The status badge of a media being processed, or whose processing failed. */
export function StatusBadge({ item }: { item: PickerMedia }) {
    const intl = usePanneauIntl();
    if (item.media.status === 'failed') {
        return (
            <Badge tone="danger" appearance="solid">
                {intl.formatMessage(messages.statusFailed)}
            </Badge>
        );
    }
    if (isProcessingMedia(item)) {
        return (
            <Badge tone="warning" appearance="solid">
                {intl.formatMessage(
                    item.media.status === 'pending'
                        ? messages.statusPending
                        : messages.statusProcessing,
                )}
            </Badge>
        );
    }
    return null;
}

/** The thumbnail of a media, or the icon of its type with its extension. */
export function Thumbnail({ item, large = false }: { item: PickerMedia; large?: boolean }) {
    // The preview of an image is the image itself; of another file, its thumbnail (a poster).
    const url =
        large && item.media.type === 'image'
            ? (item.media.url ?? item.media.thumbnailUrl)
            : item.media.thumbnailUrl;
    if (typeof url === 'string') {
        const alt = item.values?.alt;
        return (
            <img
                className={large ? styles.previewImage : styles.thumbnailImage}
                src={url}
                alt={large && typeof alt === 'string' ? alt : ''}
            />
        );
    }
    const Icon = TYPE_ICONS[item.media.type] ?? File;
    return (
        <span className={styles.typeIcon} data-type={item.media.type}>
            <Icon aria-hidden size={large ? 48 : 32} strokeWidth={1.5} />
            <span className={styles.extension}>{extensionOf(item)}</span>
        </span>
    );
}

export interface MediaGridProps {
    items: readonly PickerMedia[];
    label: string;
    multiple: boolean;
    /** Ids of the media of this grid that are selected. */
    selected: ReadonlySet<string>;
    /** Ids of the media of this grid that the opener's value has. */
    current: ReadonlySet<string>;
    /** Called with the ids selected in this grid, and the one that was just selected. */
    onSelectionChange: (ids: Set<string>, added: string | null) => void;
    onDetails: (id: string) => void;
    accept: readonly string[] | null;
    maxSize: number | null;
}

/**
 * The media of a source: arrows move between them, Space or a click selects. Media that can't be
 * picked are greyed out, with the reason.
 */
export function MediaGrid({
    items,
    label,
    multiple,
    selected,
    current,
    onSelectionChange,
    onDetails,
    accept,
    maxSize,
}: MediaGridProps) {
    const intl = usePanneauIntl();
    const refusals = new Map(
        items.map((item) => [item.id, refusalOf(item, accept, maxSize, intl)] as const),
    );
    return (
        <GridList
            aria-label={label}
            layout="grid"
            className={styles.grid}
            selectionMode={multiple ? 'multiple' : 'single'}
            selectionBehavior="toggle"
            selectedKeys={[...selected]}
            disabledKeys={[...refusals].filter(([, reason]) => reason !== null).map(([id]) => id)}
            onSelectionChange={(keys) => {
                const next = new Set(
                    keys === 'all' ? items.map((item) => item.id) : [...keys].map(String),
                );
                onSelectionChange(next, [...next].find((id) => !selected.has(id)) ?? null);
            }}
        >
            {items.map((item) => {
                const reason = refusals.get(item.id) ?? null;
                const size = item.media.size;
                const duration = item.media.duration;
                return (
                    <GridListItem
                        key={item.id}
                        id={item.id}
                        textValue={item.label}
                        className={styles.card}
                    >
                        {({ isSelected }) => (
                            <>
                                <span className={styles.thumbnail}>
                                    <Thumbnail item={item} />
                                    <span
                                        className={multiple ? styles.checkbox : styles.radio}
                                        data-selected={isSelected || undefined}
                                        aria-hidden
                                    >
                                        {isSelected ? <Check size={14} strokeWidth={3} /> : null}
                                    </span>
                                    <span className={styles.badges}>
                                        {current.has(item.id) ? (
                                            <Badge tone="info" appearance="solid">
                                                {intl.formatMessage(messages.pickerCurrent)}
                                            </Badge>
                                        ) : null}
                                        <StatusBadge item={item} />
                                    </span>
                                    {typeof duration === 'number' ? (
                                        <span className={styles.duration}>
                                            {formatDuration(duration)}
                                        </span>
                                    ) : null}
                                </span>
                                <span className={styles.cardName}>{item.label}</span>
                                {/* On phones, where the badges don't fit on the thumbnail. */}
                                {current.has(item.id) || isProcessingMedia(item) ? (
                                    <span className={styles.cardStatus}>
                                        {current.has(item.id)
                                            ? intl.formatMessage(messages.pickerCurrent)
                                            : intl.formatMessage(
                                                  item.media.status === 'pending'
                                                      ? messages.statusPending
                                                      : messages.statusProcessing,
                                              )}
                                    </span>
                                ) : null}
                                {reason !== null ? (
                                    <span className={styles.reason}>{reason}</span>
                                ) : (
                                    <span className={styles.cardMeta}>
                                        {extensionOf(item)}
                                        {typeof size === 'number'
                                            ? ` · ${formatSize(size, intl.locale)}`
                                            : null}
                                    </span>
                                )}
                                <IconButton
                                    icon={Info}
                                    size="sm"
                                    label={intl.formatMessage(messages.pickerDetailsOf, {
                                        name: item.label,
                                    })}
                                    showTooltip={false}
                                    className={styles.detailsButton}
                                    onPress={() => onDetails(item.id)}
                                />
                            </>
                        )}
                    </GridListItem>
                );
            })}
        </GridList>
    );
}
