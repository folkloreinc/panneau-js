/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Radios from '@panneau/element-radios';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

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

const RadiosFilter = ({ name, value, options, onChange, className }) => {
    const onChangeOption = useCallback((option) => {
        console.log({ name, option }); /* eslint-disable-line */
        onChange(option);
    });

    return (
        <div className={className}>
            <Radios
                name={name}
                value={value}
                options={options}
                onChange={onChangeOption}
                uncheckable
            />
        </div>
    );
};

RadiosFilter.propTypes = propTypes;
RadiosFilter.defaultProps = defaultProps;

export default RadiosFilter;
