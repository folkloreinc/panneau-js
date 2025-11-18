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

const DEFAULT_OPTIONS = [];

function RadiosFilter({
    name = 'radios',
    value = null,
    options = DEFAULT_OPTIONS,
    onChange,
    className = null,
    ...props
}) {
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
}

RadiosFilter.propTypes = propTypes;

export default RadiosFilter;
