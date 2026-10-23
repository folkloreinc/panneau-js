import { Crop, FileImage, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { fieldsMessages, mediaMessages as messages } from '@panneau/intl';
import type { MediaReference } from '@panneau/protocol';
import { Badge, Button, IconButton, Text, usePanneauIntl } from '@panneau/ui';

import styles from './MediaField.module.css';
import { TransformedImage, ratioLabel, renderedImage } from './editor/draw';
import { sameEdits } from './editor/geometry';
import type { EditedImage } from './editor/types';

/** The image of a reference, as the editor reads it, or null when its media can't be edited. */
export function editedImageOf(reference: MediaReference): EditedImage | null {
    const media = reference.media;
    const url = media?.url ?? media?.thumbnailUrl;
    if (
        media?.type !== 'image' ||
        typeof url !== 'string' ||
        typeof media.width !== 'number' ||
        typeof media.height !== 'number'
    ) {
        return null;
    }
    return {
        label: reference.label ?? reference.id,
        url,
        width: media.width,
        height: media.height,
        mediaTransform: media.transform ?? null,
    };
}

/**
 * Whether the media's own transform changed since the transform for this use was made over it
 * (decision 0031).
 */
export function libraryChanged(reference: MediaReference): boolean {
    const transform = reference.transform;
    return (
        transform?.base === 'media' &&
        transform.baseTransform !== undefined &&
        !sameEdits(transform.baseTransform, reference.media?.transform ?? {})
    );
}

export interface ImageItemProps {
    reference: MediaReference;
    /** A gallery tile, or the card of a single image. */
    tile: boolean;
    cropRequired: boolean;
    /** The status badge of a media being processed. */
    status: ReactNode;
    onEdit: (() => void) | null;
    onRemove: (() => void) | null;
}

/** An image of an `image` field: as it is rendered for this use, with its crop and its actions. */
export function ImageItem({
    reference,
    tile,
    cropRequired,
    status,
    onEdit,
    onRemove,
}: ImageItemProps) {
    const intl = usePanneauIntl();
    const name = reference.label ?? reference.id;
    const image = editedImageOf(reference);
    const cropped = reference.transform?.crop !== undefined;
    const changed = libraryChanged(reference);
    const needsCrop = cropRequired && !cropped;

    let size: string | null = null;
    if (image !== null) {
        // The crop is in the coordinates of the image as rendered.
        const { crop } = renderedImage(image, reference.transform);
        size = intl.formatMessage(messages.editorResultSize, {
            width: Math.round(crop.width),
            height: Math.round(crop.height),
            ratio: ratioLabel(crop.width, crop.height),
        });
    }

    const preview =
        image !== null ? (
            <TransformedImage
                image={image}
                transform={reference.transform}
                alt=""
                fit={tile ? 'slice' : 'meet'}
                className={tile ? styles.tilePreview : styles.preview}
            />
        ) : typeof reference.media?.thumbnailUrl === 'string' ? (
            <img
                src={reference.media.thumbnailUrl}
                alt=""
                className={tile ? styles.tilePreview : styles.preview}
            />
        ) : (
            <span className={tile ? styles.tilePreview : styles.preview}>
                <FileImage aria-hidden />
            </span>
        );

    const badges = (
        <span className={styles.badges}>
            {cropped ? (
                <Badge tone="info">{intl.formatMessage(messages.imageCropped)}</Badge>
            ) : needsCrop ? (
                <Badge tone="warning">{intl.formatMessage(messages.imageNeedsCrop)}</Badge>
            ) : null}
            {changed ? (
                <Badge tone="warning">{intl.formatMessage(messages.imageLibraryChanged)}</Badge>
            ) : null}
            {reference.transform?.base === 'media' && !changed ? (
                <Badge>{intl.formatMessage(messages.imageOverLibrary)}</Badge>
            ) : null}
            {status}
        </span>
    );

    const edit =
        onEdit !== null && image !== null ? (
            tile ? (
                <IconButton
                    icon={Crop}
                    size="sm"
                    label={intl.formatMessage(messages.imageEditOf, { name })}
                    onPress={onEdit}
                />
            ) : (
                <Button
                    size="sm"
                    icon={Crop}
                    variant={needsCrop || changed ? 'primary' : undefined}
                    aria-label={intl.formatMessage(messages.imageEditOf, { name })}
                    onPress={onEdit}
                >
                    {intl.formatMessage(messages.imageEdit)}
                </Button>
            )
        ) : null;
    const remove =
        onRemove !== null ? (
            <IconButton
                icon={Trash2}
                size="sm"
                variant="ghost"
                label={intl.formatMessage(fieldsMessages.removeFile, { name })}
                onPress={onRemove}
            />
        ) : null;

    if (tile) {
        return (
            <li className={styles.tile}>
                {preview}
                <span className={styles.name}>{name}</span>
                {badges}
                {edit !== null || remove !== null ? (
                    <span className={styles.tileActions}>
                        {edit}
                        {remove}
                    </span>
                ) : null}
            </li>
        );
    }
    return (
        <li className={styles.imageCard}>
            {preview}
            <span className={styles.details}>
                <span className={styles.name}>{name}</span>
                {size !== null ? (
                    <Text as="span" size="sm" muted numeric>
                        {size}
                    </Text>
                ) : null}
                {badges}
                {edit !== null || remove !== null ? (
                    <span className={styles.imageActions}>
                        {edit}
                        {remove}
                    </span>
                ) : null}
            </span>
        </li>
    );
}
