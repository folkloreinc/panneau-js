/* eslint-disable react/jsx-props-no-spreading */
// import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
// import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { getColumnsWithFields, getComponentFromName } from '@panneau/core/utils';
import ItemActions from '@panneau/element-item-actions';
import Loading from '@panneau/element-loading';
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import SortLink from './SortLink';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    columns: PanneauPropTypes.tableColumns,
    theme: PropTypes.string,
    baseUrl: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    sortable: PropTypes.bool,
    sortColumnParameter: PropTypes.string,
    sortDirectionParameter: PropTypes.string,
    onQueryChange: PropTypes.func,
    withoutId: PropTypes.bool,
};

const defaultProps = {
    items: [],
    columns: [],
    theme: null,
    baseUrl: null,
    query: null,
    sortable: false,
    sortColumnParameter: 'order',
    sortDirectionParameter: 'order_direction',
    onQueryChange: null,
    withoutId: false,
};

const TableList = ({
    columns,
    resource,
    items,
    theme,
    baseUrl,
    query,
    sortable,
    sortColumnParameter,
    sortDirectionParameter,
    onQueryChange,
    withoutId,
}) => {
    const displayComponents = useDisplaysComponents();

    // const { page: queryPage } = query || {};
    // const hasQuery = Object.keys(queryWithoutPage).length > 0;

    const columnsWithFields = useMemo(
        () => getColumnsWithFields(resource, columns),
        [resource, columns],
    );

    const hasActionsColumns =
        (columnsWithFields.find((it) => it.id === 'actions') || null) !== null;

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
                            {!withoutId ? (
                                <th scope="col">
                                    {sortable ? (
                                        <SortLink
                                            baseUrl={baseUrl}
                                            query={query}
                                            field="id"
                                            columnParameter={sortColumnParameter}
                                            directionParameter={sortDirectionParameter}
                                            onQueryChange={onQueryChange}
                                        >
                                            #
                                        </SortLink>
                                    ) : (
                                        '#'
                                    )}
                                </th>
                            ) : null}
                            {columnsWithFields.map(
                                (
                                    {
                                        id,
                                        field,
                                        label = null,
                                        sortable: columnSortable = true,
                                        sortDirections,
                                    },
                                    idx,
                                ) => (
                                    <th scope="col" key={`col-${id}-${label}-${idx + 1}`}>
                                        {sortable && columnSortable ? (
                                            <SortLink
                                                baseUrl={baseUrl}
                                                query={query}
                                                field={field}
                                                columnParameter={sortColumnParameter}
                                                directionParameter={sortDirectionParameter}
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
                            {!hasActionsColumns ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx) => {
                            const { id = null } = it || {};
                            return (
                                <tr key={`row-${id}-${rowIdx + 1}`}>
                                    {!withoutId ? <td className="col-auto">{id}</td> : null}
                                    {columnsWithFields.map((column, idx) => {
                                        const {
                                            id: colId,
                                            component,
                                            path = null,
                                            field = null,
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

                                        const fieldValue =
                                            path !== null ? get(it, path, null) : null;

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
                                                        value={
                                                            fieldValue !== null
                                                                ? fieldValue
                                                                : it[colId] || null
                                                        }
                                                        item={it}
                                                    />
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                    {!hasActionsColumns ? (
                                        <td className="text-end col-auto">
                                            <ItemActions resource={resource} item={it} />
                                        </td>
                                    ) : null}
                                </tr>
                            );
                        })}
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
