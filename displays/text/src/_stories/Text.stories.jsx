import React from 'react';

import Text from '../Text';

export default {
    component: Text,
    title: 'Index/Text',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Text value="hello" />;
