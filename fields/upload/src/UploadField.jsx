/* eslint-disable react/jsx-props-no-spreading */
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
import { useResourceQuery } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import ResourceItemsList from '@panneau/list-resource-items';
import Dialog from '@panneau/modal-dialog';

import styles from './styles.module.scss';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';

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
    withFind: PropTypes.bool,
    addButtonLabel: PanneauPropTypes.label,
    searchButtonLabel: PanneauPropTypes.label,
    allowMultipleUploads: PropTypes.bool,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
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
    withFind: false,
    addButtonLabel: (
        <FormattedMessage defaultMessage="Add file" description="Default upload add button label" />
    ),
    searchButtonLabel: (
        <FormattedMessage
            defaultMessage="Find a file"
            description="Default upload add button label"
        />
    ),
    allowMultipleUploads: false,
    namePath: null,
    thumbnailPath: null,
    sizePath: null,
    width: null,
    height: 300,
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
    withFind,
    addButtonLabel,
    searchButtonLabel,
    allowMultipleUploads,
    namePath,
    thumbnailPath,
    sizePath,
    width,
    height,
    disabled,
    onChange,
    className,
}) => {
    // const { ref: containerRef, entry = null } = useResizeObserver();
    // const { contentRect } = entry || {};
    // const { width: containerWidth = null } = contentRect || {};

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

    const [modalOpened, setModalOpened] = useState(false);
    const openModal = useCallback(() => {
        setModalOpened(true);
    }, [setModalOpened]);
    const closeModal = useCallback(() => {
        setModalOpened(false);
    }, [setModalOpened]);

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
    const closeResourceModal = useCallback(() => {
        setResourceModalOpen(false);
    }, [resourceModalOpen, setResourceModalOpen]);

    const onClickSelect = useCallback(
        (newValue) => {
            if (onChange !== null) {
                onChange(newValue);
                setResourceModalOpen(false);
            }
        },
        [onChange, setResourceModalOpen],
    );

    const initialQuery = useMemo(() => ({ types }), [types]);
    const {
        query: listQuery,
        onPageChange: onListPageChange,
        onQueryChange: onListQueryChange,
        onQueryReset: onListQueryReset,
    } = useResourceQuery(initialQuery);

    return (
        <div
            className={classNames([styles.container, { [className]: className !== null }])}
            // ref={containerRef}
        >
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
                <div className="row">
                    <div className="col-auto">
                        <Button
                            type="button"
                            theme="primary"
                            onClick={openModal}
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
                                onClick={toggleResourceModal}
                                disabled={disabled}
                                outline
                            >
                                <Label>{searchButtonLabel}</Label>
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}
            {!showResourceModal && !disabled && !hasMedia && !withButton && uppy !== null ? (
                <div className={styles.dashboard}>
                    <Dashboard
                        uppy={uppy}
                        // {...(containerWidth !== null && height !== null
                        //     ? { width: containerWidth }
                        // : null)}
                        {...(width !== null ? { width } : null)}
                        {...(height !== null ? { height } : null)}
                        plugins={sources}
                        inline
                        areInsidesReadyToBeVisible
                        proudlyDisplayPoweredByUppy={false}
                        showProgressDetails
                    />
                </div>
            ) : null}
            {!showResourceModal && !disabled && withButton && uppy !== null ? (
                <DashboardModal
                    uppy={uppy}
                    plugins={sources}
                    open={modalOpened}
                    onRequestClose={closeModal}
                    closeModalOnClickOutside
                />
            ) : null}
            {showResourceModal ? (
                <Dialog
                    title={<Label>{searchButtonLabel}</Label>}
                    size="lg"
                    onClose={closeResourceModal}
                >
                    <ResourceItemsList
                        resource="medias"
                        query={listQuery}
                        onPageChange={onListPageChange}
                        onQueryChange={onListQueryChange}
                        onQueryReset={onListQueryReset}
                        listProps={{
                            actions: ['select'],
                            actionsProps: { onClickSelect },
                        }}
                    />
                </Dialog>
            ) : null}
        </div>
    );
};

UploadField.propTypes = propTypes;
UploadField.defaultProps = defaultProps;

export default UploadField;
