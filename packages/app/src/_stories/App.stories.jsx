import React from 'react';

import PanneauContainer from '../components/Container';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';

export default {
    component: PanneauContainer,
    title: 'App',
    parameters: {
        intl: true,
    },
};

const user = { id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' };

export const Normal = () => <PanneauContainer definition={panneauDefinition} memoryRouter />;

export const WithUser = () => (
    <PanneauContainer definition={panneauDefinition} memoryRouter user={user} />
);

export const LightMode = () => (
    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'light' } }}
        memoryRouter
        user={user}
    />
);

export const DarkMode = () => (
    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'dark' } }}
        memoryRouter
        user={user}
    />
);
