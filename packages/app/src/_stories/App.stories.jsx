/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import PanneauContainer from '../components/Container';

export default {
    component: <p>YO</p>,
    title: 'App/Interface',
    parameters: {
        intl: {
            locale: panneauDefinition.intl.locale,
        },
        router: false,
    },
};

const props = {
    baseUrl: 'http://localhost:58800/api', // Should be whatever, /api is for storybook
};

const user = { id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' };

const englishIntl = {
    locale: 'en',
    locales: ['en', 'fr'],
    values: {
        name: 'Panneau in Englishe',
    },
    messages: {
        'resources.index': 'Read {a_plural}',
        'resources.create': 'Blabla',
    },
};

// console.log('panneauDefinition', panneauDefinition);

export const Guest = () => (
    <PanneauContainer definition={panneauDefinition} memoryRouter {...props} />
);

export const GuestDarkEnglish = () => (
    <PanneauContainer
        definition={{
            ...panneauDefinition,
            theme: { colorScheme: 'dark' },
            intl: englishIntl,
        }}
        memoryRouter
        {...props}
    />
);

export const LightMode = () => (
    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'light' } }}
        memoryRouter
        user={user}
        {...props}
    />
);

export const DarkMode = () => (
    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'dark' } }}
        memoryRouter
        user={user}
        {...props}
    />
);

export const BlueMode = () => (
    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'blue' } }}
        memoryRouter
        user={user}
        {...props}
    />
);

export const English = () => (
    <PanneauContainer
        definition={{
            ...panneauDefinition,
            intl: englishIntl,
        }}
        memoryRouter
        user={user}
        {...props}
    />
);
