/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import DateTimeField from './DateTimeField';

const propTypes = {
    dateFormat: PropTypes.string,
};

const defaultProps = {
    dateFormat: 'yyyy-MM-dd',
};

const TimeField = ({ dateFormat, ...props }) => (
    <DateTimeField {...props} withoutTime dateFormat={dateFormat} />
);

TimeField.propTypes = propTypes;
TimeField.defaultProps = defaultProps;

export default TimeField;
