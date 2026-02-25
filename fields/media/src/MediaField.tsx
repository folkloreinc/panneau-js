// import classNames from 'classnames';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Label } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import ModalPicker from '@panneau/modal-medias-picker';

import styles from './styles.module.css';

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

interface MediaFieldProps {
    resource?: string;
    value?: Media | Media[] | null;
    name?: string | null;
    types?: MediaType[];
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
    maxNumberOfFiles?: number;
    namePath?: string;
    thumbnailPath?: string;
    sizePath?: string;
    linkPath?: string | null;
    uppyProps?: UppyProps | null;
    disabled?: boolean;
    onChange?: ((value: Media | Media[] | null) => void) | null;
    onClickAdd?: (() => void) | null;
    onClickFind?: (() => void) | null;
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

function MediaField({
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
    maxNumberOfFiles = 1,
    namePath = 'name',
    thumbnailPath = 'thumbnail_url',
    sizePath = 'metadata.size',
    linkPath = null,
    uppyProps = null,
    disabled = false,
    onChange = null,
    onClickAdd = null,
    onClickFind = null,
    className = null,
}: MediaFieldProps) {
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

    const typesString = useMemo(() => types.join('.'), [types]);
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
            ...uppyProps,
            allowedFileTypes,
            allowMultipleUploads,
            sources,
            autoProceed: true,
            onComplete,
        }),
        [uppyProps, allowedFileTypes, allowMultipleUploads, maxNumberOfFiles, sources, onComplete],
    );

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(!modalOpened);
    }, [modalOpened, setModalOpened]);

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

    const hasMedia = values !== null && values.length > 0;

    // Resource-modal-picker
    const modalKey = `upload-field-${name}`;
    const [resourceModalOpen, setResourceModalOpen] = useState(false);
    const showResourceModal = withFind && resourceModalOpen;

    const toggleResourceModal = useCallback(() => {
        if (resourceModalOpen) {
            setResourceModalOpen(false);
        } else {
            setResourceModalOpen(true);
        }
    }, [resourceModalOpen, setResourceModalOpen, modalKey]);

    const [modalItems, setModalItems] = useState<Media[]>([]);
    const closeResourceModal = useCallback(() => {
        setResourceModalOpen(false);
        setModalItems([]);
    }, [resourceModalOpen, setResourceModalOpen, modalKey, setModalItems]);

    const onChangeSelection = useCallback(
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
            } else if (onChange !== null) {
                // Single value onchange
                const [finalValue = null] = isArray(newValue) ? newValue : [newValue];
                onChange(finalValue);
                setResourceModalOpen(false);
            }
        },
        [onChange, setResourceModalOpen, modalKey, allowMultipleUploads, modalItems, setModalItems],
    );

    const onConfirmSelection = useCallback(() => {
        if (onChange !== null) {
            onChange(modalItems);
            setResourceModalOpen(false);
        }
    }, [onChange, modalItems, setResourceModalOpen, modalKey, allowMultipleUploads]);

    const containerRef = useRef<HTMLDivElement>(null);

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
                        <Button
                            type="button"
                            theme="primary"
                            onClick={() => onChange(null)}
                            outline
                        >
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
                            onClick={onClickAdd || openModal}
                            disabled={disabled}
                            outline
                        >
                            <Label>{addButtonLabel}</Label>
                        </Button>
                    </div>
                    {withFind ? (
                        <div className="col-auto ps-0">
                            <Button
                                type="button"
                                theme="primary"
                                onClick={onClickFind || toggleResourceModal}
                                disabled={disabled}
                                outline
                            >
                                <Label>{findButtonLabel}</Label>
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {/* {!showResourceModal && !disabled && !hasMedia && !withButton && finalUppy !== null ? (
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
            ) : null} */}

            {/* {!showResourceModal && !disabled && withButton && finalUppy !== null && modalOpened ? (
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
                />
            ) : null} */}

            {showResourceModal ? (
                <ModalPicker
                    id={modalKey}
                    value={value}
                    resource={resource}
                    types={types}
                    selectable
                    onChange={onChangeSelection}
                    onConfirm={onConfirmSelection}
                    onClose={closeResourceModal}
                    uppyConfig={uppyFinalProps}
                    // buttons={[
                    //     {
                    //         id: 'upload',
                    //         label: addButtonLabel,
                    //         theme: 'primary',
                    //         onClick: openModalInResource,
                    //     },
                    // ]}
                    // buttonsClassName="ms-xl-auto"
                    multiple={allowMultipleUploads}
                />
            ) : null}
        </div>
    );
}

export default MediaField;
