import React from 'react';

import Horizontal from '../Horizontal';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Horizontal,
    title: 'Forms/Horizontal',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Horizontal fields={fields} />;
