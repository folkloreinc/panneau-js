/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';
import DateTimeField from './DateTimeField';

const propTypes = {
    dateFormat: PropTypes.string,
};

const TimeField = ({
    dateFormat = 'yyyy-MM-dd',
    ...props
}) => (
    <DateTimeField {...props} withoutTime dateFormat={dateFormat} />
);

TimeField.propTypes = propTypes;

export default TimeField;
