/* eslint-disable no-console */
import React from 'react';

import MediaCardsElement from '../MediaCards';

export default {
    component: MediaCardsElement,
    title: 'Elements/MediaCards',
    parameters: {
        intl: true,
    },
};

const value = [
    { data: { file: '1200x300.png' }, preview: 'https://picsum.photos/200/300' },
    { data: { file: '1200x301.png' }, size: 2000078, type: 'image' },
    {
        data: {
            file: 'skdjfghlasdgfjgasdf asdlf glasj dgfj agsdf glasdfg asdf gasdf jgasljd f.png',
        },
        preview: 'https://picsum.photos/300/300',
    },
    {
        data: {
            file: '345806238045620346508273465806234566023465723645023674562038456723485648520364502630582034650827364580238475602364570234650234.png',
        },
        preview: 'https://picsum.photos/500/300',
    },
];

export const Normal = () => <MediaCardsElement value={value} />;

export const WithRemove = () => (
    <MediaCardsElement value={value} onClickRemove={() => console.log('hello')} />
);
