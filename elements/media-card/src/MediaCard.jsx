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
import React, { useCallback, useMemo } from 'react';

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
    vertical: PropTypes.bool,
    index: PropTypes.number,
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    sizePath: PropTypes.string,
    linkPath: PropTypes.string,
    maxWidth: PropTypes.number,
    thumbnailSize: PropTypes.number,
    disabled: PropTypes.bool,
    withoutDescription: PropTypes.bool,
    selected: PropTypes.bool,
    external: PropTypes.bool,
    onClick: PropTypes.func,
    onClickRemove: PropTypes.func,
    className: PropTypes.string,
    cardClassName: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    value: null,
    vertical: false,
    index: null,
    namePath: 'name',
    thumbnailPath: 'thumbnail_url',
    sizePath: 'metadata.size',
    linkPath: null,
    disabled: false,
    maxWidth: null,
    thumbnailSize: 100,
    withoutDescription: false,
    selected: false,
    external: true,
    onClick: null,
    onClickRemove: null,
    className: null,
    cardClassName: null,
    children: null,
};

const MediaCard = ({
    value: initialValue,
    vertical,
    index,
    namePath,
    thumbnailPath,
    sizePath,
    linkPath,
    maxWidth,
    thumbnailSize,
    disabled,
    withoutDescription,
    selected,
    external,
    onClick,
    onClickRemove,
    className,
    cardClassName,
    children,
}) => {
    const value = initialValue || {};

    const {
        id = null,
        filename = null,
        size: fileSize = 0,
        thumbnail_url: thumbnailUrl = null,
        preview = null,
        data = {},
        type,
    } = value || {};

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

    const withButton = onClick !== null || link !== null;

    const thumbnailElement =
        hasThumbnail || mediaIcon !== null ? (
            <div
                className="p-2 d-flex align-items-center justify-content-center"
                style={
                    hasThumbnail
                        ? {
                              width: !withoutDescription && !vertical ? thumbnailSize : '100%',
                              height: !withoutDescription && !vertical ? thumbnailSize : '100%',
                              background:
                                  'repeating-conic-gradient(rgb(238, 238, 238) 0% 25%, transparent 0% 50%) 50% / 20px 20px',
                          }
                        : {
                              width: !withoutDescription && !vertical ? thumbnailSize : '100%',
                              height: !withoutDescription && !vertical ? thumbnailSize : '100%',
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
                            maxHeight: !withoutDescription ? thumbnailSize : thumbnailSize * 1.5,
                        }}
                    />
                ) : null}
            </div>
        ) : null;

    const onClickThumbnail = useCallback(() => {
        if (onClick !== null) {
            onClick(value);
        }
    }, [value, onClick]);

    return (
        <div className={classNames([{ [className]: className !== null }])}>
            <div
                className={classNames([
                    'card',
                    'mb-1',
                    { 'mw-100': maxWidth === null, [cardClassName]: cardClassName !== null },
                ])}
                key={`media-${id}`}
                style={{
                    maxWidth,
                }}
            >
                <div
                    className={classNames([
                        'd-flex align-items-center',
                        { 'flex-column': vertical, 'flex-grow-1': !vertical },
                    ])}
                >
                    {withButton ? (
                        <Button
                            className={classNames([
                                'btn',
                                // 'flex-grow-1',
                                { 'w-100': withoutDescription || vertical },
                            ])}
                            type="button"
                            href={link}
                            external={external}
                            target={external ? '_blank' : null}
                            onClick={onClickThumbnail}
                            withoutStyle
                            style={{
                                border: selected
                                    ? '1px solid rgb(238, 238, 238)'
                                    : '1px solid transparent',
                                backgroundColor: selected ? 'rgb(238, 238, 238)' : null,
                                borderTopRightRadius: !vertical ? 0 : 'inherit',
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: !vertical ? 0 : 'inherit',
                            }}
                        >
                            {thumbnailElement || 'Thumbnail'}
                        </Button>
                    ) : (
                        thumbnailElement
                    )}

                    {!withoutDescription ? (
                        <div className="flex-grow-1">
                            <div className={classNames(['card-body', { 'p-2': vertical }])}>
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
                                        <a
                                            href={link}
                                            {...(external
                                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                                : null)}
                                        >
                                            {name}
                                        </a>
                                    ) : (
                                        name
                                    )}
                                </h5>
                                {size !== null && size > 0 ? (
                                    <p className="card-text text-muted small">
                                        {prettyBytes(size)}
                                    </p>
                                ) : null}
                                {children}
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
