import React from 'react';

import Image from '../Image';

import test from './test.png';

export default {
    component: Image,
    title: 'Displays/Image',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <Image
        value={{
            url: test,
            thumbnailUrl: test,
        }}
    />
);

export const Small = () => (
    <Image
        value={{
            url: test,
            thumbnailUrl: test,
        }}
        maxHeight={80}
    />
);
