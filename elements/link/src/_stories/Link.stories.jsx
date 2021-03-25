import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import LinkElement from '../Link';

export default {
    component: LinkElement,
    title: 'Elements/Link',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <MemoryRouter>
        <LinkElement href="/blabla">
            {{ id: 'test', defaultMessage: 'Translated Link' }}
        </LinkElement>
    </MemoryRouter>
);

export const External = () => (
    <MemoryRouter>
        <LinkElement href="/blabla" external>
            {{ id: 'test', defaultMessage: 'Translated Link' }}
        </LinkElement>
    </MemoryRouter>
);
