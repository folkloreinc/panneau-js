import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    {
        id: 'search',
        component: 'search',
        name: 'search',
        width: 220,
    },
    {
        id: 'types',
        component: 'select',
        name: 'types',
        placeholder: <FormattedMessage defaultMessage="Type" description="Filter label" />,
        options: [
            {
                label: <FormattedMessage defaultMessage="Image" description="Filter item label" />,
                value: 'image',
            },
            {
                label: <FormattedMessage defaultMessage="Video" description="Filter item label" />,
                value: 'video',
            },
            {
                label: <FormattedMessage defaultMessage="Audio" description="Filter item label" />,
                value: 'audio',
            },
            {
                label: (
                    <FormattedMessage defaultMessage="Document" description="Filter item label" />
                ),
                value: 'document',
            },
        ],
        multiple: true,
    },
    // {
    //     id: 'author',
    //     component: 'select',
    //     name: 'author',
    //     placeholder: <FormattedMessage defaultMessage="Author" description="Filter label" />,
    //     requestUrl: '/persons',
    //     itemLabelPath: 'name',
    //     multiple: true,
    // },
    // {
    //     id: 'tag',
    //     component: 'select',
    //     name: 'tag',
    //     placeholder: <FormattedMessage defaultMessage="Tag" description="Filter label" />,
    //     requestUrl: '/tags',
    //     itemLabelPath: 'label',
    //     multiple: true,
    // },
];
