import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
// import classNames from 'classnames';
import { Dashboard, DashboardModal } from '@uppy/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileAudio, faFileImage, faFileVideo } from '@fortawesome/free-solid-svg-icons';
import prettyBytes from 'pretty-bytes';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUppy } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.shape({
        filename: PropTypes.string,
        size: PropTypes.number,
        url: PropTypes.string,
    }),
    types: PropTypes.arrayOf(PropTypes.oneOf(['audio', 'image', 'video'])),
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    withButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    onChange: PropTypes.func,
};

const defaultProps = {
    className: null,
    value: null,
    types: ['audio', 'image', 'video'],
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    withButton: false,
    addButtonLabel: <FormattedMessage defaultMessage="Add file" description="Default upload add button label" />,
    onChange: null,
};

const UploadField = ({ className, value, types, sources, withButton, addButtonLabel, onChange }) => {
    const onUpppyComplete = useCallback(
        (response) => {
            const newValue =
                response.successful.length > 0 ? response.successful[0].response.body : null;
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    const typesString = types.join('.');
    const allowedFileTypes = useMemo(
        () => typesString.split('.').map((type) => `${type}/*`),
        [typesString],
    );

    const uppy = useUppy({
        allowedFileTypes,
        sources,
        onComplete: onUpppyComplete,
    });

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    const [modalOpened, setModalOpened] = useState(false);

    const openModal = useCallback(() => {
        setModalOpened(true);
    }, [setModalOpened]);

    const closeModal = useCallback(() => {
        setModalOpened(false);
    }, [setModalOpened]);

    const { filename = null, size = null } = value || {};

    return (
        <div className={className}>
            {value !== null ? (
                <div className="card">
                    <div className="card-body p-1 pl-2">
                        <div className="media align-items-center">
                            {types.map((type) => {
                                let faIcon;
                                switch (type) {
                                    default:
                                    case 'audio':
                                        faIcon = faFileAudio;
                                        break;
                                    case 'image':
                                        faIcon = faFileImage;
                                        break;
                                    case 'video':
                                        faIcon = faFileVideo;
                                        break;
                                }
                                return (
                                    <FontAwesomeIcon key={type} icon={faIcon} className="mr-2" />
                                );
                            })}
                            <div className="media-body text-truncate small mr-2">
                                <strong>{filename}</strong>
                            </div>
                            <small className="text-muted">
                                {size > 0 ? prettyBytes(size) : size}
                            </small>
                            <div className="ml-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    theme="secondary"
                                    outline
                                    onClick={onClickRemove}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </div>
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
                            { uppy !== null ? <Dashboard uppy={uppy} height={300} plugins={sources} /> : null }
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
