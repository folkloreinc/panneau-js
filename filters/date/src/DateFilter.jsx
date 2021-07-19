/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { Date } from '@panneau/field-date';
import PropTypes from 'prop-types';
import React from 'react';

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

const DateFilter = ({ name, value, options, onChange, className }) => {
    return (
        <div className={className}>
            <Date name={name} value={value} options={options} onChange={onChange} uncheckable />
        </div>
    );
};

DateFilter.propTypes = propTypes;
DateFilter.defaultProps = defaultProps;

export default DateFilter;
