/* eslint-disable react/jsx-props-no-spreading */
import {
    faFile,
    faFileAudio,
    faFileImage,
    faFilePdf,
    faFileVideo,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';

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
    maxHeight: PropTypes.number,
    thumbnailSize: PropTypes.number,
    disabled: PropTypes.bool,
    actionsDisabled: PropTypes.bool,
    withoutDescription: PropTypes.bool,
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    external: PropTypes.bool,
    onClick: PropTypes.func,
    onClickRemove: PropTypes.func,
    onClickDescription: PropTypes.func,
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
    actionsDisabled: false,
    maxWidth: null,
    maxHeight: null,
    thumbnailSize: 100,
    withoutDescription: false,
    selectable: false,
    selected: false,
    external: true,
    onClick: null,
    onClickRemove: null,
    onClickDescription: null,
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
    maxHeight,
    thumbnailSize,
    disabled,
    actionsDisabled,
    withoutDescription,
    selectable,
    selected,
    external,
    onClick,
    onClickRemove,
    onClickDescription,
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
        thumbnailUrl: altThumbnailUrl = null,
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
                faIcon = faFile;
                break;
        }
        return faIcon;
    }, [type]);

    const { name, thumbnail, size, link, hasThumbnail } = useMemo(() => {
        const finalName =
            (namePath !== null ? get(value, namePath) : null) ||
            filename ||
            (isString(file) ? file : null) ||
            null;
        const finalThumbnail =
            (thumbnailPath !== null ? get(value, thumbnailPath) : null) ||
            thumbnailUrl ||
            altThumbnailUrl ||
            preview;
        const finalSize = (sizePath !== null ? get(value, sizePath) : null) || fileSize || null;
        const finalLink = (linkPath !== null ? get(value, linkPath) || null : null) || null;
        const finalHasThumbnail = finalThumbnail !== null;
        return {
            name: finalName,
            thumbnail: finalThumbnail,
            size: finalSize,
            link: finalLink,
            hasThumbnail: finalHasThumbnail,
        };
    }, [
        value,
        namePath,
        thumbnailPath,
        sizePath,
        linkPath,
        thumbnailUrl,
        altThumbnailUrl,
        filename,
        file,
        preview,
    ]);

    const withButton = onClick !== null || link !== null;

    const thumbnailElement =
        hasThumbnail || mediaIcon !== null ? (
            <div
                className="p-2 d-flex align-items-center justify-content-center"
                style={
                    hasThumbnail
                        ? {
                              width: !withoutDescription && !vertical ? thumbnailSize : '100%',
                              height: !withoutDescription ? thumbnailSize : '100%',
                              background:
                                  'repeating-conic-gradient(color-mix(in srgb, var(--bs-body-bg), #000 15%) 0% 25%, color-mix(in srgb, var(--bs-body-bg), #FFF 15%) 0% 50%) 50% / 20px 20px',
                          }
                        : {
                              width: !withoutDescription && !vertical ? thumbnailSize : '100%',
                              height: !withoutDescription ? thumbnailSize : '100%',
                          }
                }
            >
                {!hasThumbnail && mediaIcon !== null ? (
                    <FontAwesomeIcon icon={mediaIcon} className="m-auto fs-3" />
                ) : null}
                {hasThumbnail && thumbnail !== null ? (
                    <img
                        className={classNames([
                            'img-fluid',
                            { 'mw-100': maxWidth === null, 'mh-100': maxHeight === null },
                        ])}
                        src={thumbnail}
                        alt={name}
                        style={{
                            maxHeight: !withoutDescription ? thumbnailSize : thumbnailSize * 1.5,
                        }}
                    />
                ) : null}
                {hasThumbnail && thumbnail === null ? (
                    <div
                        className="d-flex align-items-center justify-content-center mh-100 mw-100"
                        style={{
                            minHeight: !withoutDescription ? thumbnailSize : thumbnailSize * 1.5,
                        }}
                    >
                        <FontAwesomeIcon icon={faFile} className="m-auto fs-3" />
                    </div>
                ) : null}
            </div>
        ) : null;

    const onClickThumbnail = useCallback(() => {
        if (onClick !== null) {
            onClick(value);
        }
    }, [value, onClick]);

    const descriptionElement = (
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
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
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
                    {onClickDescription !== null && link === null ? (
                        <Icon className="icon ms-1" name="pencil" />
                    ) : null}
                </p>
            ) : null}
            {children}
        </div>
    );

    const onClickBody = useCallback(() => {
        if (onClickDescription !== null) {
            onClickDescription(value);
        }
    }, [value, onClick]);

    return (
        <div className={classNames(['w-100', 'mb-1', { [className]: className !== null }])}>
            <div
                className={classNames([
                    'card',
                    'mb-1',
                    { 'mw-100': maxWidth === null, [cardClassName]: cardClassName !== null },
                ])}
                key={`media-${id}`}
                style={{
                    maxWidth,
                    maxHeight,
                }}
            >
                <div
                    className={classNames([
                        'd-flex align-items-center position-relative',
                        {
                            'flex-column': vertical,
                            'text-center': vertical,
                            'flex-grow-1': !vertical,
                        },
                    ])}
                >
                    {withButton ? (
                        <Button
                            className={classNames([
                                'btn',
                                'p-0',
                                { 'w-100': withoutDescription || vertical },
                            ])}
                            type="button"
                            href={link}
                            external={external}
                            target={external ? '_blank' : null}
                            onClick={onClickThumbnail}
                            // withoutStyle
                            style={{
                                border: selected
                                    ? '1px solid var(--bs-primary-border-subtle)'
                                    : '1px solid transparent',
                                backgroundColor: selected ? 'var(--bs-focus-ring-color)' : null,
                                borderRadius: 'var(--bs-border-radius)',
                                borderTopRightRadius: !vertical ? 0 : 'var(--bs-border-radius)',
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: !vertical ? 0 : 'inherit',
                                overflow: 'hidden',
                                minWidth:
                                    !vertical && thumbnailElement !== null
                                        ? thumbnailSize + 10
                                        : null,
                            }}
                        >
                            {thumbnailElement || 'Thumbnail'}
                            {selectable ? (
                                <input
                                    className="position-absolute"
                                    type="checkbox"
                                    checked={selected}
                                    style={{ top: 10, right: 10 }}
                                />
                            ) : null}
                        </Button>
                    ) : (
                        thumbnailElement
                    )}

                    {!withoutDescription &&
                    link === null &&
                    onClickDescription !== null &&
                    !actionsDisabled ? (
                        <Button className="flex-grow-1 w-100" onClick={onClickBody}>
                            {descriptionElement}
                        </Button>
                    ) : null}

                    {!withoutDescription && (onClickDescription === null || actionsDisabled) ? (
                        <div className="flex-grow-1 w-100">{descriptionElement}</div>
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
