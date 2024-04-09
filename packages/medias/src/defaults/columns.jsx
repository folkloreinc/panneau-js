import React from 'react';
import { FormattedMessage } from 'react-intl';

export default [
    {
        id: 'image',
        label: <FormattedMessage defaultMessage="Preview" description="Field name" />,
        component: 'image',
        path: 'thumbnail_url',
        sortable: false,
    },
    {
        id: 'name',
        label: <FormattedMessage defaultMessage="File name" description="Field name" />,
        component: 'text-description',
        path: 'name',
        descriptionPath: 'type',
        descriptionValues: {
            image: <FormattedMessage defaultMessage="Image" description="Media type" />,
            video: <FormattedMessage defaultMessage="Video" description="Media type" />,
            audio: <FormattedMessage defaultMessage="Audio" description="Media type" />,
            document: <FormattedMessage defaultMessage="Document" description="Media type" />,
        },
        sortable: true,
    },
    {
        id: 'created_at',
        label: <FormattedMessage defaultMessage="Created at" description="Field name" />,
        component: 'date',
        path: 'created_at',
        format: 'yyyy-MM-dd hh:ss',
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
        component: 'avatar',
        path: 'metadata.author',
        namePath: 'name',
        withoutName: true,
    },
    {
        id: 'actions',
        label: <FormattedMessage defaultMessage="Actions" description="Field name" />,
        // component: 'button',
        // label: 'Edit',
        // url: '/edit/1',
    },
    // {
    //     id: 'status',
    //     label: <FormattedMessage defaultMessage="Status" description="Field name" />,
    //     component: 'text',
    //     path: 'metadata.status',
    // },
];
