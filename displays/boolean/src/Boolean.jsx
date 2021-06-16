import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Boolean = ({ value }) =>
    value !== null && value === true ? (
        <span className="badge bg-success">
            <FormattedMessage defaultMessage="Yes" description="Boolean value" />
        </span>
    ) : (
        <span className="badge bg-warning">
            <FormattedMessage defaultMessage="No" description="Boolean value" />
        </span>
    );
Boolean.propTypes = propTypes;
Boolean.defaultProps = defaultProps;

export default Boolean;
