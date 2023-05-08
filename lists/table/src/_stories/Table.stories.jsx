import React from 'react';

import { RoutesProvider } from '@panneau/core/contexts';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';
import DisplayProvider from '../../../../packages/displays';
import Table from '../Table';

export default {
    component: Table,
    title: 'Lists/Table',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <RoutesProvider
                routes={{
                    'resources.show': '/{resource}/{id}',
                    'resources.edit': '/{resource}/{id}/edit',
                    'resources.delete': '/{resource}/{id}/delete',
                }}
            >
                <ResourceProvider resource={pageResource}>
                    <DisplayProvider>
                        <Story />
                    </DisplayProvider>
                </ResourceProvider>
            </RoutesProvider>
        ),
    ],
};

const items = [
    { id: '1', title: { fr: 'Paul1', en: 'Paul1' }, description: 'Paul1' },
    { id: '2', title: { fr: 'Paul2', en: 'Paul2' }, description: 'Paul2' },
    { id: '3', title: { fr: 'Paul3', en: 'Paul3' }, description: 'Paul3' },
    { id: '4', title: { fr: 'Paul4', en: 'Paul4' }, description: 'Paul4', rowDisabled: true },
    {
        id: '5',
        title: { fr: 'Paul5', en: 'Paul5' },
        description: 'Paul5',
        rowClassName: 'table-info',
    },
];

export const Normal = () => (
    <Table resource={pageResource} items={items} columns={['title', 'description']} />
);

export const Sortable = () => (
    <Table resource={pageResource} items={items} columns={['title', 'description']} sortable />
);

export const WithActions = () => (
    <Table
        resource={pageResource}
        items={items}
        columns={['title', 'description']}
        actions={['view', 'delete']}
    />
);
