/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getColumnsWithFields } from '@panneau/core/utils';
import Table from '@panneau/element-table';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    actions: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ id: PropTypes.string })]),
    ),
    columns: PanneauPropTypes.tableColumns,
    withoutId: PropTypes.bool,
    withoutActionsColumn: PropTypes.bool,
};

const DEFAULT_ITEMS = [];
const DEFAULT_COLUMNS = [];
const DEFAULT_ACTIONS = ['show', 'edit', 'delete'];

function TableList({
    resource,
    items = DEFAULT_ITEMS,
    actions = DEFAULT_ACTIONS,
    columns = DEFAULT_COLUMNS,
    withoutId = false,
    withoutActionsColumn = false,
    ...props
}) {
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

TableList.propTypes = propTypes;

export default TableList;
