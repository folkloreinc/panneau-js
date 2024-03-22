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

const columnsWithId = [
    { id: 'id', label: 'ID', path: 'id', sortable: true },
    { id: 'name', label: 'Name', path: 'name', sortable: true },
];

const Actions = () => (
    <div>
        <p className="d-inline">????</p>
        <button className="d-inline" type="button">
            HAHAHA this is action
        </button>
    </div>
);

export const Normal = () => (
    <DisplaysProvider>
        <TableElement items={items} columns={columns} />
    </DisplaysProvider>
);

export const Selectable = () => (
    <DisplaysProvider>
        <TableElement items={items} columns={columnsWithId} selectable />
    </DisplaysProvider>
);

export const SelectableMultiple = () => (
    <DisplaysProvider>
        <TableElement items={items} columns={columnsWithId} selectable multiple />
    </DisplaysProvider>
);

export const Sortable = () => {
    const [query, setQuery] = useState({});
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

export const WithCustomActions = () => (
    <DisplaysProvider>
        <TableElement
            items={items}
            columns={columns}
            actionsComponent={Actions}
            withCustomActionsColumn
        />
    </DisplaysProvider>
);
