/* eslint-disable react/jsx-props-no-spreading, formatjs/enforce-default-message */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResource } from '@panneau/core/contexts';

const propTypes = {
    resource: PanneauPropTypes.resource,
    values: PropTypes.object, // eslint-disable-line react/forbid-prop-types,
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string,
    description: PropTypes.string,
};

const defaultProps = {
    resource: null,
    values: null,
    defaultMessage: null,
    description: null,
};

const ResourceMessage = ({ resource, values, id, defaultMessage, description }) => {
    const contextResource = useResource();
    const { messages } = useIntl();
    const {
        id: resourceId,
        name = null,
        intl: { values: resourceValues } = {},
    } = resource || contextResource || {};
    const resourceMessageId = id.replace(/^resources\./, `resources.${resourceId}.`);
    const message = {
        id: typeof messages[resourceMessageId] !== 'undefined' ? resourceMessageId : id,
        defaultMessage,
        description,
    };
    return (
        <FormattedMessage
            values={{
                name,
                ...resourceValues,
                ...values,
            }}
            {...message}
        />
    );
};
ResourceMessage.propTypes = propTypes;
ResourceMessage.defaultProps = defaultProps;

export default ResourceMessage;
