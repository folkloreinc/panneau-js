import React from 'react';

import ResourceForm from '../ResourceForm';

export default {
    component: ResourceForm,
    title: 'Forms/Resource',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <ResourceForm label="Hello" />;
