import { useMemo } from 'react';

import type { Item, Resource, TableColumn } from '@panneau/core/types';
import { getColumnsWithFields } from '@panneau/core/utils';
import Table from '@panneau/element-table';

interface TableListProps {
    resource: Resource;
    items?: Item[] | null;
    actions?: (string | { id?: string })[] | null;
    columns?: TableColumn[] | null;
    withoutId?: boolean;
    withoutActionsColumn?: boolean;
    [key: string]: unknown;
}

const DEFAULT_ITEMS: Item[] = [];
const DEFAULT_COLUMNS: TableColumn[] = [];
const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

function TableList({
    resource,
    items = DEFAULT_ITEMS,
    actions: _actions = DEFAULT_ACTIONS,
    columns = DEFAULT_COLUMNS,
    withoutId = false,
    withoutActionsColumn = false,
    ...props
}: TableListProps) {
    const columnList = useMemo(() => getColumnsWithFields(resource, columns), [resource, columns]);
    const hasIdColumn =
        (columnList.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const actionColumn = (columnList || []).find((it) => it.id === 'actions') || null;
    const columnsWithFields = withoutActionsColumn
        ? (columnList || []).filter((it) => it.id !== 'actions')
        : columnList;
    const finalColumnsWithFields = columnsWithFields;

    return items !== null ? (
        <Table
            items={items}
            columns={finalColumnsWithFields}
            withoutId={withoutId || hasIdColumn}
            withCustomActionsColumn={actionColumn === null && !withoutActionsColumn}
            {...props}
        />
    ) : null;
}

export default TableList;
