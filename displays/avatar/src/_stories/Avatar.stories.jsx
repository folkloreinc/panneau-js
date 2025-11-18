import React from 'react';

import Avatar from '../Avatar';

import test from './test.png';

export default {
    component: Avatar,
    title: 'Displays/Avatar',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (

    <Avatar
        value={{
            url: test,
            thumbnailUrl: test,
            name: 'Paul avec un nom vraiment looooong',
        }}
        namePath="name"
    />

    ),
};

export const Large = {
    render: () => (

    <Avatar
        value={{
            url: test,
            thumbnailUrl: test,
            name: 'Paul avec un nom trop long',
        }}
        size="large"
        namePath="name"
    />

    ),
};