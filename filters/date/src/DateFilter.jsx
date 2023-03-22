/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { Date } from '@panneau/field-date';

const propTypes = {
    name: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'radios',
    value: null,
    options: [],
    placeholder: null,
    className: null,
};

const DateFilter = ({ name, value, options, placeholder, onChange, className, ...props }) => (
    <div className={className}>
        <Date
            {...props}
            name={name}
            value={value}
            options={options}
            placeholder={placeholder}
            onChange={onChange}
        />
    </div>
);

DateFilter.propTypes = propTypes;
DateFilter.defaultProps = defaultProps;

export default DateFilter;
