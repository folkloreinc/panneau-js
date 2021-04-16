import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';

import Table from '../Table';

import { ResourceProvider } from '../../../../packages/core/contexts';

export default {
    component: Table,
    title: 'Lists/Table',
    parameters: {
        intl: true,
    },
};

const Container = () => (
    <ResourceProvider resource={pageResource}>
        <Table resource={pageResource} items={[{ id: '1', label: 'Paul', name: 'Paul' }]} />
    </ResourceProvider>
);

export const Normal = () => <Container />;
