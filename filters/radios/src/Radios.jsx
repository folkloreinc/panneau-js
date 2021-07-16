/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Radios from '@panneau/element-radios';

const propTypes = {
    param: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    param: 'q',
    options: [],
    className: null,
};

const RadiosFilter = ({ param, value, options, onChange, className }) => {
    // console.log('hello', param, value, options); /* eslint-disable-line */

    const onChangeOption = useCallback((option) => {
        console.log({ param, option }); /* eslint-disable-line */
        onChange(option);
    });

    return (
        <div className={className}>
            <Radios name={param} value={value} options={options} onChange={onChangeOption} />
        </div>
    );
};

RadiosFilter.propTypes = propTypes;
RadiosFilter.defaultProps = defaultProps;

export default RadiosFilter;
