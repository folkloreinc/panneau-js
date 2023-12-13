/* eslint-disable react/jsx-props-no-spreading */
// import classNames from 'classnames';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import MediaPreviewCard from './MediaPreviewCard';

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
    sizePath: PropTypes.string,
    disabled: PropTypes.bool,
    onClickRemove: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    namePath: null,
    thumbnailPath: null,
    sizePath: null,
    disabled: false,
    onClickRemove: null,
    className: null,
};

const MediaPreviewCards = ({
    value,
    namePath,
    thumbnailPath,
    sizePath,
    disabled,
    onClickRemove,
    className,
}) => {
    const values = useMemo(() => {
        if (isArray(value)) {
            return value;
        }
        return value !== null ? [value] : [];
    }, [value]);
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            {values.map((media, idx) => (
                <MediaPreviewCard
                    value={media}
                    index={idx}
                    namePath={namePath}
                    thumbnailPath={thumbnailPath}
                    sizePath={sizePath}
                    disabled={disabled}
                    onClickRemove={onClickRemove}
                />
            ))}
        </div>
    );
};

MediaPreviewCards.propTypes = propTypes;
MediaPreviewCards.defaultProps = defaultProps;

export default MediaPreviewCards;
