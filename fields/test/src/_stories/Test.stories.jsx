import React from 'react';

import Test from '../Test';

export default {
    component: Test,
    title: 'Fields/Test',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Test name="Test" value="My test field" />;
