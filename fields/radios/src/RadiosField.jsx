import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Radios from '@panneau/element-radios';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    withBackground: PropTypes.bool,
    disabled: PropTypes.bool,
    uncheckable: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    options: [],
    withBackground: false,
    disabled: false,
    uncheckable: false,
    className: null,
    buttonClassName: null,
    onChange: null,
};

const RadiosField = ({
    name,
    value,
    options,
    withBackground,
    disabled,
    uncheckable,
    className,
    buttonClassName,
    onChange,
}) => (
    <Radios
        name={name}
        value={value}
        options={options}
        withBackground={withBackground}
        className={className}
        buttonClassName={buttonClassName}
        onChange={onChange}
        disabled={disabled}
        uncheckable={uncheckable}
    />
);

RadiosField.propTypes = propTypes;
RadiosField.defaultProps = defaultProps;

export default RadiosField;
