/* eslint-disable react/jsx-props-no-spreading */
// import classNames from 'classnames';
import { UppyContextProvider } from '@uppy/react';
import Dashboard from '@uppy/react/dashboard';
import DashboardModal from '@uppy/react/dashboard-modal';
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label } from '@panneau/core/types';
import { useQuery } from '@panneau/core/hooks';
// import { useModal } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import ModalResourceItems from '@panneau/modal-resource-items';
// import ModalPicker from '@panneau/modal-medias-picker';
// import UploadModal from '@panneau/modal-upload';
import { useUppy } from '@panneau/uppy';

import styles from './styles.module.css';
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

// import '@uppy/react/css/style.css';

type MediaType = 'audio' | 'image' | 'video' | 'document';
type MediaSource = 'webcam' | 'facebook' | 'instagram' | 'dropbox' | 'google-drive';

interface Media {
    filename?: string;
    size?: number;
    url?: string;
    id?: string | number;
    [key: string]: unknown;
}

interface UppyProps {
    withUUID?: boolean;
    [key: string]: unknown;
}

interface UploadFieldProps {
    resource?: string;
    value?: Media | Media[] | null;
    name?: string | null;
    types?: MediaType[] | null;
    fileTypes?: string[] | null;
    sources?: MediaSource[];
    withButton?: boolean;
    withFind?: boolean;
    withClearButton?: boolean;
    withoutMedia?: boolean;
    addButtonLabel?: Label | null;
    findButtonLabel?: Label | null;
    clearButtonLabel?: Label | null;
    allowMultipleUploads?: boolean;
    closeAfterFinish?: boolean;
    maxNumberOfFiles?: number;
    namePath?: string;
    thumbnailPath?: string;
    sizePath?: string;
    linkPath?: string | null;
    uppyProps?: UppyProps | null;
    width?: number | null;
    height?: number | null;
    disabled?: boolean;
    uploadDisabled?: boolean;
    outline?: boolean;
    loading?: boolean;
    onChange?: ((value: Media | Media[] | null) => void) | null;
    onClear?: (() => void) | null;
    onClickAdd?: (() => void) | null;
    onClickFind?: (() => void) | null;
    onClose?: ((value: Media | Media[] | null) => void) | null;
    className?: string | null;
}

const DEFAULT_TYPES: MediaType[] = ['audio', 'image', 'video'];
const DEFAULT_SOURCES: MediaSource[] = ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'];

function UploadField({
    resource = 'medias',
    value = null,
    name = null,
    types = DEFAULT_TYPES,
    fileTypes = null,
    sources = DEFAULT_SOURCES,
    withButton = false,
    withFind = false,
    withClearButton = false,
    withoutMedia = false,
    addButtonLabel: initialAddButtonLabel = null,
    findButtonLabel: initialFindButtonLabel = null,
    clearButtonLabel: initialCleanButtonLabel = null,
    allowMultipleUploads = false,
    closeAfterFinish = true,
    maxNumberOfFiles = 1,
    namePath = 'name',
    thumbnailPath = 'thumbnail_url',
    sizePath = 'metadata.size',
    linkPath = null,
    uppyProps = null,
    width = null,
    height = 300,
    disabled = false,
    uploadDisabled = false,
    outline = true,
    loading: parentLoading = false,
    onChange = null,
    onClear = null,
    onClickAdd = null,
    onClickFind = null,
    className = null,
}: UploadFieldProps) {
    const addButtonLabel = initialAddButtonLabel || (
        <FormattedMessage
            defaultMessage="Upload file"
            description="Default upload add button label"
        />
    );
    const findButtonLabel = initialFindButtonLabel || (
        <FormattedMessage
            defaultMessage="Find a file"
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
            // console.log('upload complete', response); // eslint-disable-line
            let newValue: Media | Media[] | null = null;
            if (isArray(response)) {
                if (allowMultipleUploads) {
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

            // console.log('new upload value', newValue); // eslint-disable-line

            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, allowMultipleUploads, mergeData],
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
            maxNumberOfFiles:
                allowMultipleUploads && maxNumberOfFiles === 1 ? 50 : maxNumberOfFiles,
            allowedFileTypes,
            sources,
            ...uppyProps,
            allowMultipleUploads,
            autoProceed: true,
            onComplete,
        }),
        [uppyProps, allowedFileTypes, allowMultipleUploads, maxNumberOfFiles, sources, onComplete],
    );
    const uppy = useUppy(uppyFinalProps);

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(!modalOpened);
    }, [modalOpened, setModalOpened]);

    const closeModal = useCallback(() => {
        setModalOpened(false);
        if (uppy !== null) {
            uppy.cancelAll({ reason: 'user' });
        }
    }, [uppy, setModalOpened]);

    const onClickClear = useCallback(() => {
        if (onClear !== null) {
            onClear();
        }
        if (uppy !== null) {
            uppy.cancelAll({ reason: 'user' });
        }
    }, [uppy, onClear]);

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

    const values = useMemo(() => {
        if (isArray(value)) {
            return value;
        }
        return value !== null ? [value] : null;
    }, [value]);

    // Resource-modal-picker
    const hasMedia = values !== null && values.length > 0;

    const [resourceModalOpen, setResourceModalOpen] = useState(false);
    const showResourceModal = resource !== null && withFind && resourceModalOpen;

    const openResourceModal = useCallback(() => {
        setResourceModalOpen(true);
    }, [resourceModalOpen, setResourceModalOpen]);

    const [modalItems, setModalItems] = useState<Media[]>([]);
    const closeResourceModal = useCallback(() => {
        setResourceModalOpen(false);
        setModalItems([]);
    }, [resourceModalOpen, setResourceModalOpen, setModalItems]);

    const finalOnClickFind = useCallback(() => {
        if (onClickFind !== null) {
            onClickFind();
        } else {
            openResourceModal();
        }
    }, [onClickFind, openResourceModal]);

    const onSelectionChange = useCallback(
        (newValue: Media | Media[] | null) => {
            if (allowMultipleUploads) {
                if (newValue !== null && !isArray(newValue)) {
                    const { id = null } = newValue || {};
                    if (id !== null) {
                        const previous = (modalItems || []).find(
                            ({ id: itemId = null }: any = {}) => id === itemId,
                        );
                        if (previous) {
                            setModalItems(
                                (modalItems || []).filter(
                                    ({ id: itemId = null }: any = {}) => id !== itemId,
                                ),
                            );
                        } else {
                            setModalItems([...(modalItems || []), newValue]);
                        }
                    }
                } else if (newValue !== null && isArray(newValue)) {
                    setModalItems(newValue);
                }
            } else {
                setModalItems(newValue as Media[]);
            }
        },
        [onChange, setResourceModalOpen, allowMultipleUploads, modalItems, setModalItems],
    );

    const confirmResourceModal = useCallback(() => {
        if (onChange !== null) {
            // Always multiple onchange
            onChange(modalItems);
            setResourceModalOpen(false);
            setModalItems([]);
        }
    }, [onChange, setResourceModalOpen, modalItems, allowMultipleUploads, setModalItems]);

    const initialQuery = useMemo(() => ({ types }), [types]);
    const {
        query: listQuery,
        onPageChange: onListPageChange,
        onQueryChange: onListQueryChange,
        onQueryReset: onListQueryReset,
    } = useQuery(initialQuery, true);

    const containerRef = useRef<HTMLDivElement>(null);

    // Keep this stable, uppy doesnt like changes
    const [finalUppy, setFinalUppy] = useState<any>(null);
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
            uppy.on('cancell-all', endLoading);
        }
        return () => {
            if (uppy !== null) {
                uppy.off('upload', startLoading);
                uppy.off('complete', endLoading);
                uppy.off('upload-error', endLoading);
                uppy.off('error', endLoading);
                uppy.off('cancell-all', endLoading);
            }
        };
    }, [uppy, startLoading, endLoading]);

    const finalLoading = loading || parentLoading;

    return (
        <div
            className={classNames([styles.container, { [className]: className !== null }])}
            ref={containerRef}
        >
            {!withoutMedia && hasMedia ? (
                <MediaCards
                    value={values}
                    namePath={namePath}
                    thumbnailPath={thumbnailPath}
                    sizePath={sizePath}
                    linkPath={linkPath}
                    disabled={disabled}
                    onClickRemove={onClickRemove}
                />
            ) : null}

            {!withoutMedia && hasMedia && withClearButton ? (
                <div className="row mt-2">
                    <div className="col-auto">
                        <Button type="button" theme="primary" onClick={onClickClear}>
                            <Label>{clearButtonLabel}</Label>
                        </Button>
                    </div>
                </div>
            ) : null}

            {withoutMedia || ((!hasMedia || allowMultipleUploads) && withButton) ? (
                <div className="row">
                    <div className="col-auto">
                        <Button
                            id="trigger-uppy"
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
                    </div>
                    {withFind ? (
                        <div className="col-auto ps-0">
                            <Button
                                type="button"
                                theme="primary"
                                icon="search"
                                iconPosition="right"
                                onClick={finalOnClickFind}
                                disabled={disabled}
                                outline={outline}
                            >
                                <Label>{findButtonLabel}</Label>
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {finalUppy !== null ? (
                <UppyContextProvider uppy={finalUppy}>
                    {!uploadDisabled && !hasMedia && !withButton && finalUppy !== null ? (
                        <div className={styles.dashboard}>
                            <Dashboard
                                uppy={finalUppy}
                                // {...(containerWidth !== null && height !== null
                                //     ? { width: containerWidth }
                                // : null)}
                                {...(width !== null ? { width } : null)}
                                {...(height !== null ? { height } : null)}
                                plugins={sources}
                                inline
                                showProgressDetails
                                areInsidesReadyToBeVisible
                                proudlyDisplayPoweredByUppy={false}
                            />
                        </div>
                    ) : null}

                    {!showResourceModal &&
                    !uploadDisabled &&
                    withButton &&
                    finalUppy !== null &&
                    modalOpened ? (
                        <DashboardModal
                            uppy={finalUppy}
                            className={styles.dashboardModal}
                            plugins={sources}
                            open
                            onRequestClose={closeModal}
                            proudlyDisplayPoweredByUppy={false}
                            closeModalOnClickOutside
                            areInsidesReadyToBeVisible
                            isDashboardVisible
                            showProgressDetails
                            showAddFilesPanel
                            doneButtonHandler={closeModal}
                            closeAfterFinish={closeAfterFinish}
                        />
                    ) : null}
                </UppyContextProvider>
            ) : null}

            {showResourceModal ? (
                <ModalResourceItems
                    id={`upload-${name}`}
                    resource={resource}
                    query={listQuery}
                    onPageChange={onListPageChange}
                    onQueryChange={onListQueryChange}
                    onQueryReset={onListQueryReset}
                    baseUrl={null}
                    showActions={false}
                    selectable
                    selectedItems={modalItems}
                    onSelectionChange={onSelectionChange}
                    multipleSelection={allowMultipleUploads}
                    onClose={closeResourceModal}
                >
                    <div className="d-flex mt-4 justify-content-between">
                        {modalItems !== null && modalItems.length > 0 ? (
                            <span className="me-2">{modalItems.length} items</span>
                        ) : (
                            <span />
                        )}
                        <div className="d-flex">
                            <Button
                                type="button"
                                theme="secondary"
                                onClick={closeResourceModal}
                                disabled={disabled}
                                className="d-block me-2"
                            >
                                <FormattedMessage
                                    defaultMessage="Cancel"
                                    description="Button label"
                                />
                            </Button>
                            <Button
                                type="button"
                                theme="primary"
                                onClick={confirmResourceModal}
                                disabled={
                                    disabled || (modalItems !== null && modalItems.length === 0)
                                }
                                className="d-block"
                            >
                                <FormattedMessage
                                    defaultMessage="Confirm selection"
                                    description="Button label"
                                />
                            </Button>
                        </div>
                    </div>
                </ModalResourceItems>
            ) : null}
        </div>
    );
}

export default UploadField;
