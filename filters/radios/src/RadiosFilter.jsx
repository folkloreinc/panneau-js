/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Radios from '@panneau/element-radios';

const propTypes = {
    name: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'radios',
    value: null,
    options: [],
    className: null,
};

const RadiosFilter = ({ name, value, options, onChange, className, ...props }) => (
    <div className={className}>
        <Radios
            {...props}
            name={name}
            value={value}
            options={options}
            onChange={onChange}
            uncheckable
        />
    </div>
);

RadiosFilter.propTypes = propTypes;
RadiosFilter.defaultProps = defaultProps;

export default RadiosFilter;
