import { FileImage, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { usePanneau } from '@panneau/core';
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
import type { Definition, Item, MediaInfo, MediaReference } from '@panneau/protocol';
import { getMediaLibraries } from '@panneau/protocol/runtime';
import { Badge, Fieldset, IconButton, Spinner, usePanneauIntl } from '@panneau/ui';

import styles from './MediaField.module.css';

/** What the media field needs from an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaAdapter = Pick<DataAdapter, 'create' | 'get'>;

export interface MediaFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** The library: a resource of kind `media`, whose items the field references. */
    resource: string;
    /** The field that titles the media of the library, for the label of new references. Defaults to `name`. */
    itemTitle?: string;
    /**
     * Creates media in the library from uploads (`create(resource, { file })`), and reads them
     * again until they are processed (`get()`). Defaults to the adapter of `DataAdapterProvider`.
     * Without one, the field is read-only.
     */
    adapter?: MediaAdapter | null;
    /**
     * Where files are uploaded directly to storage. Defaults to the one of the fields context.
     * Without one, files are sent in `multipart/form-data` when the media is created.
     */
    uploadSource?: UploadSource | null;
    accept?: readonly string[] | null;
    maxSize?: number | null;
    /** How often to read a media again until it is ready, in milliseconds. Defaults to 3 s. */
    refreshInterval?: number;
}

export interface SingleMediaFieldProps extends MediaFieldBaseProps {
    multiple?: false;
    value?: MediaReference | null;
    onChange?: (value: MediaReference | null) => void;
}

export interface MultipleMediaFieldProps extends MediaFieldBaseProps {
    multiple: true;
    value?: readonly MediaReference[] | null;
    /** Called with the media. An empty list is `null`. */
    onChange?: (value: MediaReference[] | null) => void;
}

export type MediaFieldProps = SingleMediaFieldProps | MultipleMediaFieldProps;

/**
 * The reference of a value: a reference, a media item (its `media` and title), or an id, as a
 * product's own API may give them.
 */
export function toMediaReference(value: unknown, itemTitle = 'name'): MediaReference | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return { id: String(value) };
    }
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const { id, resource, label, media, transform } = value as Record<string, unknown>;
    if (typeof id !== 'string' && typeof id !== 'number') {
        return null;
    }
    const title = (value as Record<string, unknown>)[itemTitle];
    const reference: MediaReference = { id: String(id) };
    if (typeof resource === 'string') {
        reference.resource = resource;
    }
    if (typeof label === 'string') {
        reference.label = label;
    } else if (typeof title === 'string') {
        reference.label = title;
    }
    if (typeof media === 'object' && media !== null) {
        reference.media = media as MediaInfo;
    }
    if (typeof transform === 'object') {
        reference.transform = transform as MediaReference['transform'];
    }
    return reference;
}

/** The references of a value, single or multiple. */
export function toMediaReferences(value: unknown, itemTitle?: string): MediaReference[] {
    const values: unknown[] = Array.isArray(value) ? value : [value];
    return values
        .map((entry) => toMediaReference(entry, itemTitle))
        .filter((reference): reference is MediaReference => reference !== null);
}

/** Whether the file of a media is still being processed. */
export function isProcessing(reference: MediaReference): boolean {
    const status = reference.media?.status;
    return status === 'pending' || status === 'processing';
}

/**
 * The first library a `media` field allows (decision 0027): the one its `resource` names, the
 * first one it lists, or the first resource of kind `media` of the definition when it names none.
 * The field uploads to it.
 */
export function getLibrary(
    definition: Pick<Definition, 'resources'> | null,
    resource: string | readonly string[] | undefined,
): Definition['resources'][number] | null {
    const [first] = getMediaLibraries(definition, { resource });
    return definition?.resources.find((candidate) => candidate.id === first) ?? null;
}

/**
 * Reads media again while they are being ingested, until they are ready or failed, and calls
 * `onRefresh` with the media that changed.
 */
function useMediaRefresh(
    media: readonly MediaReference[],
    resource: string,
    adapter: MediaAdapter | null,
    interval: number,
    onRefresh: (refreshed: { resource: string; item: Item }[]) => void,
) {
    const latest = useRef(onRefresh);
    useEffect(() => {
        latest.current = onRefresh;
    });
    // Each media is read in its own library: ids are unique only within a library.
    const waiting = media
        .filter(isProcessing)
        .map((item) =>
            JSON.stringify([item.resource ?? resource, item.id, item.media?.status ?? '']),
        );
    const key = waiting.join('\n');

    useEffect(() => {
        if (adapter === null || key === '') {
            return undefined;
        }
        const entries = key.split('\n').map((entry) => {
            const [library, id] = JSON.parse(entry) as [string, string];
            return { library, id };
        });
        const controller = new AbortController();
        const timer = setTimeout(() => {
            Promise.all(
                entries.map(({ library, id }) =>
                    adapter
                        .get(library, id, { signal: controller.signal })
                        .then((item) => ({ resource: library, item })),
                ),
            )
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
    }, [adapter, resource, key, interval]);
}

/**
 * Media of a library (the `media` type, decision 0026): a file chosen or dropped becomes a media
 * of the library, an item of its resource (`create(resource, { file })`), sent directly to storage
 * first when there is an upload source. Values are references to the media, with their `media`
 * and their `transform` for this use. The field shows each media with its thumbnail and its
 * status, and reads it again until its file is processed. Picking media already in the library
 * comes with the media picker.
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
        resource,
        itemTitle = 'name',
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
    const media = toMediaReferences(props.value, itemTitle);
    const editable = adapter !== null && disabled !== true && readOnly !== true;
    const [problems, setProblems] = useState<string[]>([]);
    const [creating, setCreating] = useState<string[]>([]);
    const rejectionMessage = useRejectionMessage(maxSize);

    const latest = useRef(media);
    useEffect(() => {
        latest.current = media;
    });
    const set = (next: MediaReference[]) => {
        latest.current = next;
        if (props.multiple === true) {
            props.onChange?.(next.length > 0 ? next : null);
        } else {
            props.onChange?.(next[0] ?? null);
        }
    };

    useMediaRefresh(media, resource, adapter, refreshInterval, (refreshed) =>
        set(
            latest.current.map((reference) => {
                const item = refreshed.find(
                    (candidate) =>
                        candidate.item.id === reference.id &&
                        candidate.resource === (reference.resource ?? resource),
                )?.item;
                const fresh = item !== undefined ? toMediaReference(item, itemTitle) : null;
                return fresh !== null
                    ? { ...reference, ...fresh, transform: reference.transform }
                    : reference;
            }),
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
            adapter
                .create(resource, { file: file instanceof File ? file : { upload: file.upload } })
                .then((item) => {
                    // With its library, which a field that allows several needs (decision 0027).
                    const created = {
                        ...(toMediaReference(item, itemTitle) ?? { id: item.id }),
                        resource,
                    };
                    set(multiple ? [...latest.current, created] : [created]);
                })
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

    const statusBadge = (item: MediaReference) => {
        if (item.media?.status === 'failed') {
            return <Badge tone="danger">{intl.formatMessage(messages.statusFailed)}</Badge>;
        }
        if (isProcessing(item)) {
            return (
                <Badge tone="warning">
                    {intl.formatMessage(
                        item.media?.status === 'pending'
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
                        {media.map((item) => {
                            const name = item.label ?? item.id;
                            const size = item.media?.size;
                            return (
                                <li key={item.id} className={styles.item}>
                                    <span className={styles.thumbnail}>
                                        {typeof item.media?.thumbnailUrl === 'string' ? (
                                            <img src={item.media.thumbnailUrl} alt="" />
                                        ) : (
                                            <FileImage aria-hidden />
                                        )}
                                    </span>
                                    <span className={styles.details}>
                                        <span className={styles.name}>{name}</span>
                                        <span className={styles.meta}>
                                            {item.media !== undefined ? (
                                                <span>{item.media.type}</span>
                                            ) : null}
                                            {typeof size === 'number' ? (
                                                <span>{formatSize(size, intl.locale)}</span>
                                            ) : null}
                                            {statusBadge(item)}
                                        </span>
                                    </span>
                                    {editable ? (
                                        <IconButton
                                            icon={X}
                                            size="sm"
                                            label={intl.formatMessage(fieldsMessages.removeFile, {
                                                name,
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
                            );
                        })}
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
 * The registry entry of the `media` type: the field's first library (`getLibrary()`), which it
 * uploads to, `multiple`, `accept` (or its `accept` rule) and `maxSize` rule,
 * with the adapter of `@panneau/data` and the upload source of the fields context. Without a
 * library, the field shows its media and can't add any.
 */
export function MediaFieldEntry(props: FieldEntryProps) {
    const { field, value, onChange } = props;
    const { definition } = usePanneau();
    const library = getLibrary(definition, field.resource);
    const itemTitle = library?.itemTitle ?? 'name';
    const common = {
        ...getFieldProps(props),
        resource: library?.id ?? (typeof field.resource === 'string' ? field.resource : ''),
        itemTitle,
        accept: getAccept(field),
        maxSize: getMaxSize(field),
        ...(library === null ? { adapter: null } : {}),
    };
    const references = toMediaReferences(value, itemTitle);
    return field.multiple === true ? (
        <MediaField {...common} multiple value={references} onChange={onChange} />
    ) : (
        <MediaField {...common} value={references[0] ?? null} onChange={onChange} />
    );
}
