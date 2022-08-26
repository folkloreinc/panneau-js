import React from 'react';

// eslint-disable-line import/no-extraneous-dependencies
import Breadcrumbs from '../Breadcrumbs';

export default {
    component: Breadcrumbs,
    title: 'Elements/Breadcrumbs',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <Breadcrumbs
        items={[
            { url: '/value1', label: 'Label 1' },
            { url: '/value2', label: 'Label 2' },
            { url: '/value3', label: 'Label 3' },
        ]}
    />
);
