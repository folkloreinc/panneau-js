import React from 'react';

import FormGroupElement from '../FormGroup';

export default {
    component: FormGroupElement,
    title: 'Elements/FormGroup',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <FormGroupElement name="Cool" label="Hello" />;
