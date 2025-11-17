/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.module.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

const propTypes = {
    name: PropTypes.string.isRequired,
    bold: PropTypes.bool,
    opaque: PropTypes.bool,
    className: PropTypes.string,
};

const Icon = ({
    name,
    bold = false,
    opaque = false,
    className = null,
    ...props
}) =>
    name === 'loading' ? (
        <>
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span className="visually-hidden" role="status">
                Loading...
            </span>
        </>
    ) : (
        <i
            className={classNames([`bi-${name}`], {
                [styles.bold]: bold,
                [styles.opaque]: opaque,
                [className]: className !== null,
            })}
            {...props}
        />
    );

Icon.propTypes = propTypes;

export default Icon;
