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
    // {
    //     id: 'info',
    //     component: 'fields',
    //     title: <FormattedMessage defaultMessage="Informations" description="Field title" />,
    //     isList: true,
    //     horizontal: true,
    //     fields: [
    //         {
    //             id: 'user',
    //             label: <FormattedMessage defaultMessage="Added by" description="Field label" />,
    //             type: 'display',
    //             display: 'avatar',
    //             name: 'user',
    //         },
    //         {
    //             id: 'created_at',
    //             label: <FormattedMessage defaultMessage="Created at" description="Field label" />,
    //             type: 'display',
    //             display: 'date',
    //             name: 'created_at',
    //             format: 'yyyy-MM-dd hh:ss',
    //         },
    //     ],
    // },
    {
        id: 'technical',
        component: 'fields',
        title: <FormattedMessage defaultMessage="Technical details" description="Field title" />,
        isList: true,
        horizontal: true,
        fields: [
            {
                id: 'format',
                label: <FormattedMessage defaultMessage="Format" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'format',
                name: 'format',
            },
            {
                id: 'dimensions',
                label: <FormattedMessage defaultMessage="Dimensions" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'dimensions',
                name: 'metadata',
            },
            {
                id: 'size',
                label: <FormattedMessage defaultMessage="Size" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'bytes',
                name: 'metadata.size',
            },
            {
                id: 'duration',
                label: <FormattedMessage defaultMessage="Duration" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'duration',
                name: 'metadata.duration',
            },
        ],
    },
];
