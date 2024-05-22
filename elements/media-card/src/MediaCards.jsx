/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import MediaCard from './MediaCard';

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
    className: PropTypes.string,
    cardClassName: PropTypes.string,
};

const defaultProps = {
    value: null,
    className: null,
    cardClassName: null,
};

const MediaCards = ({ value, className, cardClassName, ...props }) => {
    const values = useMemo(() => {
        if (isArray(value)) {
            return value;
        }
        return value !== null ? [value] : [];
    }, [value]);

    return (
        <div className={classNames([styles.mediaCards, { [className]: className !== null }])}>
            {values.map((media, idx) => (
                <MediaCard
                    key={`media-card-${idx + 1}-${media !== null ? media?.id : null}`}
                    className={classNames([
                        styles.card,
                        { [cardClassName]: cardClassName !== null },
                    ])}
                    {...props}
                    value={media}
                    index={idx}
                />
            ))}
        </div>
    );
};

MediaCards.propTypes = propTypes;
MediaCards.defaultProps = defaultProps;

export default MediaCards;
