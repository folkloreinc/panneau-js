import { FormattedMessage } from 'react-intl';

import { FormDefinition } from '@panneau/core';

const definitions: FormDefinition[] = [
    {
        id: 'login',
        component: 'login',
        fields: [
            {
                name: 'email',
                type: 'email',
                label: <FormattedMessage defaultMessage="Email" description="Field label" />,
            },
            {
                name: 'password',
                type: 'password',
                label: <FormattedMessage defaultMessage="Password" description="Field label" />,
            },
        ],
        submitButtonLabel: <FormattedMessage defaultMessage="Log in" description="Button label" />,
    },
];

export default definitions;
