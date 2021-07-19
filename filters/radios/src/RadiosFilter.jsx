/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Radios from '@panneau/element-radios';
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

const RadiosFilter = ({ name, value, options, onChange, className, ...props }) => {
    return (
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
};

RadiosFilter.propTypes = propTypes;
RadiosFilter.defaultProps = defaultProps;

export default RadiosFilter;
