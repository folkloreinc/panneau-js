import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import { isMessage } from '@panneau/core/utils';
import styles from './styles.module.css';

const propTypes = {
    title: PropTypes.string,
    max: PropTypes.number,
    value: PropTypes.value,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const Range = ({
    title = null,
    value = 50,
    onChange,
    max = 100,
    className = null
}) => {
    const onValueChange = useCallback(
        (e) => {
            onChange(e.target.value);
        },
        [max],
    );
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <h4>
                <label className={styles.label} htmlFor="range">
                    {title}
                </label>
            </h4>
            <input
                className="form-range"
                type="range"
                id="range"
                min="0"
                max={max}
                onChange={onValueChange}
                value={value}
            />
        </div>
    );
};

Range.propTypes = propTypes;

export default Range;
