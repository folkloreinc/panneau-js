import { faFileAudio, faFileImage, faFileVideo, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUppy } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
// import classNames from 'classnames';
import { Dashboard, DashboardModal } from '@uppy/react';
import isArray from 'lodash/isArray';
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    value: PropTypes.oneOf([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    types: PropTypes.arrayOf(PropTypes.oneOf(['audio', 'image', 'video'])),
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    withButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    allowMultipleUploads: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    types: ['audio', 'image', 'video'],
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    withButton: false,
    addButtonLabel: (
        <FormattedMessage defaultMessage="Add file" description="Default upload add button label" />
    ),
    allowMultipleUploads: false,
    onChange: null,
    className: null,
};

const UploadField = ({
    value,
    types,
    sources,
    withButton,
    addButtonLabel,
    allowMultipleUploads,
    onChange,
    className,
}) => {
    const onComplete = useCallback(
        (response) => {
            console.log('upload complete', response); // eslint-disable-line
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
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, allowMultipleUploads],
    );

    const typesString = types.join('.');
    const allowedFileTypes = useMemo(
        () => typesString.split('.').map((type) => `${type}/*`),
        [typesString],
    );

    const uppy = useUppy({
        allowedFileTypes,
        allowMultipleUploads,
        sources,
        autoProceed: true,
        onComplete,
    });

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

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(true);
    }, [setModalOpened]);

    const closeModal = useCallback(() => {
        setModalOpened(false);
    }, [setModalOpened]);

    const values = isArray(value) ? value : [value];

    return (
        <div className={className}>
            {value !== null ? (
                <div className="card">
                    <div className="card-body p-1 pl-2">
                        <div className="media align-items-center">
                            {values.map((val, idx) => {
                                const {
                                    id = null,
                                    filename = null,
                                    size = 0,
                                    thumbnail_url: thumbnailUrl = null,
                                    preview = null,
                                    data = {},
                                    type,
                                } = val || {};
                                const { file = null } = data || {};

                                let faIcon = null;
                                switch (type) {
                                    case 'audio':
                                        faIcon = faFileAudio;
                                        break;
                                    case 'image':
                                        faIcon = faFileImage;
                                        break;
                                    case 'video':
                                        faIcon = faFileVideo;
                                        break;
                                    default:
                                        break;
                                }

                                const hasPreview = preview !== null || thumbnailUrl !== null;

                                return (
                                    <div
                                        className="d-flex align-items-center justify-content-between my-1"
                                        key={`file-${id}-${filename}-${idx + 1}`}
                                    >
                                        <div className="d-flex align-items-center mx-2">
                                            {!hasPreview && faIcon !== null ? (
                                                <FontAwesomeIcon icon={faIcon} className="me-2" />
                                            ) : null}
                                            {hasPreview ? (
                                                <img
                                                    className="img-thumbnail me-2"
                                                    src={preview || thumbnailUrl}
                                                    alt="preview"
                                                    style={{ height: 100 }}
                                                />
                                            ) : null}
                                            <div className="media-body text-truncate small me-2">
                                                <strong>{file || filename}</strong>
                                            </div>

                                            <small className="text-muted me-2">
                                                {size > 0 ? prettyBytes(size) : size}
                                            </small>
                                        </div>
                                        <div className="mx-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                theme="secondary"
                                                outline
                                                onClick={() => onClickRemove(idx)}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {withButton ? (
                        <>
                            <Button type="button" theme="primary" onClick={openModal}>
                                <Label>{addButtonLabel}</Label>
                            </Button>
                        </>
                    ) : (
                        <>
                            {uppy !== null ? (
                                <Dashboard uppy={uppy} height={300} plugins={sources} />
                            ) : null}
                        </>
                    )}
                </>
            )}
            {withButton && uppy !== null ? (
                <DashboardModal
                    uppy={uppy}
                    plugins={sources}
                    open={modalOpened}
                    onRequestClose={closeModal}
                    closeModalOnClickOutside
                />
            ) : null}
        </div>
    );
};

UploadField.propTypes = propTypes;
UploadField.defaultProps = defaultProps;

export default React.memo(UploadField);
