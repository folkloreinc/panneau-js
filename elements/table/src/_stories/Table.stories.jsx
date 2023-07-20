import React, { useState } from 'react';

import DisplaysProvider from '../../../../packages/displays/src';
import TableElement from '../Table';

export default {
    component: TableElement,
    title: 'Elements/Table',
    parameters: {
        intl: true,
    },
};

const items = [
    {
        id: '1',
        name: 'Hello1',
    },
    {
        id: '2',
        name: '2Hello2',
    },
    {
        id: '3',
        name: 'He3llo3',
    },
    {
        id: '4',
        name: '4Hello4',
    },
];

const columns = [{ id: 'name', label: 'Name', path: 'name', sortable: true }];

export const Normal = () => (
    <DisplaysProvider>
        <TableElement items={items} columns={columns} />
    </DisplaysProvider>
);

const Actions = ({ item: { name = 'LOL' } = {} }) => (
    <div>
        <p className="d-inline">????</p>
        <button className="d-inline" type="button">
            {name || ''}
        </button>
    </div>
);

export const Sortable = () => {
    const [query, setQuery] = useState({});
    console.log('query', query);
    return (
        <DisplaysProvider>
            <TableElement
                items={items}
                columns={columns}
                baseUrl={null}
                query={query}
                sortColumnParameter="order"
                sortDirectionParameter="order_direction"
                onQueryChange={setQuery}
            />
        </DisplaysProvider>
    );
};

export const WithActions = () => (
    <DisplaysProvider>
        <TableElement items={items} columns={columns} actionsComponent={Actions} />
    </DisplaysProvider>
);
