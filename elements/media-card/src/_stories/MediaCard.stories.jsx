/* eslint-disable no-console */
import React from 'react';

import MediaCardElement from '../MediaCard';

export default {
    component: MediaCardElement,
    title: 'Elements/MediaCard',
    parameters: {
        intl: true,
    },
};

const value = { data: { file: '1200x300.png' }, preview: 'https://picsum.photos/400/300' };

export const Normal = () => <MediaCardElement value={value} />;

export const Empty = () => <MediaCardElement value={null} />;

export const WithRemove = () => (
    <MediaCardElement value={value} onClickRemove={() => console.log('hello')} />
);
