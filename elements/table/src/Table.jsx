/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-props-no-spreading  */
import classNames from 'classnames';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import { useItemSelection } from '@panneau/core/hooks';
import { getComponentFromName } from '@panneau/core/utils';
import Icon from '@panneau/element-icon';
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
    withFadedId: PropTypes.bool,
    selectable: PropTypes.bool,
    multipleSelection: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    className: PropTypes.string,
    withCustomActionsColumn: PropTypes.bool,
    actionsComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    actionsProps: PropTypes.shape({}),
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
    withFadedId: true,
    selectable: false,
    multipleSelection: false,
    onSelectionChange: null,
    selectedItems: null,
    className: null,
    withCustomActionsColumn: false,
    actionsComponent: null,
    actionsProps: null,
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
    withFadedId,
    selectable,
    multipleSelection,
    onSelectionChange,
    selectedItems: initialSelectedItems,
    className,
    withCustomActionsColumn,
    actionsComponent,
    actionsProps,
    actionsClassName,
}) {
    const displayComponents = useDisplaysComponents();
    const hasIdColumn =
        (columns.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const Actions = actionsComponent || null;
    const withActionsColumn = withCustomActionsColumn && Actions !== null;
    const withIdColumn = !withoutId && !hasIdColumn && !selectable;

    const {
        onSelectItem,
        onDeselectItem,
        onSelectPage,
        onDeselectPage,
        onClearAll,
        pageSelected,
        count: countSelected,
        selectedItems,
    } = useItemSelection({
        items,
        selectedItems: initialSelectedItems,
        onSelectionChange,
        multipleSelection,
    });

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
                        {selectable ? (
                            <tr>
                                <th colSpan="12">
                                    <span className="text-small ms-1 text-nowrap fw-normal">
                                        {countSelected > 0 ? (
                                            <>
                                                <span className="d-inline-block mb-1">
                                                    <FormattedMessage
                                                        defaultMessage="{count, plural, =0 {no items} one {# item} other {# items}} selected"
                                                        description="Checkbox label"
                                                        values={{ count: countSelected }}
                                                    />
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn badge rounded-pill text-bg-primary ms-2"
                                                    onClick={onClearAll}
                                                >
                                                    <Icon name="x" bold />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="d-inline-block text-muted mb-1">
                                                <FormattedMessage
                                                    defaultMessage="No items selected"
                                                    description="Checkbox label"
                                                />
                                            </span>
                                        )}
                                    </span>
                                </th>
                            </tr>
                        ) : null}
                        <tr>
                            {selectable && multipleSelection ? (
                                <th scope="col">
                                    <input
                                        id="checkAll"
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        autoComplete="off"
                                        checked={pageSelected}
                                        onChange={pageSelected ? onDeselectPage : onSelectPage}
                                    />
                                </th>
                            ) : null}
                            {selectable && !multipleSelection ? (
                                <th scope="col">
                                    <span className="form-check-label pe-2 text-muted">
                                        <FormattedMessage
                                            defaultMessage="Select row"
                                            description="Checkbox label"
                                        />
                                    </span>
                                </th>
                            ) : null}
                            {withIdColumn ? <th scope="col">#</th> : null}
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
                                                className="text-nowrap"
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
                                            <span className="text-nowrap">{label}</span>
                                        )}
                                    </th>
                                ),
                            )}
                            {withActionsColumn ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx) => {
                            const {
                                id = null,
                                rowClassName = null,
                                rowDisabled = false,
                            } = it || {};

                            const checked = selectable
                                ? ((selectedItems || []).find(
                                      ({ id: itemId = null }) => id === itemId,
                                  ) || null) !== null
                                : false;

                            const selectRow = checked
                                ? () => onDeselectItem(it, rowIdx)
                                : () => onSelectItem(it, rowIdx);

                            return (
                                <tr
                                    key={`row-${id}-${rowIdx + 1}`}
                                    className={classNames([
                                        {
                                            'table-row': true,
                                            'table-secondary': rowDisabled || checked,
                                            [rowClassName]: rowClassName !== null,
                                        },
                                    ])}
                                    {...(selectable
                                        ? { onClick: selectRow, role: 'button' }
                                        : null)}
                                >
                                    {selectable ? (
                                        <td className="col-auto text-nowrap">
                                            <input
                                                id={`check-${id}`}
                                                type="checkbox"
                                                className="form-check-input"
                                                autoComplete="off"
                                                checked={checked}
                                                onChange={selectRow}
                                            />
                                            <span
                                                className="form-check-label px-2 text-nowrap"
                                                // htmlFor={`check-${id}`}
                                            >
                                                {!withoutId && !hasIdColumn ? (
                                                    id
                                                ) : (
                                                    <FormattedMessage
                                                        defaultMessage="Select row"
                                                        description="Checkbox label"
                                                    />
                                                )}
                                            </span>
                                        </td>
                                    ) : null}
                                    {withIdColumn ? (
                                        <td className="col-auto">
                                            <span
                                                className={classNames([
                                                    { 'opacity-50': withFadedId },
                                                ])}
                                            >
                                                {id}
                                            </span>
                                        </td>
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
                                            colId === 'actions' ? component : component || 'text',
                                            displayComponents,
                                            colId === 'actions' && actionsComponent !== null
                                                ? actionsComponent
                                                : 'span',
                                        );

                                        let displayValue = null;
                                        if (path !== null) {
                                            displayValue = get(it, path, null);
                                        } else if (field !== null) {
                                            displayValue = get(it, field.name, null);
                                        }

                                        return (
                                            <td
                                                key={`col-${id}-${colId}-${idx + 1}`}
                                                className={classNames([
                                                    'col-auto',
                                                    {
                                                        'text-break':
                                                            (displayValue !== null &&
                                                                isString(displayValue) &&
                                                                displayValue.length >= 30) ||
                                                            isObject(displayValue),
                                                        'text-end':
                                                            colId === 'actions' &&
                                                            !withActionsColumn,
                                                        [columnClassName]: columnClassName !== null,
                                                    },
                                                ])}
                                            >
                                                {FieldDisplayComponent !== null ? (
                                                    <FieldDisplayComponent
                                                        {...(colId === 'actions'
                                                            ? actionsProps
                                                            : null)}
                                                        {...displayProps}
                                                        field={field}
                                                        value={displayValue}
                                                        item={it}
                                                    />
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                    {withActionsColumn ? (
                                        <td
                                            className={classNames([
                                                'col-auto',
                                                {
                                                    'table-row': true,
                                                    'text-end': true,
                                                    [actionsClassName]: actionsClassName !== null,
                                                },
                                            ])}
                                            key={`col-${id}-actions`}
                                        >
                                            <Actions {...actionsProps} item={it} />
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
                <Loading withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            )}
        </div>
    );
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
