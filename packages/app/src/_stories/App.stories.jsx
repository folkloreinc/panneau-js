/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import PanneauContainer from '../components/Container';

export default {
    component: PanneauContainer,
    title: 'App',
    parameters: {
        intl: {
            locale: panneauDefinition.intl.locale,
        },
    },
};

const props = {
    baseUrl: 'http://localhost:58800/api', // Should be whatever, /api is for storybook
};

const user = { id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' };

export const Normal = () => (
    <PanneauContainer definition={panneauDefinition} memoryRouter {...props} />
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
