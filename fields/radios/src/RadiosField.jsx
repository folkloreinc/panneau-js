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

const DEFAULT_OPTIONS = [];

const RadiosField = ({
    name = null,
    value = null,
    options = DEFAULT_OPTIONS,
    withBackground = false,
    disabled = false,
    uncheckable = false,
    className = null,
    buttonClassName = null,
    onChange = null
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

export default RadiosField;
