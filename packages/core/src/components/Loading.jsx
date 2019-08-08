import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from '../styles/components/loading.scss';

const propTypes = {
    loading: PropTypes.bool,
    color: PropTypes.string,
    size: PropTypes.number,
    margin: PropTypes.string,
    sizeUnit: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    loading: true,
    color: '#000000',
    size: 15,
    margin: '2px',
    sizeUnit: 'px',
    className: null,
};

const Loader = ({ loading, color, size, sizeUnit, margin, className }) => {
    const dotStyle = {
        backgroundColor: color,
        width: `${size}${sizeUnit}`,
        height: `${size}${sizeUnit}`,
        margin,
    };
    return loading ? (
        <div
            className={classNames([
                styles.component,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <div className={styles.dot} style={dotStyle} />
            <div className={styles.dot} style={dotStyle} />
            <div className={styles.dot} style={dotStyle} />
        </div>
    ) : null;
};

Loader.propTypes = propTypes;
Loader.defaultProps = defaultProps;

export default Loader;
