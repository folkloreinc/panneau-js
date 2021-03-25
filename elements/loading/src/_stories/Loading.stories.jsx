import React from 'react';

import LoadingElement from '../Loading';

export default {
    component: LoadingElement,
    title: 'Elements/Loading',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <LoadingElement>Loading</LoadingElement>;
