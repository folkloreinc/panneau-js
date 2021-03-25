import React from 'react';

import Inline from '../Inline';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Inline,
    title: 'Forms/Inline',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Inline fields={fields} />;
