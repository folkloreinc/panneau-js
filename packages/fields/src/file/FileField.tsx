import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { StoredFile } from '@panneau/protocol';
import { getImageUrl } from '@panneau/protocol/runtime';
import { Fieldset, IconButton, usePanneauIntl } from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import { getAccept, getFieldProps, getMaxSize } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { FilePicker } from '../upload/FilePicker';
import { FileThumbnail, extensionOfName, getFileKind, kindOfMime } from '../upload/FileThumbnail';
import { UploadList } from '../upload/UploadList';
import { formatSize } from '../upload/files';
import type { UploadSource, UploadedFile } from '../upload/types';
import { useRejectionMessage } from '../upload/useRejectionMessage';
import { useUploads } from '../upload/useUploads';
import styles from './FileField.module.css';

/**
 * A file of a `file` value: a stored file, as items give it; an upload, once the browser sent the
 * file to storage; or the file itself, sent in a multipart request without direct uploads.
 */
export type FileValue = StoredFile | UploadedFile | File;

export interface FileFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** Accepted MIME types (`application/pdf`, `image/*`). Others are refused before they are sent. */
    accept?: readonly string[] | null;
    /** Largest file, in bytes. Larger ones are refused before they are sent. */
    maxSize?: number | null;
    /**
     * Where files are uploaded directly to storage. Defaults to the one of the fields context.
     * Without one, the value holds the files themselves, which the adapter sends in
     * `multipart/form-data`.
     */
    uploadSource?: UploadSource | null;
}

export interface SingleFileFieldProps extends FileFieldBaseProps {
    multiple?: false;
    value?: FileValue | null;
    onChange?: (value: FileValue | null) => void;
}

export interface MultipleFileFieldProps extends FileFieldBaseProps {
    multiple: true;
    value?: readonly FileValue[] | null;
    /** Called with the files. An empty list is `null`. */
    onChange?: (value: FileValue[] | null) => void;
}

export type FileFieldProps = SingleFileFieldProps | MultipleFileFieldProps;

function fileSize(file: FileValue): number | null {
    return typeof file.size === 'number' ? file.size : null;
}

function fileUrl(file: FileValue): string | null {
    return !(file instanceof Blob) && 'url' in file && typeof file.url === 'string'
        ? file.url
        : null;
}

function fileMime(file: FileValue): string | null {
    if (file instanceof Blob) {
        return file.type !== '' ? file.type : null;
    }
    return typeof file.mime === 'string' && file.mime !== '' ? file.mime : null;
}

/**
 * The URL of the preview of a file: its `thumbnailUrl`, or the URL of an image that browsers show
 * (`getImageUrl()`), or the data of an image the user just chose. `null` for other files.
 */
function usePreviewUrl(file: FileValue): string | null {
    const local = file instanceof Blob && file.type.startsWith('image/') ? file : null;
    const [preview, setPreview] = useState<{ file: Blob; url: string } | null>(null);
    useEffect(() => {
        if (local === null || typeof FileReader === 'undefined') {
            return undefined;
        }
        // A data URL, read once: nothing to revoke when the file changes.
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setPreview({ file: local, url: reader.result });
            }
        };
        reader.readAsDataURL(local);
        return () => reader.abort();
    }, [local]);
    if (local !== null) {
        return preview?.file === local ? preview.url : null;
    }
    return getImageUrl(file);
}

interface FileCardProps {
    file: FileValue;
    onRemove: (() => void) | null;
}

/** A file of the value: its thumbnail (or the icon of its type), its name, type and size. */
function FileCard({ file, onRemove }: FileCardProps) {
    const intl = usePanneauIntl();
    const { name } = file;
    const url = fileUrl(file);
    const size = fileSize(file);
    const mime = fileMime(file);
    const preview = usePreviewUrl(file);
    const kind = mime !== null ? kindOfMime(mime) : (getFileKind(file) ?? 'other');
    const extension = extensionOfName(name) ?? mime?.split('/')[1]?.toUpperCase() ?? null;
    const thumbnail = (
        <FileThumbnail
            src={preview}
            kind={kind}
            extension={extension}
            iconSize={28}
            className={styles.thumbnailIcon}
            imageClassName={styles.thumbnailImage}
        />
    );
    return (
        <li className={styles.file} data-kind={kind}>
            {url !== null ? (
                <a
                    href={url}
                    className={styles.thumbnail}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={-1}
                    aria-hidden
                >
                    {thumbnail}
                </a>
            ) : (
                <span className={styles.thumbnail}>{thumbnail}</span>
            )}
            <span className={styles.details}>
                {url !== null ? (
                    <a href={url} className={styles.name} target="_blank" rel="noreferrer">
                        {name}
                    </a>
                ) : (
                    <span className={styles.name}>{name}</span>
                )}
                {extension !== null || size !== null ? (
                    <span className={styles.meta}>
                        {[extension, size !== null ? formatSize(size, intl.locale) : null]
                            .filter((part) => part !== null)
                            .join(' · ')}
                    </span>
                ) : null}
            </span>
            {onRemove !== null ? (
                <IconButton
                    icon={X}
                    size="sm"
                    label={intl.formatMessage(messages.removeFile, { name })}
                    onPress={onRemove}
                    className={styles.remove}
                />
            ) : null}
        </li>
    );
}

/** Whether a value is a file of a `file` value. */
export function isFileValue(value: unknown): value is FileValue {
    if (typeof File !== 'undefined' && value instanceof File) {
        return true;
    }
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as { name?: unknown }).name === 'string'
    );
}

/** The files of a value, single or multiple. */
export function toFiles(value: unknown): FileValue[] {
    if (Array.isArray(value)) {
        return value.filter(isFileValue);
    }
    return isFileValue(value) ? [value] : [];
}

/**
 * Files that belong to an item, outside the media library: an attachment, a PDF, a CSV (the
 * `file` type). With an upload source, files go directly to storage, and the value references
 * each upload (`{ upload, name, mime, size }`). Without one, the value is the file itself. Items
 * give stored files, which the field shows with a link. A new file replaces the file of a single
 * value, and is added to a multiple one.
 */
export function FileField(props: FileFieldProps) {
    const intl = usePanneauIntl();
    const context = useFieldsContext();
    const {
        accept = null,
        maxSize = null,
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
    const uploadSource =
        props.uploadSource === undefined ? context.uploadSource : props.uploadSource;
    const multiple = props.multiple === true;
    const files = toFiles(props.value);
    const editable = disabled !== true && readOnly !== true;
    const [rejections, setRejections] = useState<string[]>([]);
    const rejectionMessage = useRejectionMessage(maxSize);

    // The files as last set, so that uploads that end together all add theirs.
    const latest = useRef(files);
    useEffect(() => {
        latest.current = files;
    });
    const set = (next: FileValue[]) => {
        latest.current = next;
        if (props.multiple === true) {
            props.onChange?.(next.length > 0 ? next : null);
        } else {
            props.onChange?.(next[0] ?? null);
        }
    };

    const upload = useUploads({
        source: uploadSource,
        accept,
        maxSize,
        onUploaded: (file) => set(multiple ? [...latest.current, file] : [file]),
        onRejected: (file, reason) =>
            setRejections((current) => [...current, rejectionMessage(file, reason)]),
    });

    return (
        <Fieldset
            legend={label}
            description={description}
            errors={[...errors, ...rejections]}
            isRequired={required}
            isDisabled={disabled}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            <div className={styles.field}>
                {files.length > 0 ? (
                    <ul className={styles.files}>
                        {files.map((file, index) => (
                            <FileCard
                                key={`${String(index)}-${file.name}`}
                                file={file}
                                onRemove={
                                    editable
                                        ? () => set(latest.current.filter((_, at) => at !== index))
                                        : null
                                }
                            />
                        ))}
                    </ul>
                ) : upload.items.length === 0 ? (
                    <span className={styles.none}>{intl.formatMessage(messages.noFile)}</span>
                ) : null}
                <UploadList
                    items={upload.items}
                    onPause={upload.pause}
                    onResume={upload.resume}
                    onCancel={upload.cancel}
                    onRetry={upload.retry}
                />
                {editable ? (
                    <FilePicker
                        accept={accept}
                        multiple={multiple}
                        {...(!multiple && files.length > 0
                            ? { label: intl.formatMessage(messages.replaceFile) }
                            : {})}
                        onSelect={(selected) => {
                            setRejections([]);
                            upload.add(selected);
                        }}
                    />
                ) : null}
            </div>
        </Fieldset>
    );
}

/**
 * The registry entry of the `file` type: the field's `multiple`, `accept` (or its `accept` rule)
 * and `maxSize` rule, with the upload source of the fields context.
 */
export function FileFieldEntry(props: FieldEntryProps) {
    const { field, value, onChange } = props;
    const common = {
        ...getFieldProps(props),
        accept: getAccept(field),
        maxSize: getMaxSize(field),
    };
    return field.multiple === true ? (
        <FileField {...common} multiple value={toFiles(value)} onChange={onChange} />
    ) : (
        <FileField {...common} value={toFiles(value)[0] ?? null} onChange={onChange} />
    );
}
