import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';

import Cards from '../Cards';

import { ResourceProvider } from '../../../../packages/core/contexts';

export default {
    component: Cards,
    title: 'Lists/Cards',
    parameters: {
        intl: true,
    },
};

const Container = () => (
    <ResourceProvider resource={pageResource}>
        <Cards
            resource={pageResource}
            items={[
                { id: '1', label: 'Paul', name: 'Paul' },
                { id: '2', label: 'John', name: 'John' },
            ]}
        />
    </ResourceProvider>
);

export const Normal = () => <Container />;
