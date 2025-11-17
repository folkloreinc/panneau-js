/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';
import DateTimeField from './DateTimeField';

const propTypes = {
    dateFormat: PropTypes.string,
};

function TimeField({
    dateFormat = 'HH:mm',
    ...props
}) {
    return (
        <DateTimeField {...props} withoutDate dateFormat={dateFormat} />
    );
}

TimeField.propTypes = propTypes;

export default TimeField;
