import get from 'lodash-es/get';
import { useState } from 'react';

import TableElement from '../Table';

export default {
    component: TableElement,
    title: 'Elements/Table',
    parameters: {
        intl: true,
    },
};

const items = [
    { id: '1', name: 'Hello1' },
    { id: '2', name: '2Hello2' },
    { id: '3', name: 'He3llo3' },
    { id: '4', name: '4Hello4' },
];

const columns = [{ id: 'name', label: 'Name', path: 'name', sortable: true }];

// The basic table only renders the scaffolding (header + tbody wrapper).
// Rows are provided as children by the parent (the list).
function renderRows(cols) {
    return items.map((item) => (
        <tr key={`row-${item.id}`}>
            {cols.map((column) => (
                <td key={`col-${item.id}-${column.id}`}>{get(item, column.path, null)}</td>
            ))}
        </tr>
    ));
}

export const Normal = {
    render: () => <TableElement columns={columns}>{renderRows(columns)}</TableElement>,
};

function SortableExample() {
    const [query, setQuery] = useState({});
    return (
        <TableElement
            columns={columns}
            baseUrl={null}
            query={query}
            sortColumnParameter="order"
            sortDirectionParameter="order_direction"
            onQueryChange={setQuery}
        >
            {renderRows(columns)}
        </TableElement>
    );
}

export const Sortable = {
    render: () => <SortableExample />,
};
