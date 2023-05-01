/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.module.scss';
import 'bootstrap-icons/font/bootstrap-icons.scss';

const propTypes = {
    name: PropTypes.string.isRequired,
    bold: PropTypes.bool,
    opaque: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    bold: false,
    opaque: false,
    className: null,
};

const Icon = ({ name, bold, opaque, className, ...props }) => (
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
Icon.defaultProps = defaultProps;

export default Icon;
