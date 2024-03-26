/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    maxWidth: 60,
    maxHeight: 60,
    onClick: null,
    className: null,
};

const Image = ({ value, placeholder, maxWidth, maxHeight, onClick, className }) => {
    const {
        url = null,
        thumbnailUrl = null,
        thumbnail_url: altThumbnailUrl = null,
        description = null,
        name = null,
    } = value || {};

    const defaultValue = isString(value) ? value : null;
    const image = useMemo(
        () => altThumbnailUrl || thumbnailUrl || url || defaultValue,
        [altThumbnailUrl, thumbnailUrl, url, defaultValue],
    );

    const Tag = onClick !== null ? 'button' : 'div';
    const isButton = Tag === 'button';

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Tag
                className={classNames([
                    'd-flex align-items-center justify-content-center',
                    styles.inner,
                    {
                        'btn border-radius-0': isButton,
                    },
                ])}
                style={{
                    width: maxWidth !== null ? parseInt(maxWidth, 10) : null,
                    height: maxHeight !== null ? parseInt(maxHeight, 10) : null,
                }}
                {...(isButton
                    ? {
                          type: 'button',
                      }
                    : null)}
            >
                {image !== null ? (
                    <img
                        className={classNames([
                            'd-block mw-100 mh-100 object-fit-contain',
                            styles.image,
                        ])}
                        src={image}
                        alt={description || name}
                    />
                ) : (
                    placeholder
                )}
            </Tag>
        </div>
    );
};

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;

export default Image;
