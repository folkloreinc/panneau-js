/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Radios from '@panneau/element-radios';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    withBackground: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
    onChange: PropTypes.func,
    uncheckable: PropTypes.bool,
};

const defaultProps = {
    name: null,
    value: null,
    options: [],
    withBackground: false,
    className: null,
    buttonClassName: null,
    onChange: null,
    uncheckable: false,
};

const RadiosField = ({
    name,
    value,
    options,
    withBackground,
    className,
    buttonClassName,
    onChange,
    uncheckable,
}) => (
    <Radios
        name={name}
        value={value}
        options={options}
        withBackground={withBackground}
        className={className}
        buttonClassName={buttonClassName}
        onChange={onChange}
        uncheckable={uncheckable}
    />
);

RadiosField.propTypes = propTypes;
RadiosField.defaultProps = defaultProps;

export default RadiosField;
