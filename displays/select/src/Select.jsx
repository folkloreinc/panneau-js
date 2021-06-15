import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    field: PanneauPropTypes.field.isRequired,
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Select = ({ field, value }) => {
    const { options = [] } = field;
    const option = options.find((it) => it.value === value) || null;
    const label = option !== null ? option.label : null;
    return <div>{label}</div>;
};
Select.propTypes = propTypes;
Select.defaultProps = defaultProps;

export default Select;
