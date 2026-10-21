import { FileImage, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { DataAdapter } from '@panneau/data';
import { useOptionalDataAdapter } from '@panneau/data/query';
import {
    type FieldEntryProps,
    type FieldProps,
    FilePicker,
    UploadList,
    type UploadSource,
    formatSize,
    getAccept,
    getFieldProps,
    getMaxSize,
    useFieldsContext,
    useRejectionMessage,
    useUploads,
} from '@panneau/fields';
import { fieldsMessages, mediaMessages as messages } from '@panneau/intl';
import type { Media } from '@panneau/protocol';
import { Badge, Fieldset, IconButton, Spinner, usePanneauIntl } from '@panneau/ui';

import styles from './MediaField.module.css';

/** What the media field needs from an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaAdapter = Pick<DataAdapter, 'uploadMedia' | 'getMedia'>;

export interface MediaFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /**
     * Creates media from uploads, and reads their status. Defaults to the adapter of
     * `DataAdapterProvider`. Without one, the field is read-only.
     */
    adapter?: MediaAdapter | null;
    /**
     * Where files are uploaded directly to storage. Defaults to the one of the fields context.
     * Without one, files go to `POST /media` in `multipart/form-data`.
     */
    uploadSource?: UploadSource | null;
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** How often to read a media again until it is ready, in milliseconds. Defaults to 3 s. */
    refreshInterval?: number;
}

export interface SingleMediaFieldProps extends MediaFieldBaseProps {
    multiple?: false;
    value?: Media | null;
    onChange?: (value: Media | null) => void;
}

export interface MultipleMediaFieldProps extends MediaFieldBaseProps {
    multiple: true;
    value?: readonly Media[] | null;
    /** Called with the media. An empty list is `null`. */
    onChange?: (value: Media[] | null) => void;
}

export type MediaFieldProps = SingleMediaFieldProps | MultipleMediaFieldProps;

/** Whether a value is a media item. */
export function isMedia(value: unknown): value is Media {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { id?: unknown }).id === 'string' &&
        typeof (value as { name?: unknown }).name === 'string'
    );
}

/** The media of a value, single or multiple. */
export function toMedia(value: unknown): Media[] {
    if (Array.isArray(value)) {
        return value.filter(isMedia);
    }
    return isMedia(value) ? [value] : [];
}

/** Whether a media is still being ingested. */
export function isProcessing(media: Media): boolean {
    return media.status === 'pending' || media.status === 'processing';
}

/**
 * Reads media again while they are being ingested, until they are ready or failed, and calls
 * `onRefresh` with the media that changed.
 */
function useMediaRefresh(
    media: readonly Media[],
    adapter: MediaAdapter | null,
    interval: number,
    onRefresh: (refreshed: Media[]) => void,
) {
    const latest = useRef(onRefresh);
    useEffect(() => {
        latest.current = onRefresh;
    });
    const waiting = media.filter(isProcessing).map((item) => `${item.id}:${item.status ?? ''}`);
    const key = waiting.join(',');

    useEffect(() => {
        if (adapter === null || key === '') {
            return undefined;
        }
        const ids = key.split(',').map((entry) => entry.slice(0, entry.lastIndexOf(':')));
        const controller = new AbortController();
        const timer = setTimeout(() => {
            Promise.all(ids.map((id) => adapter.getMedia(id, { signal: controller.signal })))
                .then((refreshed) => {
                    if (!controller.signal.aborted) {
                        latest.current(refreshed);
                    }
                })
                .catch(() => undefined);
        }, interval);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [adapter, key, interval]);
}

/**
 * Media of the media library (the `media` type): a file chosen or dropped becomes a media through
 * the adapter (`uploadMedia()`), sent directly to storage first when there is an upload source.
 * The field shows each media with its thumbnail and its status, and reads a media again until its
 * ingest is done. Picking media already in the library comes with the library.
 */
export function MediaField(props: MediaFieldProps) {
    const intl = usePanneauIntl();
    const contextAdapter = useOptionalDataAdapter();
    const context = useFieldsContext();
    const {
        adapter = contextAdapter,
        uploadSource = context.uploadSource,
        accept = null,
        maxSize = null,
        refreshInterval = 3000,
        label,
        description,
        errors = [],
        disabled,
        readOnly,
        required,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
    } = props;
    const multiple = props.multiple === true;
    const media = toMedia(props.value);
    const editable = adapter !== null && disabled !== true && readOnly !== true;
    const [problems, setProblems] = useState<string[]>([]);
    const [creating, setCreating] = useState<string[]>([]);
    const rejectionMessage = useRejectionMessage(maxSize);

    const latest = useRef(media);
    useEffect(() => {
        latest.current = media;
    });
    const set = (next: Media[]) => {
        latest.current = next;
        if (props.multiple === true) {
            props.onChange?.(next.length > 0 ? next : null);
        } else {
            props.onChange?.(next[0] ?? null);
        }
    };

    useMediaRefresh(media, adapter, refreshInterval, (refreshed) =>
        set(
            latest.current.map(
                (item) => refreshed.find((candidate) => candidate.id === item.id) ?? item,
            ),
        ),
    );

    const upload = useUploads({
        source: uploadSource,
        accept,
        maxSize,
        onUploaded: (file) => {
            if (adapter === null) {
                return;
            }
            const name = file.name;
            setCreating((current) => [...current, name]);
            const request =
                file instanceof File
                    ? adapter.uploadMedia(file)
                    : adapter.uploadMedia({ upload: file.upload }, { name });
            request
                .then((created) => set(multiple ? [...latest.current, created] : [created]))
                .catch((error: unknown) =>
                    setProblems((current) => [
                        ...current,
                        intl.formatMessage(fieldsMessages.uploadFailed, {
                            error: `${name}: ${error instanceof Error ? error.message : String(error)}`,
                        }),
                    ]),
                )
                .finally(() =>
                    setCreating((current) => {
                        const at = current.indexOf(name);
                        return at === -1 ? current : current.filter((_, index) => index !== at);
                    }),
                );
        },
        onRejected: (file, reason) =>
            setProblems((current) => [...current, rejectionMessage(file, reason)]),
    });

    const statusBadge = (item: Media) => {
        if (item.status === 'failed') {
            return <Badge tone="danger">{intl.formatMessage(messages.statusFailed)}</Badge>;
        }
        if (isProcessing(item)) {
            return (
                <Badge tone="warning">
                    {intl.formatMessage(
                        item.status === 'pending'
                            ? messages.statusPending
                            : messages.statusProcessing,
                    )}
                </Badge>
            );
        }
        return null;
    };

    return (
        <Fieldset
            legend={label}
            description={
                adapter === null && disabled !== true && readOnly !== true ? (
                    <>
                        {description} {intl.formatMessage(messages.unavailable)}
                    </>
                ) : (
                    description
                )
            }
            errors={[...errors, ...problems]}
            isRequired={required}
            isDisabled={disabled}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            <div className={styles.field}>
                {media.length > 0 ? (
                    <ul className={styles.media}>
                        {media.map((item) => (
                            <li key={item.id} className={styles.item}>
                                <span className={styles.thumbnail}>
                                    {typeof item.thumbnailUrl === 'string' ? (
                                        <img src={item.thumbnailUrl} alt="" />
                                    ) : (
                                        <FileImage aria-hidden />
                                    )}
                                </span>
                                <span className={styles.details}>
                                    <span className={styles.name}>{item.name}</span>
                                    <span className={styles.meta}>
                                        <span>{item.type}</span>
                                        <span>{formatSize(item.size, intl.locale)}</span>
                                        {statusBadge(item)}
                                    </span>
                                </span>
                                {editable ? (
                                    <IconButton
                                        icon={X}
                                        size="sm"
                                        label={intl.formatMessage(fieldsMessages.removeFile, {
                                            name: item.name,
                                        })}
                                        onPress={() =>
                                            set(
                                                latest.current.filter(
                                                    (entry) => entry.id !== item.id,
                                                ),
                                            )
                                        }
                                    />
                                ) : null}
                            </li>
                        ))}
                    </ul>
                ) : creating.length === 0 && upload.items.length === 0 ? (
                    <span className={styles.none}>{intl.formatMessage(messages.noMedia)}</span>
                ) : null}
                <UploadList
                    items={upload.items}
                    onPause={upload.pause}
                    onResume={upload.resume}
                    onCancel={upload.cancel}
                    onRetry={upload.retry}
                />
                {creating.length > 0 ? (
                    <span className={styles.meta} role="status">
                        <Spinner size="sm" />
                        {intl.formatMessage(fieldsMessages.uploadCompleting)} {creating.join(', ')}
                    </span>
                ) : null}
                {editable ? (
                    <FilePicker
                        accept={accept}
                        multiple={multiple}
                        onSelect={(selected) => {
                            setProblems([]);
                            upload.add(selected);
                        }}
                    />
                ) : null}
            </div>
        </Fieldset>
    );
}

/**
 * The registry entry of the `media` type: the field's `multiple`, `accept` (or its `accept` rule)
 * and `maxSize` rule, with the adapter of `@panneau/data` and the upload source of the fields
 * context.
 */
export function MediaFieldEntry(props: FieldEntryProps) {
    const { field, value, onChange } = props;
    const common = {
        ...getFieldProps(props),
        accept: getAccept(field),
        maxSize: getMaxSize(field),
    };
    return field.multiple === true ? (
        <MediaField {...common} multiple value={toMedia(value)} onChange={onChange} />
    ) : (
        <MediaField {...common} value={toMedia(value)[0] ?? null} onChange={onChange} />
    );
}
