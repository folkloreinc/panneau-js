/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    values: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
    message: PanneauPropTypes.message.isRequired,
};

const defaultProps = {
    values: null,
};

const ResourceLabel = ({ resource, values, message }) => {
    const { label = null, intl = null, localization = null } = resource;
    const { values: resourceValues } = intl || localization || {};

    return (
        <FormattedMessage
            values={{
                label,
                ...resourceValues,
                ...values,
            }}
            {...message}
        />
    );
};
ResourceLabel.propTypes = propTypes;
ResourceLabel.defaultProps = defaultProps;

export default ResourceLabel;
