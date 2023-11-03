import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import SelectElement from '@panneau/element-select';

const propTypes = {
    field: PanneauPropTypes.field.isRequired,
    value: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
    ),
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    options: null,
    onChange: null,
};

const Select = ({ field, value, options: providedOptions, onChange }) => {
    const { options = null } = field || {};
    const finalOptions = providedOptions || options || null;
    const option =
        (finalOptions || []).find(({ value: itemValue = null }) => itemValue === value) || null;
    const label = option !== null ? option.label : null;
    const finalLabel = isString(value) ? value : label;

    return finalOptions !== null ? (
        <SelectElement value={value} options={finalOptions} onChange={onChange} />
    ) : (
        <div>{finalLabel}</div>
    );
};

Select.propTypes = propTypes;
Select.defaultProps = defaultProps;

export default Select;
