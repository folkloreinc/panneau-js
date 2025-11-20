import DateDisplay from '../Date';

export default {
    component: DateDisplay,
    title: 'Displays/Date',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <DateDisplay value="2021-07-16T00:00:00-04:00" />,
};

export const French = {
    render: () => <DateDisplay value="2021-07-16T00:00:00-04:00" format="LLLL" locale="fr" />,
};

export const Japanese = {
    render: () => <DateDisplay value="2021-07-16T00:00:00-04:00" format="LLLL" locale="ja" />,
};
