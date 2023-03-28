/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React from 'react';

import Select from '@panneau/element-select';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const SelectField = ({ className, ...props }) => <Select className={className} {...props} />;

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;
