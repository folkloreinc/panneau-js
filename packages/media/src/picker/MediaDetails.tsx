import { ArrowLeft } from 'lucide-react';

import { NestedField, formatSize } from '@panneau/fields';
import { mediaMessages as messages } from '@panneau/intl';
import type { Field } from '@panneau/protocol';
import { Alert, Button, Heading, Text, usePanneauIntl } from '@panneau/ui';

import { StatusBadge, Thumbnail } from './MediaGrid';
import styles from './MediaPicker.module.css';
import { extensionOf, formatDuration, isProcessingMedia } from './format';
import type { PickerMedia } from './types';

export interface MediaDetailsProps {
    item: PickerMedia | null;
    /** The fields the details edit: empty when the source can't update its media. */
    fields: readonly Field[];
    /** The values being edited. */
    draft: Readonly<Record<string, unknown>>;
    onDraftChange: (draft: Record<string, unknown>) => void;
    dirty: boolean;
    saving: boolean;
    error: string | null;
    onSave: () => void;
    /** On phones and tablets, where the details are shown over the grid. */
    onBack: () => void;
}

/**
 * The details of the media the user selected last: a larger preview, the fields of its source
 * with "Save", and what the backend computed about its file.
 */
export function MediaDetails({
    item,
    fields,
    draft,
    onDraftChange,
    dirty,
    saving,
    error,
    onSave,
    onBack,
}: MediaDetailsProps) {
    const intl = usePanneauIntl();
    const label = intl.formatMessage(messages.pickerDetails);
    if (item === null) {
        return (
            <aside className={styles.details} aria-label={label} tabIndex={0}>
                <Text muted size="sm">
                    {intl.formatMessage(messages.pickerNoDetails)}
                </Text>
            </aside>
        );
    }
    const { media } = item;
    const properties: [string, string][] = [
        [intl.formatMessage(messages.pickerFile), item.fileName ?? '—'],
        [
            intl.formatMessage(messages.pickerFileType),
            media.mime !== null && media.mime !== undefined
                ? `${extensionOf(item)} · ${media.mime}`
                : extensionOf(item),
        ],
    ];
    if (typeof media.size === 'number') {
        properties.push([
            intl.formatMessage(messages.pickerSize),
            formatSize(media.size, intl.locale),
        ]);
    }
    if (typeof media.width === 'number' && typeof media.height === 'number') {
        properties.push([
            intl.formatMessage(messages.pickerDimensions),
            `${intl.formatNumber(media.width)} × ${intl.formatNumber(media.height)}`,
        ]);
    }
    if (typeof media.duration === 'number') {
        properties.push([
            intl.formatMessage(messages.pickerDuration),
            formatDuration(media.duration),
        ]);
    }
    if (typeof item.createdAt === 'string') {
        properties.push([
            intl.formatMessage(messages.pickerAdded),
            intl.formatDate(item.createdAt, { dateStyle: 'medium' }),
        ]);
    }
    return (
        <aside
            className={styles.details}
            aria-label={intl.formatMessage(messages.pickerDetailsOf, { name: item.label })}
            tabIndex={0}
        >
            <Button
                size="sm"
                variant="ghost"
                icon={ArrowLeft}
                onPress={onBack}
                className={styles.backButton}
            >
                {intl.formatMessage(messages.pickerBack)}
            </Button>
            <div className={styles.preview}>
                <Thumbnail item={item} large />
            </div>
            <div className={styles.detailsTitle}>
                <Heading level={3} size={4}>
                    {item.label}
                </Heading>
                <StatusBadge item={item} />
            </div>
            {isProcessingMedia(item) ? (
                <Text size="sm" muted>
                    {intl.formatMessage(messages.pickerStillProcessing)}
                </Text>
            ) : null}
            {fields.length > 0 ? (
                <form
                    className={styles.form}
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSave();
                    }}
                >
                    {fields.map((field) => (
                        <NestedField
                            key={field.name}
                            field={field}
                            path={field.name}
                            value={draft[field.name]}
                            parentValue={draft}
                            disabled={saving}
                            onChange={(value) => onDraftChange({ ...draft, [field.name]: value })}
                        />
                    ))}
                    {error !== null ? (
                        <Alert tone="danger" role="alert">
                            {error}
                        </Alert>
                    ) : null}
                    <div className={styles.formActions}>
                        <Button size="sm" type="submit" isDisabled={!dirty || saving}>
                            {intl.formatMessage(messages.pickerSave)}
                        </Button>
                    </div>
                </form>
            ) : null}
            <dl className={styles.properties}>
                {properties.map(([term, value]) => (
                    <div key={term}>
                        <dt>{term}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}
