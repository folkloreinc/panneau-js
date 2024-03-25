/* eslint-disable react/jsx-props-no-spreading */
// import classNames from 'classnames';
import { Dashboard, DashboardModal } from '@uppy/react';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useQuery } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import ResourceItemsList from '@panneau/list-resource-items';
import Dialog from '@panneau/modal-dialog';
// import UploadModal from '@panneau/modal-upload';
import { useUppy } from '@panneau/uppy';

import styles from './styles.module.scss';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import '@uppy/status-bar/dist/style.css';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    types: PropTypes.arrayOf(PropTypes.oneOf(['audio', 'image', 'video', 'document'])),
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    withButton: PropTypes.bool,
    withFind: PropTypes.bool,
    withClearButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    findButtonLabel: PanneauPropTypes.label,
    clearButtonLabel: PanneauPropTypes.label,
    countLabel: PanneauPropTypes.label,
    confirmButtonLabel: PanneauPropTypes.label,
    cancelButtonLabel: PanneauPropTypes.label,
    allowMultipleUploads: PropTypes.bool,
    maxNumberOfFiles: PropTypes.number,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    linkPath: PropTypes.string,
    uppyProps: PropTypes.shape({ withUUID: PropTypes.bool }),
    width: PropTypes.number,
    height: PropTypes.number,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    onClickAdd: PropTypes.func,
    onClickFind: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    types: ['audio', 'image', 'video'],
    fileTypes: null,
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    withButton: false,
    withFind: false,
    withClearButton: false,
    addButtonLabel: (
        <FormattedMessage defaultMessage="Add file" description="Default upload add button label" />
    ),
    findButtonLabel: (
        <FormattedMessage
            defaultMessage="Find a file"
            description="Default upload add button label"
        />
    ),
    clearButtonLabel: (
        <FormattedMessage defaultMessage="Clear" description="Default upload add button label" />
    ),
    countLabel: <FormattedMessage defaultMessage="items selected" description="Items label" />,
    confirmButtonLabel: <FormattedMessage defaultMessage="Confirm" description="Button label" />,
    cancelButtonLabel: <FormattedMessage defaultMessage="Cancel" description="Button label" />,
    allowMultipleUploads: false,
    maxNumberOfFiles: 1,
    namePath: null,
    thumbnailPath: null,
    sizePath: null,
    linkPath: null,
    uppyProps: null,
    width: null,
    height: 300,
    disabled: false,
    onChange: null,
    onClear: null,
    onClickAdd: null,
    onClickFind: null,
    className: null,
};

const UploadField = ({
    value,
    types,
    fileTypes,
    sources,
    withButton,
    withFind,
    withClearButton,
    addButtonLabel,
    findButtonLabel,
    clearButtonLabel,
    countLabel,
    confirmButtonLabel,
    cancelButtonLabel,
    allowMultipleUploads,
    maxNumberOfFiles,
    namePath,
    thumbnailPath,
    sizePath,
    linkPath,
    uppyProps,
    width,
    height,
    disabled,
    onChange,
    onClear,
    onClickAdd,
    onClickFind,
    className,
}) => {
    const mergeData = useCallback((newValue) => {
        // Merge the response from our back-end
        if (
            isObject(newValue) &&
            isObject(newValue.response) &&
            newValue.response.status === 200 &&
            newValue.response.body !== null
        ) {
            return { ...newValue, ...(newValue.response.body || null) };
        }
        return newValue;
    }, []);

    const onComplete = useCallback(
        (response) => {
            // console.log('upload complete', response); // eslint-disable-line
            let newValue = null;
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
            } else {
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
        (idx) => {
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

    const [resourceModalOpen, setResourceModalOpen] = useState(false);
    const showResourceModal = withFind && resourceModalOpen;

    const toggleResourceModal = useCallback(() => {
        setResourceModalOpen(!resourceModalOpen);
    }, [resourceModalOpen, setResourceModalOpen]);

    const [modalItems, setModalItems] = useState([]);
    const closeResourceModal = useCallback(() => {
        setResourceModalOpen(false);
        setModalItems(null);
    }, [resourceModalOpen, setResourceModalOpen, setModalItems]);

    const onClickSelect = useCallback(
        (newValue) => {
            if (allowMultipleUploads) {
                console.log('newValue', newValue);
                if (newValue !== null && !isArray(newValue)) {
                    const { id = null } = newValue || {};
                    if (id !== null) {
                        const previous = (modalItems || []).find(
                            ({ id: itemId = null } = {}) => id === itemId,
                        );
                        if (previous) {
                            setModalItems(
                                (modalItems || []).filter(
                                    ({ id: itemId = null } = {}) => id !== itemId,
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
                onChange(newValue);
                setResourceModalOpen(false);
            }
        },
        [onChange, setResourceModalOpen, allowMultipleUploads, modalItems, setModalItems],
    );

    const confirmResourceModal = useCallback(() => {
        // console.log('confirm', modalItems, onChange);
        if (onChange !== null) {
            onChange(modalItems);
            setResourceModalOpen(false);
            setModalItems(null);
        }
    }, [onChange, setResourceModalOpen, modalItems, allowMultipleUploads, setModalItems]);

    const initialQuery = useMemo(() => ({ types }), [types]);
    const {
        query: listQuery,
        onPageChange: onListPageChange,
        onQueryChange: onListQueryChange,
        onQueryReset: onListQueryReset,
    } = useQuery(initialQuery, true);

    // console.log(
    //     'modalOpened',
    //     !showResourceModal && !disabled && withButton && uppy !== null && modalOpened,
    // );
    // console.log('uppy', uppy);

    const containerRef = useRef(null);

    // Keep this stable, uppy doesnt like
    const [finalUppy, setFinalUppy] = useState(null);
    useEffect(() => {
        if (uppy !== null && finalUppy === null) {
            setFinalUppy(uppy);
        }
    }, [uppy, finalUppy]);

    return (
        <div
            className={classNames([styles.container, { [className]: className !== null }])}
            ref={containerRef}
        >
            {hasMedia ? (
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

            {hasMedia && withClearButton ? (
                <div className="row mt-2">
                    <div className="col-auto">
                        <Button type="button" theme="primary" onClick={onClickClear} outline>
                            <Label>{clearButtonLabel}</Label>
                        </Button>
                    </div>
                </div>
            ) : null}

            {(!hasMedia || allowMultipleUploads) && withButton ? (
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

            {!showResourceModal && !disabled && !hasMedia && !withButton && finalUppy !== null ? (
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

            {/* modal versions */}

            {!showResourceModal && !disabled && withButton && finalUppy !== null && modalOpened ? (
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
            ) : null}

            {showResourceModal ? (
                <Dialog
                    title={<Label>{findButtonLabel}</Label>}
                    size="xl"
                    onClose={closeResourceModal}
                >
                    <ResourceItemsList
                        resource="medias"
                        query={listQuery}
                        onPageChange={onListPageChange}
                        onQueryChange={onListQueryChange}
                        onQueryReset={onListQueryReset}
                        baseUrl={null}
                        showActions={false}
                        selectable
                        onSelectionChange={onClickSelect}
                        multipleSelection={allowMultipleUploads}
                    />
                    {allowMultipleUploads ? (
                        <div className="d-flex mt-4 justify-content-between">
                            {modalItems !== null && modalItems.length > 0 ? (
                                <span className="me-2">
                                    {modalItems.length} {countLabel}
                                </span>
                            ) : (
                                <span />
                            )}
                            <div className="d-flex">
                                <Button
                                    type="button"
                                    theme="warning"
                                    onClick={closeResourceModal}
                                    disabled={disabled}
                                    className="d-block me-2"
                                >
                                    <Label>{cancelButtonLabel}</Label>
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
                                    <Label>{confirmButtonLabel}</Label>
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </Dialog>
            ) : null}
        </div>
    );
};

UploadField.propTypes = propTypes;
UploadField.defaultProps = defaultProps;

export default UploadField;
