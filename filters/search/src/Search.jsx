/* eslint-disable react/jsx-props-no-spreading */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Form from '@panneau/element-form';

const propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    className: null,
};

const SearchFilter = ({ value, onChange, className }) => {
    const onValueChange = useCallback(
        (e) => {
            onChange(e ? e.target.value : null);
        },
        [onChange],
    );
    return (
        <Form className={className}>
            <input type="text" value={value} onChange={onValueChange} />
        </Form>
    );
};

SearchFilter.propTypes = propTypes;
SearchFilter.defaultProps = defaultProps;

export default SearchFilter;
