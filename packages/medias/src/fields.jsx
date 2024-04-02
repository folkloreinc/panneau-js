import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    // { name: 'type', label: 'Type', type: 'string', component: 'text', disabled: true },
    {
        name: 'name',
        label: <FormattedMessage defaultMessage="File name" description="Field name" />,
        type: 'text',
        component: 'text',
    },
    {
        name: 'description',
        label: <FormattedMessage defaultMessage="Description" description="Field name" />,
        type: 'text',
        component: 'text',
    },
    // {
    //     name: 'url',
    //     label: <FormattedMessage defaultMessage="URL" description="Field name" />,
    //     type: 'text',
    //     component: 'url',
    // },
    // {
    //     name: 'thumbnail_url',
    //     label: <FormattedMessage defaultMessage="Thumbnail URL" description="Field name" />,
    //     type: 'text',
    //     component: 'url',
    // },
];
