/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getColumnsWithFields } from '@panneau/core/utils';
import ItemActions from '@panneau/element-item-actions';
import Table from '@panneau/element-table';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    actions: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ id: PropTypes.string })]),
    ),
    columns: PanneauPropTypes.tableColumns,
    theme: PropTypes.string,
    baseUrl: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    sortColumnParameter: PropTypes.string,
    sortDirectionParameter: PropTypes.string,
    onQueryChange: PropTypes.func,
    showEmptyLabel: PropTypes.bool,
    emptyLabel: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
        PropTypes.shape({ defaultMessage: PropTypes.string }),
    ]),
    withoutId: PropTypes.bool,
    withFadedId: PropTypes.bool,
    reload: PropTypes.func,
    reloadPage: PropTypes.func,
    updateItem: PropTypes.func,
    actionsProps: PropTypes.shape({}),
    withoutActionsColumn: PropTypes.bool,
};

const defaultProps = {
    items: [],
    actions: ['show', 'edit', 'delete'],
    columns: [],
    theme: null,
    baseUrl: null,
    query: null,
    sortColumnParameter: 'order',
    sortDirectionParameter: 'order_direction',
    onQueryChange: null,
    showEmptyLabel: false,
    emptyLabel: null,
    withoutId: false,
    withFadedId: false,
    reload: null,
    reloadPage: null,
    updateItem: null,
    actionsProps: null,
    withoutActionsColumn: false,
};

const ResourceTableList = ({
    resource,
    items,
    actions,
    columns,
    withoutId,
    reload,
    reloadPage,
    updateItem,
    actionsProps,
    withoutActionsColumn,
    ...props
}) => {
    const columnList = useMemo(() => getColumnsWithFields(resource, columns), [resource, columns]);
    const hasIdColumn =
        (columnList.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const actionColumn = (columnList || []).find((it) => it.id === 'actions') || null;
    // const hasActionsColumn = actionColumn !== null && !withoutActionsColumn;
    const columnsWithFields = withoutActionsColumn
        ? (columnList || []).filter((it) => it.id !== 'actions')
        : columnList;
    const finalColumnsWithFields = columnsWithFields;
    const actionsComponent = ItemActions;

    return items !== null ? (
        <Table
            items={items}
            columns={finalColumnsWithFields}
            actionsComponent={actionsComponent}
            actionsProps={{
                resource,
                actions,
                reload,
                reloadPage,
                updateItem,
                ...actionsProps,
            }}
            withoutId={withoutId || hasIdColumn}
            withCustomActionsColumn={actionColumn === null && !withoutActionsColumn}
            {...props}
        />
    ) : null;
};

ResourceTableList.propTypes = propTypes;
ResourceTableList.defaultProps = defaultProps;

export default ResourceTableList;
