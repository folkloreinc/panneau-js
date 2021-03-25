import React from 'react';

import Table from '../Table';

export default {
    component: Table,
    title: 'Lists/Table',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Table />;
