/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import { getColumnsWithFields, getComponentFromName } from '@panneau/core/utils';
import ItemActions from '@panneau/element-item-actions';
import Loading from '@panneau/element-loading';

import SortLink from './SortLink';

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
    emptyLabel: PanneauPropTypes.message,
    withoutId: PropTypes.bool,
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
};

const TableList = ({
    resource,
    items,
    actions,
    columns,
    theme,
    baseUrl,
    query,
    sortColumnParameter,
    sortDirectionParameter,
    onQueryChange,
    showEmptyLabel,
    emptyLabel,
    withoutId,
}) => {
    const displayComponents = useDisplaysComponents();

    const columnsWithFields = useMemo(
        () => getColumnsWithFields(resource, columns),
        [resource, columns],
    );

    const hasIdColumn =
        (columnsWithFields.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const actionColumn = (columnsWithFields || []).find((it) => it.id === 'actions') || null;
    const hasActionsColumn = actionColumn !== null;

    return (
        <div>
            {items !== null ? (
                <table
                    className={classNames([
                        'table',
                        'table-sm',
                        'table-hover',
                        'align-middle',
                        'mb-0',
                        { [`table-${theme}`]: theme !== null },
                    ])}
                >
                    <thead>
                        <tr>
                            {!withoutId && !hasIdColumn ? <th scope="col">#</th> : null}
                            {columnsWithFields.map(
                                (
                                    {
                                        id,
                                        field,
                                        label = null,
                                        sortable: columnSortable = false,
                                        sortColumnName = null,
                                        sortColumnParameter: columnSortColumnParameter,
                                        sortDirectionParameter: columnSortDirectionParameter,
                                        sortDirections,
                                    },
                                    idx,
                                ) => (
                                    <th scope="col" key={`col-${id}-${label}-${idx + 1}`}>
                                        {columnSortable ? (
                                            <SortLink
                                                baseUrl={baseUrl}
                                                query={query}
                                                field={sortColumnName || field}
                                                parameterName={
                                                    columnSortColumnParameter || sortColumnParameter
                                                }
                                                directionParameterName={
                                                    columnSortDirectionParameter ||
                                                    sortDirectionParameter
                                                }
                                                directions={sortDirections}
                                                onQueryChange={onQueryChange}
                                            >
                                                {label}
                                            </SortLink>
                                        ) : (
                                            label
                                        )}
                                    </th>
                                ),
                            )}
                            {!hasActionsColumn ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx) => {
                            const { id = null } = it || {};
                            return (
                                <tr key={`row-${id}-${rowIdx + 1}`}>
                                    {!withoutId && !hasIdColumn ? (
                                        <td className="col-auto">{id}</td>
                                    ) : null}
                                    {columnsWithFields.map((column, idx) => {
                                        const {
                                            id: colId,
                                            component,
                                            field = null,
                                            path = null,
                                            columnClassName = null,
                                            ...displayProps
                                        } = column || {};

                                        if (colId === 'actions') {
                                            const FieldDisplayComponent = getComponentFromName(
                                                component,
                                                displayComponents,
                                                ItemActions,
                                            );
                                            return (
                                                <td
                                                    key={`row-${id}-${colId}-${idx + 1}`}
                                                    className={classNames([
                                                        'col-auto',
                                                        {
                                                            'text-end':
                                                                idx ===
                                                                columnsWithFields.length - 1,
                                                            [columnClassName]:
                                                                columnClassName !== null,
                                                        },
                                                    ])}
                                                >
                                                    <FieldDisplayComponent
                                                        {...displayProps}
                                                        resource={resource}
                                                        item={it}
                                                    />
                                                </td>
                                            );
                                        }

                                        const FieldDisplayComponent = getComponentFromName(
                                            component || 'text',
                                            displayComponents,
                                            'span',
                                        );

                                        let displayValue = null;
                                        if (path !== null) {
                                            displayValue = get(it, path, null);
                                        } else if (field !== null) {
                                            displayValue = get(it, field.name, null);
                                        }

                                        return (
                                            <td
                                                className={classNames([
                                                    'col-auto',
                                                    {
                                                        [columnClassName]: columnClassName !== null,
                                                    },
                                                ])}
                                                key={`row-${id}-${colId}-${idx + 1}`}
                                            >
                                                {FieldDisplayComponent !== null ? (
                                                    <FieldDisplayComponent
                                                        {...displayProps}
                                                        field={field}
                                                        value={displayValue}
                                                        item={it}
                                                    />
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                    {!hasActionsColumn ? (
                                        <td className="text-end col-auto">
                                            <ItemActions
                                                resource={resource}
                                                item={it}
                                                actions={actions}
                                            />
                                        </td>
                                    ) : null}
                                </tr>
                            );
                        })}
                        {showEmptyLabel && emptyLabel !== null ? emptyLabel : null}
                    </tbody>
                </table>
            ) : (
                <Loading>Loading</Loading>
            )}
        </div>
    );
};

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
