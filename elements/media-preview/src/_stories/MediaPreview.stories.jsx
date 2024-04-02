/* eslint-disable no-console */
import React from 'react';

import MediaPreview from '../MediaPreview';

import Media1 from '../../../../.storybook/api/items/medias/1.json';
import Media3 from '../../../../.storybook/api/items/medias/3.json';
import Media11 from '../../../../.storybook/api/items/medias/11.json';

export default {
    component: MediaPreview,
    title: 'Elements/MediaPreview',
    parameters: {
        intl: true,
    },
};

const value = {
    data: { file: '1200x300.png' },
    preview: 'https://picsum.photos/400/300',
    url: '/panneau/link',
};

export const Default = () => <MediaPreview value={value} />;

export const Image = () => <MediaPreview value={Media1} />;

export const Video = () => <MediaPreview value={Media3} />;

export const Audio = () => <MediaPreview value={Media11} />;

export const Empty = () => <MediaPreview value={{ ...Media11, thumbnail_url: null }} />;

export const Disabled = () => <MediaPreview value={Media3} disabled />;
