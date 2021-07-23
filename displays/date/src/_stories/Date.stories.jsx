import React from 'react';
import DateDisplay from '../Date';

export default {
    component: DateDisplay,
    title: 'Displays/Date',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <DateDisplay value="2021-07-16T00:00:00-04:00" />;

export const French = () => (
    <DateDisplay value="2021-07-16T00:00:00-04:00" format="LLLL" locale="fr" />
);

export const Japanese = () => (
    <DateDisplay value="2021-07-16T00:00:00-04:00" format="LLLL" locale="ja" />
);
