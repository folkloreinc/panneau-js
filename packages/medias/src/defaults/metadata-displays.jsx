import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    {
        id: 'user',
        label: <FormattedMessage defaultMessage="Added by" description="Field label" />,
        component: 'avatar',
        path: 'user',
        section: 'info',
    },
    {
        id: 'created_at',
        label: <FormattedMessage defaultMessage="Created at" description="Field label" />,
        component: 'date',
        path: 'created_at',
        format: 'yyyy-MM-dd hh:ss',
        section: 'info',
    },

    {
        id: 'format',
        label: <FormattedMessage defaultMessage="Format" description="Field label" />,
        component: 'unit',
        format: 'format',
        path: 'format',
        section: 'technical',
    },
    {
        id: 'dimensions',
        label: <FormattedMessage defaultMessage="Dimensions" description="Field label" />,
        component: 'unit',
        format: 'dimensions',
        path: 'metadata',
        section: 'technical',
    },
    {
        id: 'size',
        label: <FormattedMessage defaultMessage="Size" description="Field label" />,
        component: 'unit',
        format: 'bytes',
        path: 'metadata.size',
        section: 'technical',
    },
    {
        id: 'duration',
        label: <FormattedMessage defaultMessage="Duration" description="Field label" />,
        component: 'unit',
        format: 'duration',
        path: 'metadata.duration',
        section: 'technical',
    },
];
