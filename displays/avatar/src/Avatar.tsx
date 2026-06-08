import classNames from 'classnames';
import get from 'lodash-es/get';
import isString from 'lodash-es/isString';
import { type ReactNode, useMemo } from 'react';

import AvatarElement from '@panneau/element-avatar';

import styles from './styles.module.css';

interface AvatarProps {
    value?: string | Record<string, unknown> | null;
    placeholder?: ReactNode | null;
    imagePath?: string;
    namePath?: string;
    size?: number | null;
    withoutName?: boolean;
    withoutImage?: boolean;
    className?: string | null;
}

function Avatar({
    value = null,
    placeholder = null,
    imagePath = 'image',
    namePath = 'name',
    size = null,
    withoutName = false,
    withoutImage = false,
    className = null,
    ...props
}: AvatarProps) {
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
        <div className={classNames([styles.container, styles[size], className])}>
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
}

export default Avatar;
