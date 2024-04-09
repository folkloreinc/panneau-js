/* eslint-disable react/jsx-props-no-spreading */
import {
    faFileAudio,
    faFileImage,
    faFilePdf,
    faFileVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import Button from '@panneau/element-button';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            filename: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string,
        }),
    ]),
    namePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    linkPath: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    disabled: PropTypes.bool,
    external: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    value: null,
    namePath: 'name',
    thumbnailPath: 'thumbnail_url',
    linkPath: null,
    disabled: false,
    width: 150,
    height: null,
    external: false,
    onClick: null,
    className: null,
    children: null,
};

const MediaPreview = ({
    value: initialValue,
    namePath,
    thumbnailPath,
    linkPath,
    width,
    height,
    disabled,
    external,
    onClick,
    className,
    children,
}) => {
    const value = initialValue || {};

    const {
        filename = null,
        thumbnail_url: mainThumbnailUrl = null,
        thumbnailUrl: altThumbnailUrl = null,
        preview = null,
        data = {},
        type,
    } = value || {};
    const thumbnailUrl = mainThumbnailUrl || altThumbnailUrl || null;

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

    const { name, thumbnail, link, hasThumbnail } = useMemo(() => {
        const finalName = (namePath !== null ? get(value, namePath) : null) || filename || file;
        const finalThumbnail =
            (thumbnailPath !== null ? get(value, thumbnailPath) : null) || thumbnailUrl || preview;
        const finalLink = (linkPath !== null ? get(value, linkPath) || null : null) || null;
        const finalHasThumbnail = preview !== null || thumbnail !== null;
        return {
            name: finalName,
            thumbnail: finalThumbnail,
            link: finalLink,
            hasThumbnail: finalHasThumbnail,
        };
    }, [value, namePath, thumbnailPath, linkPath]);

    const withButton = (onClick !== null || link !== null) && !disabled;

    const thumbnailElement =
        hasThumbnail || mediaIcon !== null ? (
            <div className="p-2 d-flex align-items-center justify-content-center">
                {!hasThumbnail && mediaIcon !== null ? (
                    <FontAwesomeIcon icon={mediaIcon} className="m-auto fs-3" />
                ) : null}
                {hasThumbnail ? (
                    <img className="d-block img-fluid mw-100 mh-100" src={thumbnail} alt={name} />
                ) : null}
            </div>
        ) : null;

    const onClickButton = useCallback(() => {
        if (onClick !== null) {
            onClick(value);
        }
    }, [value, onClick]);

    return (
        <div
            className={classNames([
                styles.container,
                'd-flex border align-items-center justify-content-center',
                { [styles.disabled]: disabled, [className]: className !== null },
            ])}
            style={{ width, height }}
        >
            {withButton ? (
                <Button
                    className={classNames(['btn', 'flex-grow-1'])}
                    type="button"
                    href={link}
                    external={external}
                    target={external ? '_blank' : null}
                    onClick={onClickButton}
                    withoutStyle
                >
                    {thumbnailElement || 'Thumbnail'}
                </Button>
            ) : (
                thumbnailElement
            )}
            {children}
        </div>
    );
};

MediaPreview.propTypes = propTypes;
MediaPreview.defaultProps = defaultProps;

export default MediaPreview;
