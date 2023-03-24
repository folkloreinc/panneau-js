/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import AvatarElement from '../Avatar';

import image from './avatar.png';

export default {
    component: AvatarElement,
    title: 'Elements/Avatar',
    parameters: {
        intl: true,
    },
};

const user = {
    name: 'Paul le fermier',
    shortName: 'PF',
};

const userImage = {
    url: image,
};

export const Basic = () => <AvatarElement {...user} />;

export const WithImage = () => <AvatarElement {...user} image={userImage} />;

export const WithShortName = () => <AvatarElement shortName="MR" />;

export const WithChildren = () => <AvatarElement>Bad</AvatarElement>;

export const WithTheme = () => (
    <AvatarElement theme={{ text: 'danger', border: 'warning' }}>Bad</AvatarElement>
);
