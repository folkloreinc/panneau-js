/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import Loading from '@panneau/element-loading';

import SortLink from './SortLink';

const propTypes = {
    items: PanneauPropTypes.items,
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
    actionsComponent: PropTypes.element,
    className: PropTypes.string,
    actionsClassName: PropTypes.string,
};

const defaultProps = {
    items: [],
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
    actionsComponent: null,
    className: null,
    actionsClassName: null,
};

function Table({
    items,
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
    className,
    actionsComponent,
    actionsClassName,
}) {
    const displayComponents = useDisplaysComponents();
    const hasIdColumn =
        (columns.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const Actions = actionsComponent || null;
    const hasActionsColumn = Actions !== null;

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
                        { [`table-${theme}`]: theme !== null, [className]: className !== null },
                    ])}
                >
                    <thead>
                        <tr>
                            {!withoutId && !hasIdColumn ? <th scope="col">#</th> : null}
                            {columns.map(
                                (
                                    {
                                        id,
                                        field = null,
                                        label = null,
                                        path = null,
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
                                                field={sortColumnName || field || path}
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
                            {hasActionsColumn ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx) => {
                            const {
                                id = null,
                                rowClassName = null,
                                rowDisabled = false,
                            } = it || {};

                            return (
                                <tr
                                    key={`row-${id}-${rowIdx + 1}`}
                                    className={classNames([
                                        {
                                            'table-row': true,
                                            'table-secondary': rowDisabled,
                                            [rowClassName]: rowClassName !== null,
                                        },
                                    ])}
                                >
                                    {!withoutId && !hasIdColumn ? (
                                        <td className="col-auto">{id}</td>
                                    ) : null}
                                    {columns.map((column, idx) => {
                                        const {
                                            id: colId,
                                            component,
                                            field = null,
                                            path = null,
                                            columnClassName = null,
                                            ...displayProps
                                        } = column || {};

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
                                                key={`col-${id}-${colId}-${idx + 1}`}
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
                                    {actionsComponent !== null ? (
                                        <td
                                            className={classNames([
                                                'col-auto',
                                                {
                                                    'table-row': true,
                                                    [actionsClassName]: actionsClassName !== null,
                                                },
                                            ])}
                                            key={`col-${id}-actions`}
                                        >
                                            <Actions item={it} />
                                        </td>
                                    ) : null}
                                </tr>
                            );
                        })}
                        {showEmptyLabel && emptyLabel !== null ? (
                            <tr key="empty">{emptyLabel}</tr>
                        ) : null}
                    </tbody>
                </table>
            ) : (
                <Loading>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            )}
        </div>
    );
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
