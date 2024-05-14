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
    // Creatable example
    // {
    //     name: 'tags',
    //     label: <FormattedMessage defaultMessage="Tags" description="Field name" />,
    //     type: 'array',
    //     component: 'select',
    //     requestUrl: '/api/tags',
    //     optionLabelPath: 'label',
    //     optionValuePath: 'id', // Uses taggable so change the logic here
    //     valueIsOption: true,
    //     multiple: true,
    //     paginated: false,
    //     creatable: true, // TODO
    // },
    {
        id: 'info',
        component: 'fields',
        label: <FormattedMessage defaultMessage="Informations" description="Field title" />,
        isList: true,
        hideWithoutValue: true,
        fields: [
            {
                id: 'user',
                label: <FormattedMessage defaultMessage="Added by" description="Field label" />,
                type: 'display',
                display: 'avatar',
                name: 'user',
                horizontal: true,
            },
            {
                id: 'created_at',
                label: <FormattedMessage defaultMessage="Created at" description="Field label" />,
                type: 'display',
                display: 'date',
                name: 'created_at',
                format: 'yyyy-MM-dd hh:ss',
                horizontal: true,
            },
        ],
    },
    {
        id: 'technical',
        component: 'fields',
        label: <FormattedMessage defaultMessage="Technical details" description="Field title" />,
        isList: true,
        hideWithoutValue: true,
        fields: [
            {
                id: 'format',
                label: <FormattedMessage defaultMessage="Format" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'format',
                name: 'format',
                horizontal: true,
            },
            {
                id: 'dimensions',
                label: <FormattedMessage defaultMessage="Dimensions" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'dimensions',
                name: 'metadata',
                horizontal: true,
            },
            {
                id: 'size',
                label: <FormattedMessage defaultMessage="Size" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'bytes',
                name: 'metadata.size',
                horizontal: true,
            },
            {
                id: 'duration',
                label: <FormattedMessage defaultMessage="Duration" description="Field label" />,
                type: 'display',
                display: 'unit',
                format: 'duration',
                name: 'metadata.duration',
                horizontal: true,
            },
        ],
    },
];
