/* eslint-disable react/jsx-props-no-spreading */
// import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
// import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { getColumnsWithFields, getComponentFromName } from '@panneau/core/utils';
import ItemActions from '@panneau/element-item-actions';
import Loading from '@panneau/element-loading';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    // query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // page: PropTypes.number,
    // lastPage: PropTypes.number,
    // total: PropTypes.number,
    // baseUrl: PropTypes.string,
    theme: PropTypes.string,
    // onQueryChange: PropTypes.func,
};

const defaultProps = {
    items: [],
    columns: [],
    // query: null,
    // page: null,
    // lastPage: null,
    // total: null,
    // baseUrl: null,
    theme: null,
    // onQueryChange: null,
};

const TableList = ({
    columns,
    resource,
    items,
    theme,
    // onQueryChange,
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
                            <th scope="col">#</th>
                            {columnsWithFields.map(({ name, label = null }, idx) => (
                                <th scope="col" key={`col-${name}-${label}-${idx + 1}`}>
                                    {label}
                                </th>
                            ))}
                            {!hasActionsColumns ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx) => {
                            const { id = null } = it || {};
                            return (
                                <tr key={`row-${id}-${rowIdx + 1}`}>
                                    <td className="col-auto">{id}</td>
                                    {columnsWithFields.map((column, idx) => {
                                        const {
                                            id: colId,
                                            component,
                                            valueKey = null,
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
                                                            valueKey !== null
                                                                ? it[valueKey] || null
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
            {/* {paginated && lastPage > 1 && items !== null ? (
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={currentUrl}
                    className="mt-4"
                    withCount
                />
            ) : null} */}
        </div>
    );
};

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
