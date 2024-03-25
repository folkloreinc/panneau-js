/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import { get } from 'lodash';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AvatarElement from '@panneau/element-avatar';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    imagePath: PropTypes.string,
    namePath: PropTypes.string,
    size: PropTypes.number,
    withoutName: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    imagePath: 'image',
    namePath: 'name',
    size: null,
    withoutName: false,
    className: null,
};

const Avatar = ({ value, imagePath, namePath, size, withoutName, className, ...props }) => {
    const image = get(value, imagePath) || value || null;
    const name = get(value, namePath) || null;

    const { url = null, thumbnailUrl = null, thumbnail_url: altThumbnailUrl = null } = image || {};
    const defaultValue = isString(image) ? image : null;
    const imageUrl = useMemo(
        () => altThumbnailUrl || thumbnailUrl || url || defaultValue,
        [altThumbnailUrl, thumbnailUrl, url, defaultValue],
    );

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
                <AvatarElement
                    name={name}
                    image={{ url: imageUrl }}
                    size={size}
                    {...props}
                    // inverted={false}
                />
                {name !== null && !withoutName ? (
                    <span className={classNames(['ms-2', styles.name])}>
                        {size === 'small' ? <small>{name}</small> : name}
                    </span>
                ) : null}
            </div>
        </div>
    );
};

Avatar.propTypes = propTypes;
Avatar.defaultProps = defaultProps;

export default Avatar;
