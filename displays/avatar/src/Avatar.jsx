/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { get } from 'lodash-es';
import isString from 'lodash-es/isString';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AvatarElement from '@panneau/element-avatar';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    imagePath: PropTypes.string,
    namePath: PropTypes.string,
    size: PropTypes.number,
    withoutName: PropTypes.bool,
    withoutImage: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    imagePath: 'image',
    namePath: 'name',
    size: null,
    withoutName: false,
    withoutImage: false,
    className: null,
};

const Avatar = ({
    value,
    placeholder,
    imagePath,
    namePath,
    size,
    withoutName,
    withoutImage,
    className,
    ...props
}) => {
    const image = get(value, imagePath) || value || null;
    const name = get(value, namePath) || null;

    const { url = null, thumbnailUrl = null, thumbnail_url: altThumbnailUrl = null } = image || {};
    const defaultValue = isString(image) ? image : null;
    const imageUrl = useMemo(
        () => altThumbnailUrl || thumbnailUrl || url || defaultValue,
        [altThumbnailUrl, thumbnailUrl, url, defaultValue],
    );

    const showImage = imageUrl !== null && !withoutImage;
    const showName = name !== null && !withoutName;
    const empty = !showImage && !showName;

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles[size]]: size !== null,
                    [className]: className !== null,
                },
            ])}
        >
            <div className="d-flex align-items-center">
                {showImage ? (
                    <AvatarElement name={name} image={{ url: imageUrl }} size={size} {...props} />
                ) : null}
                {showName ? (
                    <span className={classNames(['ms-2', styles.name])}>
                        {size === 'small' ? <small>{name}</small> : name}
                    </span>
                ) : null}
                {empty ? placeholder : null}
            </div>
        </div>
    );
};

Avatar.propTypes = propTypes;
Avatar.defaultProps = defaultProps;

export default Avatar;
