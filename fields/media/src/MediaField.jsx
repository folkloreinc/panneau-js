/* eslint-disable react/jsx-props-no-spreading */
// import classNames from 'classnames';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useModal } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import { MediaCards } from '@panneau/element-media-card';
import ModalPicker from '@panneau/modal-medias-picker';

import styles from './styles.module.scss';

const propTypes = {
    resource: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    name: PropTypes.string,
    types: PropTypes.arrayOf(PropTypes.oneOf(['audio', 'image', 'video', 'document'])),
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    withButton: PropTypes.bool,
    withFind: PropTypes.bool,
    withClearButton: PropTypes.bool,
    withoutMedia: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    findButtonLabel: PanneauPropTypes.label,
    clearButtonLabel: PanneauPropTypes.label,
    allowMultipleUploads: PropTypes.bool,
    maxNumberOfFiles: PropTypes.number,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    linkPath: PropTypes.string,
    uppyProps: PropTypes.shape({ withUUID: PropTypes.bool }),
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onClickAdd: PropTypes.func,
    onClickFind: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    resource: 'medias',
    value: null,
    name: null,
    types: ['audio', 'image', 'video'],
    fileTypes: null,
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    withButton: false,
    withFind: false,
    withClearButton: false,
    withoutMedia: false,
    addButtonLabel: (
        <FormattedMessage
            defaultMessage="Upload file"
            description="Default upload add button label"
        />
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
    allowMultipleUploads: false,
    maxNumberOfFiles: 1,
    namePath: 'name',
    thumbnailPath: 'thumbnail_url',
    sizePath: 'metadata.size',
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
    resource,
    value,
    name,
    types,
    fileTypes,
    sources,
    withButton,
    withFind,
    withClearButton,
    withoutMedia,
    addButtonLabel,
    findButtonLabel,
    clearButtonLabel,
    allowMultipleUploads,
    maxNumberOfFiles,
    namePath,
    thumbnailPath,
    sizePath,
    linkPath,
    uppyProps,
    disabled,
    onChange,
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

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(!modalOpened);
    }, [modalOpened, setModalOpened]);

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

    // Resource-modal-picker
    const { register, unregister, modalIsOpen } = useModal();
    const modalKey = `upload-field-${name}`;
    const resourceModalOpen = modalIsOpen(modalKey);
    const showResourceModal = withFind && resourceModalOpen;

    const toggleResourceModal = useCallback(() => {
        if (resourceModalOpen) {
            unregister(modalKey);
        } else {
            register(modalKey);
        }
    }, [resourceModalOpen, register, unregister, modalKey]);

    const [modalItems, setModalItems] = useState([]);
    const closeResourceModal = useCallback(() => {
        unregister(modalKey);
        setModalItems(null);
    }, [resourceModalOpen, unregister, modalKey, setModalItems]);

    const onChangeSelection = useCallback(
        (newValue) => {
            if (allowMultipleUploads) {
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
                // Single value onchange
                const [finalValue = null] = isArray(newValue) ? newValue : [newValue];
                onChange(finalValue);
                unregister(modalKey);
            }
        },
        [onChange, unregister, modalKey, allowMultipleUploads, modalItems, setModalItems],
    );

    const onConfirmSelection = useCallback(() => {
        if (onChange !== null) {
            onChange(modalItems);
            unregister(modalKey);
        }
    }, [onChange, modalItems, unregister, modalKey, allowMultipleUploads]);

    const containerRef = useRef(null);

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
                        <Button type="button" theme="primary" onClick={onClickClear} outline>
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
};

UploadField.propTypes = propTypes;
UploadField.defaultProps = defaultProps;

export default UploadField;
