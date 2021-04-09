import React from 'react';

import FormRow from '../FormRow';

export default {
    component: FormRow,
    title: 'Elements/FormRow',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <FormRow label="Form row label">Fields are here</FormRow>;
