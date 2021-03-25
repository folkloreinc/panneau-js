/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime } from 'react-intl';
import dayjs from 'dayjs';

const propTypes = {
    date: PropTypes.string,
    withTime: PropTypes.bool,
    timeSeparator: PropTypes.node,
};

const defaultProps = {
    date: null,
    withTime: false,
    timeSeparator: ', ',
};

const Date = ({ date, withTime, timeSeparator }) => {
    const dateObject = useMemo(() => dayjs(date).toDate(), [date]);
    return (
        <>
            <FormattedDate value={dateObject} year="numeric" month="long" day="2-digit" />
            {withTime ? timeSeparator : null}
            {withTime ? <FormattedTime value={dateObject} /> : null}
        </>
    );
};

Date.propTypes = propTypes;
Date.defaultProps = defaultProps;

export default Date;
