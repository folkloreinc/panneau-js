import React from 'react';
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
        (Story) => {
            return (
                <ResourceProvider resource={pageResource}>
                    <DisplayProvider>
                        <Story />
                    </DisplayProvider>
                </ResourceProvider>
            );
        },
    ],
};

const items = [
    { id: '1', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
    { id: '2', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
    { id: '3', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
    { id: '4', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
    { id: '5', title: { fr: 'Paul', en: 'Paul' }, description: 'Paul' },
];

export const Normal = () => <Table resource={pageResource} items={items} columns={['title', 'description']} />;

export const Sortable = () => <Table resource={pageResource} items={items} columns={['title', 'description']} sortable />;
