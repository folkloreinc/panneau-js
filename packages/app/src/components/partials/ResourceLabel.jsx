/* eslint-disable react/jsx-props-no-spreading, formatjs/enforce-default-message */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    values: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
    message: PanneauPropTypes.message.isRequired,
};

const defaultProps = {
    values: null,
};

const ResourceLabel = ({ resource, values, message }) => {
    const { messages } = useIntl();
    const { id: resourceId, name = null, intl: { values: resourceValues } = {} } = resource;
    const { id: messageId } = message;
    const resourceMessageId = messageId.replace(/^resources\./, `resources.${resourceId}.`);
    const messageProps = {
        ...message,
        id: typeof messages[resourceMessageId] !== 'undefined' ? resourceMessageId : messageId,
    };

    return (
        <FormattedMessage
            values={{
                name,
                ...resourceValues,
                ...values,
            }}
            {...messageProps}
        />
    );
};
ResourceLabel.propTypes = propTypes;
ResourceLabel.defaultProps = defaultProps;

export default ResourceLabel;
