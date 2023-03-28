import { faFileAudio, faFileImage, faFileVideo, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import classNames from 'classnames';
import { Dashboard, DashboardModal } from '@uppy/react';
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUppy } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    types: PropTypes.arrayOf(PropTypes.oneOf(['audio', 'image', 'video'])),
    fileTypes: PropTypes.arrayOf(PropTypes.string),
    sources: PropTypes.arrayOf(
        PropTypes.oneOf(['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive']),
    ),
    withButton: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    allowMultipleUploads: PropTypes.bool,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    types: ['audio', 'image', 'video'],
    fileTypes: null,
    sources: ['webcam', 'facebook', 'instagram', 'dropbox', 'google-drive'],
    withButton: false,
    addButtonLabel: (
        <FormattedMessage defaultMessage="Add file" description="Default upload add button label" />
    ),
    allowMultipleUploads: false,
    namePath: null,
    thumbnailPath: null,
    sizePath: null,
    disabled: false,
    onChange: null,
    className: null,
};

const UploadField = ({
    value,
    types,
    fileTypes,
    sources,
    withButton,
    addButtonLabel,
    allowMultipleUploads,
    namePath,
    thumbnailPath,
    sizePath,
    disabled,
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

            // Merge the response from our back-end
            if (
                isObject(newValue) &&
                isObject(newValue.response) &&
                newValue.response.status === 200 &&
                newValue.response.body !== null
            ) {
                newValue = { ...newValue, ...(newValue.response.body || null) };
            }

            console.log('new upload value', newValue); // eslint-disable-line

            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, allowMultipleUploads],
    );

    const typesString = types.join('.');
    const allowedFileTypes = useMemo(() => {
        if (fileTypes !== null) {
            return fileTypes;
        }
        return typesString.split('.').map((type) => `${type}/*`);
    }, [typesString, fileTypes]);

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

    const values = useMemo(() => {
        if (isArray(value)) {
            return value;
        }
        return value !== null ? [value] : null;
    }, [value]);
    const hasMedia = values !== null && values.length > 0;

    return (
        <div className={className}>
            {values !== null
                ? values.map((media, idx) => {
                      const {
                          id = null,
                          filename = null,
                          size: fileSize = 0,
                          thumbnail_url: thumbnailUrl = null,
                          preview = null,
                          data = {},
                          type,
                      } = media;
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

                      const name =
                          (namePath !== null ? get(media || {}, namePath) : null) ||
                          filename ||
                          file;
                      const thumbnail =
                          (thumbnailPath !== null ? get(media || {}, thumbnailPath) : null) ||
                          thumbnailUrl ||
                          preview;
                      const size =
                          (sizePath !== null ? get(media || {}, sizePath) : null) || fileSize;

                      const hasThumbnail = preview !== null || thumbnailUrl !== null;

                      return (
                          <div
                              className="card mb-1"
                              key={`media-${id}`}
                              style={{
                                  maxWidth: 500,
                              }}
                          >
                              <div className="d-flex align-items-center">
                                  {hasThumbnail || faIcon !== null ? (
                                      <div
                                          className="p-2 text-center"
                                          style={
                                              hasThumbnail
                                                  ? {
                                                        width: 100,
                                                        backgroundImage:
                                                            'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
                                                        backgroundSize: '20px 20px',
                                                        backgroundPosition:
                                                            '0 0, 0 10px, 10px -10px, -10px 0',
                                                    }
                                                  : {
                                                        width: 100,
                                                    }
                                          }
                                      >
                                          {!hasThumbnail && faIcon !== null ? (
                                              <FontAwesomeIcon
                                                  icon={faIcon}
                                                  className="m-auto fs-3"
                                              />
                                          ) : null}
                                          {hasThumbnail ? (
                                              <img
                                                  className="img-fluid"
                                                  src={thumbnail}
                                                  alt="thumbnail"
                                                  style={{
                                                      maxHeight: 75,
                                                  }}
                                              />
                                          ) : null}
                                      </div>
                                  ) : null}
                                  <div className="flex-grow-1">
                                      <div className="card-body">
                                          <h5
                                              className={classNames([
                                                  'card-title',
                                                  'fs-6',
                                                  {
                                                      'mb-1': size !== null && size > 0,
                                                      'mb-0': size === null || size <= 0,
                                                  },
                                              ])}
                                          >
                                              {name}
                                          </h5>
                                          {size !== null && size > 0 ? (
                                              <p className="card-text text-muted small">
                                                  {prettyBytes(size)}
                                              </p>
                                          ) : null}
                                      </div>
                                  </div>
                                  <div className="p-2">
                                      <Button
                                          type="button"
                                          size="sm"
                                          theme="secondary"
                                          outline
                                          onClick={() => onClickRemove(idx)}
                                          disabled={disabled}
                                      >
                                          <FontAwesomeIcon icon={faTimes} />
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      );
                  })
                : null}

            {!hasMedia && withButton ? (
                <Button type="button" theme="primary" onClick={openModal} disabled={disabled}>
                    <Label>{addButtonLabel}</Label>
                </Button>
            ) : null}
            {!disabled && !hasMedia && !withButton && uppy !== null ? (
                <Dashboard uppy={uppy} height={300} plugins={sources} />
            ) : null}
            {!disabled && withButton && uppy !== null ? (
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
