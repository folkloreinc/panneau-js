/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    onClick: PropTypes.func,
    withZoom: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    maxWidth: 40,
    maxHeight: 40,
    onClick: null,
    withZoom: false,
    className: null,
};

const Image = ({ value, placeholder, maxWidth, maxHeight, onClick, withZoom, className }) => {
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

    const [zooming, setZooming] = useState(false);
    const [zoomed, setZoomed] = useState(false);

    const onHoverIn = useCallback(() => {
        setZooming(true);
    }, [setZooming]);

    const onHoverOut = useCallback(() => {
        setZooming(false);
    }, [setZooming]);

    useEffect(() => {
        if (!zooming) {
            setZoomed(false);
        }
        const id = setTimeout(() => {
            setZoomed(zooming);
        }, 290);
        return () => {
            clearTimeout(id);
        };
    }, [zooming]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            {...(withZoom && image !== null
                ? {
                      onMouseEnter: onHoverIn,
                      onMouseLeave: onHoverOut,
                  }
                : null)}
        >
            <Tag
                className={classNames([
                    'position-relative d-flex align-items-center justify-content-center',
                    styles.inner,
                    {
                        'btn border-radius-0': isButton,
                    },
                ])}
                style={{
                    width:
                        maxWidth !== null && isNumber(maxWidth) ? parseInt(maxWidth, 10) : maxWidth,
                    height:
                        maxHeight !== null && isNumber(maxHeight)
                            ? parseInt(maxHeight, 10)
                            : maxHeight,
                    transition: 'transform 0.15s ease-out',
                    ...(zoomed
                        ? {
                              position: 'absolute',
                              transform: 'scale(3.4)',
                              zIndex: 10,
                          }
                        : null),
                }}
                {...(isButton
                    ? {
                          type: 'button',
                          onClick,
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
