import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    {
        title: <FormattedMessage defaultMessage="Informations" description="Field title" />,
        items: [
            {
                id: 'user',
                label: <FormattedMessage defaultMessage="Added by" description="Field label" />,
                component: 'avatar',
                path: 'user',
            },
            {
                id: 'created_at',
                label: <FormattedMessage defaultMessage="Created at" description="Field label" />,
                component: 'date',
                path: 'created_at',
                format: 'yyyy-MM-dd hh:ss',
            },
        ],
    },
    {
        title: <FormattedMessage defaultMessage="Technical details" description="Field title" />,
        items: [
            {
                id: 'format',
                label: <FormattedMessage defaultMessage="Format" description="Field label" />,
                component: 'unit',
                format: 'format',
                path: 'format',
            },
            {
                id: 'dimensions',
                label: <FormattedMessage defaultMessage="Dimensions" description="Field label" />,
                component: 'unit',
                format: 'dimensions',
                path: 'metadata',
            },
            {
                id: 'size',
                label: <FormattedMessage defaultMessage="Size" description="Field label" />,
                component: 'unit',
                format: 'bytes',
                path: 'metadata.size',
            },
            {
                id: 'duration',
                label: <FormattedMessage defaultMessage="Duration" description="Field label" />,
                component: 'unit',
                format: 'duration',
                path: 'metadata.duration',
            },
        ],
    },
];
