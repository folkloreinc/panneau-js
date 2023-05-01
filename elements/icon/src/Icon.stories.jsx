import React from 'react';

import Icon from './Icon';

export default {
    component: Icon,
    title: 'Elements/Icon',
};

export const Normal = () => <Icon name="caret-down" />;

export const Bold = () => <Icon name="caret-down" bold />;

export const Opaque = () => <Icon name="caret-down" opaque />;
