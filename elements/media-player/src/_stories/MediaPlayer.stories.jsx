/* eslint-disable no-console */
import React from 'react';

import MediaPlayer from '../MediaPlayer';

import Media1 from '../../../../.storybook/api/items/medias/1.json';
import Media3 from '../../../../.storybook/api/items/medias/3.json';
import Media11 from '../../../../.storybook/api/items/medias/11.json';

export default {
    component: MediaPlayer,
    title: 'Elements/MediaPlayer',
    parameters: {
        intl: true,
    },
};

const embed = {
    url: 'https://vimeo.com/766616310/efcbc961d0',
    iframeUrl:
        'https://player.vimeo.com/video/766616310?app_id=122963&app_id=58479&color=ffff00&controls=1&muted=1&autoplay=1',
    type: 'video',
    provider: 'vimeo',
    metadata: '{account_type: "live_premium", authorName: "URBANIA…}',
    video: {
        id: '766616310',
        type: 'embed',
        name: '766616310',
        url: 'https://vimeo.com/766616310/efcbc961d0',
        thumbnail_url: null,
        mp4: null,
        webm: null,
        width: 426,
        height: 240,
        duration: 100,
        iframeUrl:
            'https://player.vimeo.com/video/766616310?app_id=122963&color=ffff00&controls=0&muted=1&autoplay=1',
        provider: 'vimeo',
        live: false,
        videoId: null,
        filename: null,
        size: null,
    },
};

export const Image = () => <MediaPlayer value={Media1} />;

export const Video = () => <MediaPlayer value={Media3} />;

export const Audio = () => <MediaPlayer value={Media11} />;

export const Embed = () => <MediaPlayer value={embed} />;
