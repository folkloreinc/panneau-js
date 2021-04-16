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

export const Normal = () => <PanneauContainer definition={panneauDefinition} memoryRouter />;

export const WithUser = () => (
    <PanneauContainer
        definition={panneauDefinition}
        memoryRouter
        user={{ id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' }}
    />
);
