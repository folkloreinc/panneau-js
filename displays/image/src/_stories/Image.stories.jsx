import React from 'react';
import Image from '../Image';

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
            url: 'http://www.fillmurray.com/g/200/300',
            thumbnailUrl: 'http://www.fillmurray.com/g/200/300',
        }}
    />
);

export const Small = () => (
    <Image
        value={{
            url: 'http://www.fillmurray.com/g/200/300',
            thumbnailUrl: 'http://www.fillmurray.com/g/200/300',
        }}
        maxHeight={80}
    />
);
