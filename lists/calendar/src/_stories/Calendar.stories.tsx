import { useCallback, useState } from 'react';

import { RoutesProvider } from '@panneau/core/contexts';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/src/contexts';
import Calendar from '../Calendar';

export default {
    component: Calendar,
    title: 'Lists/Calendar',
    parameters: {
        intl: true,
    },
};

const CalendarContainer = (props = null) => {
    const [initialDate] = useState('2023-04-01');

    const onDateChange = useCallback((newDate) => {
        console.log('onDateChange', newDate);
    });

    const onPeriodChange = useCallback((newMonth) => {
        console.log('onPeriodChange', newMonth);
    });

    return (
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
                    initialDate={initialDate}
                    onDateChange={onDateChange}
                    onPeriodChange={onPeriodChange}
                    items={[
                        { id: '1', slug: 'paul', title: 'Paul', date: '2023-03-29' },
                        { id: '2', slug: 'john', title: 'John', date: '2023-04-22' },
                        { id: '3', slug: 'george', title: 'George', date: '2023-04-29' },
                        { id: '4', slug: 'ringo', title: 'Ringo', date: '2023-04-02' },
                    ]}
                    {...props}
                />
            </ResourceProvider>
        </RoutesProvider>
    );
};

export const Monthly = {
    render: () => <CalendarContainer />,
};

export const Weekly = {
    render: () => <CalendarContainer mode="weekly" />,
};

export const Empty = {
    render: () => <CalendarContainer items={null} />,
};
