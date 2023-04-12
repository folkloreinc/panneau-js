import React from 'react';

import { RoutesProvider } from '@panneau/core/contexts';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';
import Calendar from '../Calendar';

export default {
    component: Calendar,
    title: 'Lists/Calendar',
    parameters: {
        intl: true,
    },
};

const CalendarContainer = () => (
    <RoutesProvider
        routes={{
            'resources.show': '/{resource}/{id}',
            'resources.edit': '/{resource}/{id}/edit',
            'resources.delete': '/{resource}/{id}/delete',
        }}
    >
        <ResourceProvider resource={pageResource}>
            <Calendar
                resource={pageResource}
                items={[
                    { id: '1', slug: 'paul', title: 'Paul' },
                    { id: '2', slug: 'john', title: 'John' },
                    { id: '3', slug: 'george', title: 'George' },
                    { id: '4', slug: 'ringo', title: 'Ringo' },
                ]}
            />
        </ResourceProvider>
    </RoutesProvider>
);

export const Normal = () => <CalendarContainer />;
