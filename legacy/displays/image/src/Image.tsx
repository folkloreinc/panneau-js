import classNames from 'classnames';
import isNumber from 'lodash-es/isNumber';
import isString from 'lodash-es/isString';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

interface ImageValue {
    url?: string | null;
    thumbnailUrl?: string | null;
    thumbnail_url?: string | null;
    description?: string | null;
    name?: string | null;
    [key: string]: unknown;
}

interface ImageProps {
    value?: string | ImageValue | null;
    placeholder?: ReactNode | null;
    maxWidth?: number | string | null;
    maxHeight?: number | string | null;
    onClick?: (() => void) | null;
    withZoom?: boolean;
    className?: string | null;
}

function Image({
    value = null,
    placeholder = null,
    maxWidth = 40,
    maxHeight = 40,
    onClick = null,
    withZoom = false,
    className = null,
}: ImageProps) {
    const {
        url = null,
        thumbnailUrl = null,
        thumbnail_url: altThumbnailUrl = null,
        description = null,
        name = null,
    }: ImageValue = (!isString(value) ? value : null) || {};

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
            className={classNames([styles.container, className])}
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
                        maxWidth !== null && isNumber(maxWidth) ? Math.trunc(maxWidth) : maxWidth,
                    height:
                        maxHeight !== null && isNumber(maxHeight)
                            ? Math.trunc(maxHeight)
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
}

export default Image;
