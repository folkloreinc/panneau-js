import React from 'react';

import ButtonElement from '../Button';

export default {
    component: ButtonElement,
    title: 'Elements/Button',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <ButtonElement label="Hello" />;
