import { FileImage, Images, X } from 'lucide-react';
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
import type { Definition, Field, Item, MediaInfo, MediaReference } from '@panneau/protocol';
import { getMediaLibraries } from '@panneau/protocol/runtime';
import { Badge, Button, Fieldset, IconButton, Spinner, usePanneauIntl } from '@panneau/ui';

import { ImageItem, editedImageOf } from './ImageItem';
import styles from './MediaField.module.css';
import { ImageEditorDialog } from './editor/ImageEditor';
import { useImageEditorTools } from './editor/tools';
import { MediaPicker } from './picker/MediaPicker';
import type { MediaSource } from './picker/types';
import { createResourceMediaSource } from './resourceSource';

/** What the media field needs from an adapter: `@panneau/data`'s `DataAdapter` has it. */
export type MediaAdapter = Pick<DataAdapter, 'create' | 'get'>;

export interface MediaFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /**
     * The library the field uploads to: a resource of kind `media`. References without a
     * `resource` are media of it.
     */
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
    /**
     * The libraries the media picker browses, in the order of its switcher ("Choose media",
     * "Add media"). Without any, the field only uploads.
     */
    sources?: readonly MediaSource[];
    /** Keeps what the user browsed in the picker between openings (see `MediaPicker`). */
    stateKey?: string;
    /**
     * Makes it an `image` field (decision 0031): its images as they are rendered for this use,
     * the image editor to edit their transform, and the editor as the step after a pick when a
     * crop is required. `ImageField` sets it.
     */
    image?: ImageOptions | null;
}

/** The options of an `image` field (decision 0031). */
export interface ImageOptions {
    /** The ratios the editor offers, as `width:height`. */
    ratios?: readonly string[];
    /** Whether a crop must have one of `ratios`: the `crop` rule. */
    enforceRatios?: boolean;
    /** Whether each image needs a crop for this use: the `crop` rule. */
    cropRequired?: boolean;
    /** Whether the editor offers rotation and flips. Defaults to true. */
    rotate?: boolean;
    /** Whether the editor offers the focal point. Defaults to true. */
    focalPoint?: boolean;
    /**
     * What a transform for one use starts from: the media's own transform (the default), the
     * original file, or the user's choice in the editor.
     */
    transformBase?: 'media' | 'original' | 'choose';
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

/** The key of a reference: its library and its id, which are unique only together. */
const keyOf = (reference: MediaReference, resource: string) =>
    `${reference.resource ?? resource}\n${reference.id}`;

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
 * Media of libraries (the `media` type, decisions 0026 and 0027). "Choose media" ("Add media"
 * with `multiple`) opens the media picker on the `sources`, and a file chosen or dropped becomes
 * a media of the library, an item of its resource (`create(resource, { file })`), sent directly
 * to storage first when there is an upload source. Values are references to the media, with
 * their library, their `media` and their `transform` for this use. The field shows each media
 * with its thumbnail and its status, and reads it again until its file is processed.
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
        sources = [],
        stateKey,
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
    const enabled = disabled !== true && readOnly !== true;
    const canUpload = adapter !== null && enabled;
    const canPick = sources.length > 0 && enabled;
    const [picking, setPicking] = useState(false);
    const imageOptions = props.image ?? null;
    // The image being edited: one of the value, by its key, or one just picked, before it is added.
    const [editing, setEditing] = useState<{ key: string } | { picked: MediaReference } | null>(
        null,
    );
    const editorTools = useImageEditorTools();
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

    /** Adds picked media: a single pick replaces the media, several are added to the list, once. */
    const add = (picked: readonly MediaReference[]) => {
        const known = new Set(latest.current.map((entry) => keyOf(entry, resource)));
        set(
            multiple
                ? [
                      ...latest.current,
                      ...picked.filter((entry) => !known.has(keyOf(entry, resource))),
                  ]
                : picked.slice(0, 1),
        );
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

    // The constraints of an `image` field, next to its description.
    const imageRatios = imageOptions?.ratios ?? [];
    const constraints =
        imageOptions === null
            ? []
            : [
                  ...(imageRatios.length > 0
                      ? [
                            intl.formatMessage(
                                imageOptions.enforceRatios === true
                                    ? messages.imageRatios
                                    : messages.imageSuggestedRatios,
                                {
                                    ratios: intl.formatList(imageRatios, {
                                        type: 'disjunction',
                                    }),
                                },
                            ),
                        ]
                      : []),
                  ...(imageOptions.cropRequired === true
                      ? [intl.formatMessage(messages.imageCropRequired)]
                      : []),
              ];

    // The editor: on an image of the value, or as the step after a pick.
    const edited =
        editing === null
            ? null
            : 'key' in editing
              ? (media.find((entry) => keyOf(entry, resource) === editing.key) ?? null)
              : editing.picked;
    const editedImage = edited !== null ? editedImageOf(edited) : null;
    const tools = [
        editorTools.crop,
        ...(imageOptions?.rotate === false ? [] : [editorTools.rotate]),
        ...(imageOptions?.focalPoint === false ? [] : [editorTools.focalPoint]),
    ];
    const unavailable = adapter === null && disabled !== true && readOnly !== true;
    const chooseLabel =
        imageOptions !== null
            ? multiple
                ? messages.addImages
                : messages.chooseImage
            : multiple
              ? messages.addMedia
              : messages.chooseMedia;
    const cropStep = imageOptions?.cropRequired === true && !multiple;
    const withTransform = (reference: MediaReference, transform: MediaReference['transform']) => {
        const { transform: _previous, ...rest } = reference;
        return transform === null || transform === undefined ? rest : { ...rest, transform };
    };

    return (
        <Fieldset
            legend={label}
            description={
                description !== undefined || unavailable || constraints.length > 0 ? (
                    <>
                        {description}
                        {unavailable
                            ? `${description !== undefined ? ' ' : ''}${intl.formatMessage(messages.unavailable)}`
                            : null}
                        {constraints.length > 0 ? (
                            <span className={styles.constraints}>
                                {constraints.map((constraint) => (
                                    <Badge key={constraint}>{constraint}</Badge>
                                ))}
                            </span>
                        ) : null}
                    </>
                ) : undefined
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
                {media.length > 0 && imageOptions !== null ? (
                    <ul className={multiple ? styles.gallery : styles.media}>
                        {media.map((item) => (
                            <ImageItem
                                key={keyOf(item, resource)}
                                reference={item}
                                tile={multiple}
                                cropRequired={imageOptions.cropRequired === true}
                                status={statusBadge(item)}
                                onEdit={
                                    enabled
                                        ? () => setEditing({ key: keyOf(item, resource) })
                                        : null
                                }
                                onRemove={
                                    canUpload || canPick
                                        ? () =>
                                              set(
                                                  latest.current.filter(
                                                      (entry) =>
                                                          keyOf(entry, resource) !==
                                                          keyOf(item, resource),
                                                  ),
                                              )
                                        : null
                                }
                            />
                        ))}
                    </ul>
                ) : media.length > 0 ? (
                    <ul className={styles.media}>
                        {media.map((item) => {
                            const name = item.label ?? item.id;
                            const size = item.media?.size;
                            return (
                                <li key={keyOf(item, resource)} className={styles.item}>
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
                                    {canUpload || canPick ? (
                                        <IconButton
                                            icon={X}
                                            size="sm"
                                            label={intl.formatMessage(fieldsMessages.removeFile, {
                                                name,
                                            })}
                                            onPress={() =>
                                                set(
                                                    latest.current.filter(
                                                        (entry) =>
                                                            keyOf(entry, resource) !==
                                                            keyOf(item, resource),
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
                    <span className={styles.none}>
                        {intl.formatMessage(
                            imageOptions !== null ? messages.noImage : messages.noMedia,
                        )}
                    </span>
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
                {canPick || canUpload ? (
                    <div className={styles.actions}>
                        {canPick ? (
                            <Button
                                size="sm"
                                appearance="outline"
                                icon={Images}
                                onPress={() => setPicking(true)}
                            >
                                {intl.formatMessage(chooseLabel)}
                            </Button>
                        ) : null}
                        {canUpload ? (
                            <FilePicker
                                accept={accept}
                                multiple={multiple}
                                className={styles.upload}
                                {...(canPick
                                    ? {
                                          label: intl.formatMessage(
                                              imageOptions !== null
                                                  ? multiple
                                                      ? messages.uploadImages
                                                      : messages.uploadImage
                                                  : multiple
                                                    ? messages.uploadFiles
                                                    : messages.uploadFile,
                                          ),
                                      }
                                    : {})}
                                onSelect={(selected) => {
                                    setProblems([]);
                                    upload.add(selected);
                                }}
                            />
                        ) : null}
                    </div>
                ) : null}
            </div>
            {canPick ? (
                <MediaPicker
                    isOpen={picking}
                    onOpenChange={setPicking}
                    sources={sources}
                    multiple={multiple}
                    accept={accept}
                    maxSize={maxSize}
                    value={media}
                    title={intl.formatMessage(chooseLabel)}
                    {...(cropStep
                        ? { confirmLabel: intl.formatMessage(messages.imageNextCrop) }
                        : {})}
                    uploadSource={uploadSource}
                    refreshInterval={refreshInterval}
                    {...(stateKey !== undefined ? { stateKey } : {})}
                    onSelect={(picked) => {
                        setProblems([]);
                        // A required crop is the step right after the pick of one image.
                        const [first] = picked;
                        if (
                            cropStep &&
                            picked.length === 1 &&
                            first !== undefined &&
                            editedImageOf(first) !== null
                        ) {
                            setEditing({ picked: first });
                            return;
                        }
                        add(picked);
                    }}
                />
            ) : null}
            {imageOptions !== null &&
            edited !== null &&
            editedImage !== null &&
            editing !== null ? (
                <ImageEditorDialog
                    isOpen
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setEditing(null);
                        }
                    }}
                    image={editedImage}
                    value={'key' in editing ? (edited.transform ?? null) : null}
                    base={imageOptions.transformBase === 'original' ? 'original' : 'media'}
                    canChooseBase={imageOptions.transformBase === 'choose'}
                    tools={tools}
                    ratios={imageRatios}
                    enforceRatios={imageOptions.enforceRatios === true}
                    cropRequired={imageOptions.cropRequired === true}
                    {...('picked' in editing
                        ? {
                              title: intl.formatMessage(messages.imageCropForUse),
                              applyLabel: intl.formatMessage(messages.imageUseCrop),
                              onBack: () => {
                                  setEditing(null);
                                  setPicking(true);
                              },
                          }
                        : {})}
                    onApply={(transform) => {
                        const next = withTransform(edited, transform);
                        if ('picked' in editing) {
                            add([next]);
                        } else {
                            set(
                                latest.current.map((entry) =>
                                    keyOf(entry, resource) === editing.key ? next : entry,
                                ),
                            );
                        }
                    }}
                />
            ) : null}
        </Fieldset>
    );
}

/** The props of `ImageField`: those of `MediaField`, with the options of an `image` field. */
export type ImageFieldProps = MediaFieldProps & ImageOptions;

/**
 * An `image` field (decision 0031): a `media` field for images, with the image editor. It accepts
 * `image/*` by default. Each image shows as it is rendered for this use, with Edit, which opens
 * the editor on its transform. When a crop is required, the editor is the step right after the
 * pick of one image.
 */
export function ImageField(props: ImageFieldProps) {
    const {
        ratios,
        enforceRatios,
        cropRequired,
        rotate,
        focalPoint,
        transformBase,
        accept = ['image/*'],
        ...rest
    } = props;
    const image: ImageOptions = {
        ...(ratios !== undefined ? { ratios } : {}),
        ...(enforceRatios !== undefined ? { enforceRatios } : {}),
        ...(cropRequired !== undefined ? { cropRequired } : {}),
        ...(rotate !== undefined ? { rotate } : {}),
        ...(focalPoint !== undefined ? { focalPoint } : {}),
        ...(transformBase !== undefined ? { transformBase } : {}),
    };
    return <MediaField {...(rest as MediaFieldProps)} accept={accept} image={image} />;
}

/**
 * The options of an `image` field of a definition: its `crop` rule (enforced ratios, a required
 * crop), its suggested `ratios`, and the tools and base of its editor.
 */
export function getImageOptions(field: Field): ImageOptions {
    const rule = field.rules?.find((candidate) => candidate.rule === 'crop');
    const value =
        rule !== undefined &&
        'value' in rule &&
        typeof rule.value === 'object' &&
        rule.value !== null
            ? (rule.value as { ratios?: unknown; required?: unknown })
            : {};
    const enforced = Array.isArray(value.ratios)
        ? value.ratios.filter((ratio): ratio is string => typeof ratio === 'string')
        : [];
    return {
        ratios: enforced.length > 0 ? enforced : (field.ratios ?? []),
        enforceRatios: enforced.length > 0,
        cropRequired: value.required === true,
        rotate: field.rotate !== false,
        focalPoint: field.focalPoint !== false,
        transformBase: field.transformBase ?? 'media',
    };
}

/**
 * The registry entry of the `media` and `image` types: the picker on the libraries the field allows
 * (`getMediaLibraries()`), uploads to the first one (`getLibrary()`), `multiple`, `accept` (or
 * its `accept` rule) and `maxSize` rule, with the adapter of `@panneau/data` and the upload source
 * of the fields context. The picker opens again where the user left it in the same libraries.
 * Without a library, the field shows its media and can't add any. An `image` field also gets its
 * options (`getImageOptions()`), and accepts `image/*` by default.
 */
export function MediaFieldEntry(props: FieldEntryProps) {
    const { field, value, onChange } = props;
    const { definition } = usePanneau();
    const adapter = useOptionalDataAdapter();
    const library = getLibrary(definition, field.resource);
    const itemTitle = library?.itemTitle ?? 'name';
    const libraries = getMediaLibraries(definition, field).flatMap(
        (id) => definition?.resources.find((candidate) => candidate.id === id) ?? [],
    );
    const sources =
        adapter !== null
            ? libraries.map((candidate) => createResourceMediaSource(adapter, candidate))
            : [];
    const image = field.type === 'image' ? getImageOptions(field) : null;
    const common = {
        ...getFieldProps(props),
        resource: library?.id ?? (typeof field.resource === 'string' ? field.resource : ''),
        itemTitle,
        accept: getAccept(field) ?? (image !== null ? ['image/*'] : null),
        maxSize: getMaxSize(field),
        sources,
        image,
        stateKey: `panneau.media.${libraries.map((candidate) => candidate.id).join(',')}`,
        ...(library === null ? { adapter: null } : {}),
    };
    const references = toMediaReferences(value, itemTitle);
    return field.multiple === true ? (
        <MediaField {...common} multiple value={references} onChange={onChange} />
    ) : (
        <MediaField {...common} value={references[0] ?? null} onChange={onChange} />
    );
}
