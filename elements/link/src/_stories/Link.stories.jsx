import React from 'react';

import LinkElement from '../Link';

export default {
    component: LinkElement,
    title: 'Elements/Link',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <LinkElement href="/blabla">{{ id: 'test', defaultMessage: 'Translated Link' }}</LinkElement>
);

export const External = () => (
    <LinkElement href="/blabla" external>
        {{ id: 'test', defaultMessage: 'Translated Link' }}
    </LinkElement>
);
