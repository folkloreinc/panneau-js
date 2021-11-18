/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import 'bootstrap-icons/font/bootstrap-icons.scss';

const propTypes = {
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const Icon = ({ name, className, ...props }) => (
    <i
        className={classNames([`bi-${name}`], {
            [className]: className !== null,
        })}
        {...props}
    />
);

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
