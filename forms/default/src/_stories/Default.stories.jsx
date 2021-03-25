import React from 'react';

import Default from '../Default';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Default,
    title: 'Forms/Default',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Default fields={fields} />;
