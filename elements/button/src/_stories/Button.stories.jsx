import React from 'react';

import ButtonElement from '../Button';

export default {
    component: ButtonElement,
    title: 'Elements/Button',
    parameters: {
        intl: true,
    },
};

export const Outline = () => <ButtonElement label="Hello" theme="primary" outline />;

export const SmallDanger = () => <ButtonElement label="Hello" theme="danger" size="sm" />;

export const BigInfo = () => <ButtonElement label="Hello" theme="info" size="lg" />;
