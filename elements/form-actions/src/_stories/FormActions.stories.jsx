/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import FormActions from '../FormActions';

export default {
    component: FormActions,
    title: 'Elements/FormActions',
    parameters: {
        intl: true,
    },
};

const props = {
    item: {
        id: 1,
    },
    size: 'sm',
};

export const Normal = () => <FormActions {...props} />;
