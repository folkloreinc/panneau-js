/* eslint-disable react/jsx-props-no-spreading, formatjs/enforce-default-message */
import { FormattedMessage, useIntl } from 'react-intl';

import { useResource } from '@panneau/core/contexts';

interface ResourceIntlConfig {
    values?: Record<string, unknown>;
}

interface ResourceConfig {
    id?: string;
    name?: string | null;
    intl?: ResourceIntlConfig;
}

interface ResourceMessageProps {
    resource?: ResourceConfig | null;
    values?: Record<string, unknown> | null;
    id: string;
    defaultMessage?: string | null;
    description?: string | null;
}

function ResourceMessage({
    resource = null,
    values = null,
    id,
    defaultMessage = null,
    description = null,
}: ResourceMessageProps) {
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
}

export default ResourceMessage;
