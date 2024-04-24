import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/src/contexts';
import DisplayProvider from '../../../../packages/displays';
import Table from '../TableList';

export default {
    component: Table,
    title: 'Lists/Table',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <ResourceProvider resource={pageResource}>
                <DisplayProvider>
                    <Story />
                </DisplayProvider>
            </ResourceProvider>
        ),
    ],
};

const items = [
    { id: '1', title: { fr: 'Paul1', en: 'Paul1' }, description: 'Paul 1.5', url: 'ABCD' },
    { id: '2', title: { fr: 'Paul2', en: 'Paul2' }, description: 'Paul 2.5' },
    { id: '3', title: { fr: 'Paul3', en: 'Paul3' }, description: 'Paul 3.5' },
    { id: '4', title: { fr: 'Paul4', en: 'Paul4' }, description: 'Paul 4.5', rowDisabled: true },
    {
        id: '5',
        title: { fr: 'Paul5', en: 'Paul5' },
        description: 'Paul 5.5 ahsdkfl djjjjjjfk asdjhfk ajsd',
        rowClassName: 'table-info',
    },
];

export const Normal = () => (
    <Table resource={pageResource} items={items} columns={['title', 'description']} />
);

export const Sortable = () => (
    <Table resource={pageResource} items={items} columns={['title', 'description']} sortable />
);

export const Selectable = () => (
    <Table
        resource={{ ...pageResource, index: { tableActions: [] } }}
        items={items}
        columns={['title', 'description']}
        sortable
        selectable
        onSelectionChange={() => {
            console.log('hey');
        }}
    />
);

export const WithActions = () => (
    <Table
        resource={pageResource}
        items={items}
        columns={['title', 'description']}
        actions={['show', 'delete']}
    />
);
