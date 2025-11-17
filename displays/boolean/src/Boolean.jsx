import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@panneau/element-icon';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    labelTrue: PropTypes.string,
    labelFalse: PropTypes.string,
    iconTrue: PropTypes.string,
    iconFalse: PropTypes.string,
};

const Boolean = ({
    value = null,
    iconTrue = null,
    iconFalse = null,
    labelTrue = null,
    labelFalse = null
}) =>
    value !== null && (value === true || value === 'true') ? (
        <span className="badge bg-success">
            {iconTrue !== null ? (
                <Icon name={iconTrue} />
            ) : (
                labelTrue || <FormattedMessage defaultMessage="Yes" description="Boolean value" />
            )}
        </span>
    ) : (
        <span className="badge bg-warning">
            {iconFalse !== null ? (
                <Icon name={iconFalse} />
            ) : (
                labelFalse || <FormattedMessage defaultMessage="No" description="Boolean value" />
            )}
        </span>
    );
Boolean.propTypes = propTypes;

export default Boolean;
