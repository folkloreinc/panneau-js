/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import DateTimeField from './DateTimeField';

const propTypes = {
    dateFormat: PropTypes.string,
};

const defaultProps = {
    dateFormat: 'HH:mm',
};

const TimeField = ({ dateFormat, ...props }) => (
    <DateTimeField {...props} withoutDate dateFormat={dateFormat} />
);

TimeField.propTypes = propTypes;
TimeField.defaultProps = defaultProps;

export default TimeField;
