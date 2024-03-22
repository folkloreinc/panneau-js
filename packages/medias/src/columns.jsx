import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    {
        id: 'name',
        label: <FormattedMessage defaultMessage="File name" description="Field name" />,
        component: 'text',
        path: 'name',
        sortable: true,
        selectable: true,
    },
    {
        id: 'created_at',
        label: <FormattedMessage defaultMessage="Created at" description="Field name" />,
        component: 'text',
        path: 'created_at',
        sortable: true,
    },
    {
        id: 'dimensions',
        label: <FormattedMessage defaultMessage="Dimensions" description="Field name" />,
        component: 'unit',
        format: 'dimensions',
        path: 'metadata',
    },
    {
        id: 'size',
        label: <FormattedMessage defaultMessage="Size" description="Field name" />,
        component: 'unit',
        format: 'bytes',
        path: 'metadata.size',
    },
    {
        id: 'duration',
        label: <FormattedMessage defaultMessage="Duration" description="Field name" />,
        component: 'unit',
        format: 'duration',
        path: 'metadata.duration',
    },
    {
        id: 'author',
        label: <FormattedMessage defaultMessage="Added by" description="Field name" />,
        component: 'text',
        path: 'metadata.author.name',
    },
    {
        id: 'status',
        label: <FormattedMessage defaultMessage="Status" description="Field name" />,
        component: 'text',
        path: 'metadata.status',
    },
];
