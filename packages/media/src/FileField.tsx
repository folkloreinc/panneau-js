import { FileText, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { PresignedUploads } from '@panneau/data/uploads';
import { type FieldEntryProps, type FieldProps, getFieldProps } from '@panneau/fields';
import type { StoredFile } from '@panneau/protocol';
import { Fieldset, IconButton, usePanneauIntl } from '@panneau/ui';

import styles from './FileField.module.css';
import { FilePicker } from './FilePicker';
import { UploadList } from './UploadList';
import { formatSize } from './files';
import { messages } from './messages';
import { getAccept, getMaxSize, useMediaServices } from './services';
import type { UploadRejection, UploadedFile } from './uploader';
import { useUploads } from './useUploads';

/**
 * A file of a `file` value: a stored file, as items give it; an upload, once the browser sent the
 * file to storage; or the file itself, sent in a multipart request without direct uploads.
 */
export type FileValue = StoredFile | UploadedFile | File;

interface FileFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** Accepted MIME types (`application/pdf`, `image/*`). Others are refused before they are sent. */
    accept?: readonly string[] | null;
    /** Largest file, in bytes. Larger ones are refused before they are sent. */
    maxSize?: number | null;
    /**
     * Direct uploads to storage (`adapter.presignedUploads()`). Without them, the value is the
     * file itself, which the adapter sends in `multipart/form-data`.
     */
    uploads?: PresignedUploads | null;
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

function fileName(file: FileValue): string {
    return file.name;
}

function fileSize(file: FileValue): number | null {
    return typeof file.size === 'number' ? file.size : null;
}

function fileUrl(file: FileValue): string | null {
    return !(file instanceof Blob) && 'url' in file && typeof file.url === 'string'
        ? file.url
        : null;
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

/** The message of a file refused before it was sent. */
export function useRejectionMessage(maxSize: number | null | undefined) {
    const intl = usePanneauIntl();
    return (file: File, reason: UploadRejection) =>
        reason === 'accept'
            ? intl.formatMessage(messages.rejectedType, { name: file.name })
            : intl.formatMessage(messages.rejectedSize, {
                  name: file.name,
                  size: formatSize(maxSize ?? 0, intl.locale),
              });
}

/**
 * Files that belong to an item, outside the media library: an attachment, a PDF, a CSV (the
 * `file` type). With direct uploads, files go to storage with Uppy, in parts when they are large,
 * and the value references each upload (`{ upload, name, mime, size }`). Without them, the value
 * is the file itself. Items give stored files, which the field shows with a link.
 */
export function FileField(props: FileFieldProps) {
    const intl = usePanneauIntl();
    const {
        accept = null,
        maxSize = null,
        uploads = null,
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
        uploads,
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
                        {files.map((file, index) => {
                            const name = fileName(file);
                            const url = fileUrl(file);
                            const size = fileSize(file);
                            return (
                                <li key={`${String(index)}-${name}`} className={styles.file}>
                                    <FileText aria-hidden className={styles.icon} />
                                    {url !== null ? (
                                        <a
                                            href={url}
                                            className={styles.name}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {name}
                                        </a>
                                    ) : (
                                        <span className={styles.name}>{name}</span>
                                    )}
                                    {size !== null ? (
                                        <span className={styles.size}>
                                            {formatSize(size, intl.locale)}
                                        </span>
                                    ) : null}
                                    {editable ? (
                                        <IconButton
                                            icon={X}
                                            size="sm"
                                            label={intl.formatMessage(messages.remove, { name })}
                                            onPress={() =>
                                                set(latest.current.filter((_, at) => at !== index))
                                            }
                                        />
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <span className={styles.none}>{intl.formatMessage(messages.noFile)}</span>
                )}
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
 * The registry entry of the `file` type: the field's `multiple`, `accept` and `maxSize`, with the
 * direct uploads that the definition announces, through the adapter of `@panneau/data`.
 */
export function FileFieldEntry(props: FieldEntryProps) {
    const { field, value, onChange } = props;
    const { uploads } = useMediaServices();
    const common = {
        ...getFieldProps(props),
        accept: getAccept(field),
        maxSize: getMaxSize(field),
        uploads,
    };
    return field.multiple === true ? (
        <FileField {...common} multiple value={toFiles(value)} onChange={onChange} />
    ) : (
        <FileField {...common} value={toFiles(value)[0] ?? null} onChange={onChange} />
    );
}
