import type Uppy from '@uppy/core';
import { UppyContextProvider } from '@uppy/react';
import Dashboard from '@uppy/react/dashboard';
import DashboardModal from '@uppy/react/dashboard-modal';
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label as LabelType, Media, MediaType } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import { type UseUppyOptions, useUppy } from '@panneau/uppy';

import styles from './styles.module.css';
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

type MediaSource = 'webcam' | 'facebook' | 'instagram' | 'dropbox' | 'google-drive';

interface UploadFieldProps {
    value?: Media | Media[] | null;
    name?: string | null;
    types?: MediaType[] | null;
    fileTypes?: string[] | null;
    sources?: MediaSource[];
    withButton?: boolean;
    withClearButton?: boolean;
    withoutMedia?: boolean;
    addButtonLabel?: LabelType | null;
    clearButtonLabel?: LabelType | null;
    multiple?: boolean;
    closeAfterFinish?: boolean;
    maxNumberOfFiles?: number;
    namePath?: string;
    thumbnailPath?: string;
    sizePath?: string;
    linkPath?: string | null;
    uppyConfig?: UseUppyOptions | null;
    width?: number | null;
    height?: number | null;
    disabled?: boolean;
    uploadDisabled?: boolean;
    outline?: boolean;
    loading?: boolean;
    onChange?: ((value: Media | Media[] | null) => void) | null;
    onClear?: (() => void) | null;
    onClickAdd?: (() => void) | null;
    onClose?: ((value: Media | Media[] | null) => void) | null;
    className?: string | null;
}

const DEFAULT_TYPES: MediaType[] = ['audio', 'image', 'video'];
const DEFAULT_SOURCES: MediaSource[] = [
    'webcam',
    'facebook',
    'instagram',
    'dropbox',
    'google-drive',
];

function UploadField({
    value = null,
    types = DEFAULT_TYPES,
    fileTypes = null,
    sources = DEFAULT_SOURCES,
    withButton = false,
    withClearButton = false,
    withoutMedia = false,
    addButtonLabel: initialAddButtonLabel = null,
    clearButtonLabel: initialCleanButtonLabel = null,
    multiple = false,
    closeAfterFinish = true,
    maxNumberOfFiles = 1,
    namePath = 'name',
    thumbnailPath = 'thumbnail_url',
    sizePath = 'metadata.size',
    linkPath = null,
    uppyConfig = null,
    width = null,
    height = 300,
    disabled = false,
    uploadDisabled = false,
    outline = true,
    loading: parentLoading = false,
    onChange = null,
    onClear = null,
    onClickAdd = null,
    className = null,
}: UploadFieldProps) {
    const addButtonLabel = initialAddButtonLabel || (
        <FormattedMessage
            defaultMessage="Upload file"
            description="Default upload add button label"
        />
    );
    const clearButtonLabel = initialCleanButtonLabel || (
        <FormattedMessage defaultMessage="Clear" description="Default upload add button label" />
    );

    const mergeData = useCallback((newValue: Media) => {
        // Merge the response from our back-end
        if (
            isObject(newValue) &&
            isObject(newValue.response) &&
            (newValue.response as any).status === 200 &&
            (newValue.response as any).body !== null
        ) {
            return { ...newValue, ...((newValue.response as any).body || null) };
        }
        return newValue;
    }, []);

    const onComplete = useCallback(
        (response: any) => {
            let newValue: Media | Media[] | null = null;
            if (isArray(response)) {
                if (multiple) {
                    newValue = response;
                } else {
                    const [first] = response;
                    newValue = first;
                }
            } else if (response && response.successful) {
                newValue =
                    response.successful.length > 0 ? response.successful[0].response.body : null;
            }

            if (isArray(newValue)) {
                newValue = newValue.map((val) => mergeData(val));
            } else if (newValue !== null) {
                newValue = mergeData(newValue);
            }

            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, multiple, mergeData],
    );

    const typesString = useMemo(
        () => (types !== null ? types.join('.') : ['audio', 'image', 'video'].join('.')),
        [types],
    );

    const allowedFileTypes = useMemo(() => {
        if (fileTypes !== null) {
            return fileTypes;
        }
        return typesString.split('.').map((type) => `${type}/*`);
    }, [typesString, fileTypes]);

    const uppyFinalProps = useMemo(
        () => ({
            maxNumberOfFiles: multiple && maxNumberOfFiles === 1 ? 50 : maxNumberOfFiles,
            allowedFileTypes,
            sources,
            ...uppyConfig,
            allowMultipleUploads: multiple,
            autoProceed: true,
            onComplete,
        }),
        [uppyConfig, allowedFileTypes, multiple, maxNumberOfFiles, sources, onComplete],
    );
    const uppy = useUppy(uppyFinalProps);

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(!modalOpened);
    }, [modalOpened, setModalOpened]);

    const closeModal = useCallback(() => {
        setModalOpened(false);
        if (uppy !== null) {
            uppy.cancelAll();
        }
    }, [uppy, setModalOpened]);

    const onClickClear = useCallback(() => {
        if (onClear !== null) {
            onClear();
        }
        if (onChange !== null) {
            onChange(null);
        }
        if (uppy !== null) {
            uppy.cancelAll();
        }
    }, [uppy, onClear, onChange]);

    const onClickRemove = useCallback(
        (idx: number) => {
            if (onChange !== null && isArray(value) && value.length > 1) {
                onChange(value.filter((v, i) => i !== idx));
            } else if (onChange !== null) {
                onChange(null);
            }
        },
        [value, onChange],
    );

    const hasMedia = isArray(value) ? value.length > 0 : value !== null;

    const containerRef = useRef<HTMLDivElement>(null);

    // Keep this stable, uppy doesnt like changes
    const [finalUppy, setFinalUppy] = useState<Uppy>(null);
    useEffect(() => {
        if (uppy !== null && finalUppy === null) {
            setFinalUppy(uppy);
        }
    }, [uppy, finalUppy]);

    // Uppy state
    const [loading, setLoading] = useState(false);
    const startLoading = useCallback(() => {
        setLoading(true);
    }, []);
    const endLoading = useCallback(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        if (uppy !== null) {
            uppy.on('upload', startLoading);
            uppy.on('complete', endLoading);
            uppy.on('upload-error', endLoading);
            uppy.on('error', endLoading);
            // uppy.on('cancell-all', endLoading);
        }
        return () => {
            if (uppy !== null) {
                uppy.off('upload', startLoading);
                uppy.off('complete', endLoading);
                uppy.off('upload-error', endLoading);
                uppy.off('error', endLoading);
                // uppy.off('cancell-all', endLoading);
            }
        };
    }, [uppy, startLoading, endLoading]);

    const finalLoading = loading || parentLoading;

    return (
        <div className={className} ref={containerRef}>
            {!withoutMedia && hasMedia ? (
                <MediaCards
                    value={value}
                    namePath={namePath}
                    thumbnailPath={thumbnailPath}
                    sizePath={sizePath}
                    linkPath={linkPath}
                    disabled={disabled}
                    onClickRemove={onClickRemove}
                />
            ) : null}

            <div className={classNames('d-flex')}>
                {withClearButton && !withoutMedia && hasMedia ? (
                    <Button type="button" theme="primary" onClick={onClickClear}>
                        <Label>{clearButtonLabel}</Label>
                    </Button>
                ) : null}

                {withButton && (withoutMedia || !hasMedia || multiple) ? (
                    <Button
                        type="button"
                        theme="primary"
                        icon={finalLoading ? 'loading' : 'upload'}
                        iconPosition="right"
                        onClick={onClickAdd || openModal}
                        disabled={finalLoading || disabled}
                        outline={outline}
                    >
                        <Label>
                            {finalLoading ? (
                                <FormattedMessage
                                    defaultMessage="Uploading"
                                    description="Button label"
                                />
                            ) : (
                                addButtonLabel
                            )}
                        </Label>
                    </Button>
                ) : null}
            </div>

            {finalUppy !== null ? (
                <UppyContextProvider uppy={finalUppy}>
                    {!uploadDisabled && !hasMedia && !withButton && finalUppy !== null ? (
                        <div className={styles.dashboard}>
                            <Dashboard
                                uppy={finalUppy}
                                {...(width !== null ? { width } : null)}
                                {...(height !== null ? { height } : null)}
                                disabled={disabled}
                                plugins={sources}
                                proudlyDisplayPoweredByUppy={false}
                            />
                        </div>
                    ) : null}

                    {!uploadDisabled && withButton && finalUppy !== null && modalOpened ? (
                        <DashboardModal
                            uppy={finalUppy}
                            className={styles.dashboardModal}
                            plugins={sources}
                            disabled={disabled}
                            open
                            onRequestClose={closeModal}
                            proudlyDisplayPoweredByUppy={false}
                            closeModalOnClickOutside
                            doneButtonHandler={closeModal}
                            closeAfterFinish={closeAfterFinish}
                        />
                    ) : null}
                </UppyContextProvider>
            ) : null}
        </div>
    );
}

export default UploadField;
