/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import ResourceCard from './ResourceCard';

import styles from './styles.module.css';

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

const ResourceCards = ({
    value = null,
    className = null,
    cardClassName = null,
    ...props
}) => {
    const values = useMemo(() => {
        if (isArray(value)) {
            return value.filter((v) => v !== null);
        }
        return value !== null ? [value] : [];
    }, [value]);
    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            {values.map((val, idx) => (
                <ResourceCard
                    key={`resource-card-${idx + 1}-${val !== null ? val?.id : null}`}
                    className={classNames([
                        styles.card,
                        { [cardClassName]: cardClassName !== null },
                    ])}
                    {...props}
                    item={val}
                    index={idx}
                />
            ))}
        </div>
    );
};

ResourceCards.propTypes = propTypes;

export default ResourceCards;
