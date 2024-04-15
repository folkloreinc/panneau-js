import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
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
    {
        id: 'info',
        component: 'fields',
        title: <FormattedMessage defaultMessage="Informations" description="Field title" />,
        fields: [
            {
                id: 'user',
                label: <FormattedMessage defaultMessage="Added by" description="Field label" />,
                component: 'display',
                type: 'avatar',
                path: 'user',
                section: 'info',
            },
            {
                id: 'created_at',
                label: <FormattedMessage defaultMessage="Created at" description="Field label" />,
                component: 'display',
                type: 'date',
                path: 'created_at',
                format: 'yyyy-MM-dd hh:ss',
                section: 'info',
            },
        ],
    },
    // {
    //     id: 'technical',
    //     component: 'fields',
    //     title: <FormattedMessage defaultMessage="Technical details" description="Field title" />,
    //     fields: [
    //         {
    //             id: 'format',
    //             label: <FormattedMessage defaultMessage="Format" description="Field label" />,
    //             type: 'display',
    //             component: 'unit',
    //             format: 'format',
    //             path: 'format',
    //             section: 'technical',
    //         },
    //         {
    //             id: 'dimensions',
    //             label: <FormattedMessage defaultMessage="Dimensions" description="Field label" />,
    //             type: 'display',
    //             component: 'unit',
    //             format: 'dimensions',
    //             path: 'metadata',
    //             section: 'technical',
    //         },
    //         {
    //             id: 'size',
    //             label: <FormattedMessage defaultMessage="Size" description="Field label" />,
    //             type: 'display',
    //             component: 'unit',
    //             format: 'bytes',
    //             path: 'metadata.size',
    //             section: 'technical',
    //         },
    //         {
    //             id: 'duration',
    //             label: <FormattedMessage defaultMessage="Duration" description="Field label" />,
    //             type: 'display',
    //             component: 'unit',
    //             format: 'duration',
    //             path: 'metadata.duration',
    //             section: 'technical',
    //         },
    //     ],
    // },
];
