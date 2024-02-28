/* eslint-disable react/jsx-props-no-spreading */
import {
    faFileAudio,
    faFileImage,
    faFilePdf,
    faFileVideo,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import get from 'lodash/get';
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Button from '@panneau/element-button';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    index: PropTypes.number,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    linkPath: PropTypes.string,
    maxWidth: PropTypes.number,
    disabled: PropTypes.bool,
    withoutDescription: PropTypes.bool,
    onClickRemove: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    index: null,
    namePath: 'name',
    thumbnailPath: 'thumbnail_url',
    sizePath: 'metadata.size',
    linkPath: null,
    disabled: false,
    maxWidth: 500,
    withoutDescription: false,
    onClickRemove: null,
    className: null,
};

const MediaCard = ({
    value: initialValue,
    index,
    namePath,
    thumbnailPath,
    sizePath,
    linkPath,
    maxWidth,
    disabled,
    withoutDescription,
    onClickRemove,
    className,
}) => {
    if (initialValue === null) {
        return null;
    }

    const value = initialValue || {};

    const {
        id = null,
        filename = null,
        size: fileSize = 0,
        thumbnail_url: thumbnailUrl = null,
        preview = null,
        data = {},
        type,
    } = value;

    const { file = null } = data || {};

    const mediaIcon = useMemo(() => {
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
            case 'document':
                faIcon = faFilePdf;
                break;
            default:
                break;
        }
        return faIcon;
    }, [type]);

    const { name, thumbnail, size, link, hasThumbnail } = useMemo(() => {
        const finalName = (namePath !== null ? get(value, namePath) : null) || filename || file;
        const finalThumbnail =
            (thumbnailPath !== null ? get(value, thumbnailPath) : null) || thumbnailUrl || preview;
        const finalSize = (sizePath !== null ? get(value, sizePath) : null) || fileSize;
        const finalLink = (linkPath !== null ? get(value, linkPath) || null : null) || null;
        const finalHasThumbnail = preview !== null || thumbnail !== null;

        return {
            name: finalName,
            thumbnail: finalThumbnail,
            size: finalSize,
            link: finalLink,
            hasThumbnail: finalHasThumbnail,
        };
    }, [value, namePath, thumbnailPath, sizePath, linkPath]);

    return (
        <div className={classNames([{ [className]: className !== null }])}>
            <div
                className="card mb-1"
                key={`media-${id}`}
                style={{
                    maxWidth,
                }}
            >
                <div className="d-flex align-items-center">
                    {hasThumbnail || mediaIcon !== null ? (
                        <div
                            className="p-2 text-center"
                            style={
                                hasThumbnail
                                    ? {
                                          width: !withoutDescription ? 100 : '100%',
                                          backgroundImage:
                                              'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
                                          backgroundSize: '20px 20px',
                                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
                                      }
                                    : {
                                          width: !withoutDescription ? 100 : '100%',
                                      }
                            }
                        >
                            {!hasThumbnail && mediaIcon !== null ? (
                                <FontAwesomeIcon icon={mediaIcon} className="m-auto fs-3" />
                            ) : null}
                            {hasThumbnail ? (
                                <img
                                    className="img-fluid"
                                    src={thumbnail}
                                    alt="thumbnail"
                                    style={{
                                        maxHeight: !withoutDescription ? 75 : 150,
                                    }}
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {!withoutDescription ? (
                        <div className="flex-grow-1">
                            <div className="card-body">
                                <h5
                                    className={classNames([
                                        'card-title',
                                        'text-break',
                                        'fs-6',
                                        {
                                            'mb-1': size !== null && size > 0,
                                            'mb-0': size === null || size <= 0,
                                        },
                                    ])}
                                >
                                    {link !== null ? (
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            {name}
                                        </a>
                                    ) : (
                                        name
                                    )}
                                    {name}
                                </h5>
                                {size !== null && size > 0 ? (
                                    <p className="card-text text-muted small">
                                        {prettyBytes(size)}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {onClickRemove !== null ? (
                        <div className="p-2">
                            <Button
                                type="button"
                                size="sm"
                                theme="secondary"
                                outline
                                onClick={() => onClickRemove(index, value)}
                                disabled={disabled}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

MediaCard.propTypes = propTypes;
MediaCard.defaultProps = defaultProps;

export default MediaCard;
