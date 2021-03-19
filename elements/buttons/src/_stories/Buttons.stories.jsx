import React from 'react';

import ButtonsElement from '../Buttons';

export default {
    component: ButtonsElement,
    title: 'Elements/Buttons',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <ButtonsElement label="Hello" />;
