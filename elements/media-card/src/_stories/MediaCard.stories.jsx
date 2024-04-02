/* eslint-disable no-console */
import React from 'react';

import MediaCard from '../MediaCard';

export default {
    component: MediaCard,
    title: 'Elements/MediaCard',
    parameters: {
        intl: true,
    },
};

const value = {
    data: { file: '1200x300.png' },
    preview: 'https://picsum.photos/400/300',
    url: '/panneau/link',
};

export const Normal = () => <MediaCard value={value} />;

export const Link = () => <MediaCard value={value} linkPath="url" />;

export const Empty = () => <MediaCard value={null} />;

export const WithRemove = () => (
    <MediaCard value={value} onClickRemove={() => console.log('hello')} />
);

export const WithoutDescription = () => (
    <MediaCard value={value} withoutDescription linkPath="url" />
);

export const WithoutDescriptionAndRemove = () => (
    <MediaCard
        value={value}
        withoutDescription
        linkPath="url"
        onClickRemove={() => console.log('hello')}
    />
);

export const Vertical = () => <MediaCard vertical value={value} />;

export const VerticalMax = () => <MediaCard vertical value={value} maxWidth={160} />;

export const VerticalWithoutDescriptionAndRemove = () => (
    <MediaCard
        value={value}
        vertical
        withoutDescription
        linkPath="url"
        onClickRemove={() => console.log('hello')}
    />
);
