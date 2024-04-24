/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-props-no-spreading  */
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import { checkClickable, getComponentFromName, selectItem, selectPage } from '@panneau/core/utils';
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
    displayPlaceholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    selectable: PropTypes.bool,
    selectedItems: PropTypes.oneOf([PanneauPropTypes.items, PanneauPropTypes.item]),
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
    withCustomActionsColumn: PropTypes.bool,
    withoutLoading: PropTypes.bool,
    actionsComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    actionsProps: PropTypes.shape({}),
    actionsClassName: PropTypes.string,
    className: PropTypes.string,
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
    displayPlaceholder: null,
    selectable: false,
    selectedItems: null,
    onSelectionChange: null,
    multipleSelection: false,
    withCustomActionsColumn: false,
    withoutLoading: false,
    actionsComponent: null,
    actionsProps: null,
    actionsClassName: null,
    className: null,
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
    displayPlaceholder,
    selectable,
    selectedItems,
    onSelectionChange,
    multipleSelection,
    withCustomActionsColumn,
    withoutLoading,
    actionsComponent,
    actionsProps,
    actionsClassName,
    className,
}) {
    const displayComponents = useDisplaysComponents();
    const hasIdColumn =
        (columns.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const Actions = actionsComponent || null;
    const withActionsColumn = withCustomActionsColumn && Actions !== null;
    const withIdColumn = !withoutId && !hasIdColumn && !selectable;
    const partialSelectedItems =
        selectedItems !== null && !isArray(selectedItems) ? [selectedItems] : null;
    const finalSelectedItems =
        selectedItems !== null && isArray(selectedItems)
            ? selectedItems.filter((it) => it !== null)
            : partialSelectedItems;

    const onSelectItem = useCallback(
        (newItem = null) => {
            selectItem(newItem, selectedItems, onSelectionChange, multipleSelection);
        },
        [items, selectedItems, onSelectionChange, multipleSelection],
    );

    const onSelectPage = useCallback(
        (pageSelected = false) => {
            selectPage(pageSelected, items, selectedItems, onSelectionChange);
        },
        [items, selectedItems, onSelectionChange],
    );

    const pageSelected = useMemo(() => {
        if (
            items === null ||
            items.length === 0 ||
            selectedItems === null ||
            selectedItems.length === 0 ||
            !multipleSelection
        ) {
            return false;
        }
        const ids = (items || []).map(({ id = null } = {}) => id).filter((id) => id !== null) || [];
        if (ids === null || ids.length === 0) {
            return false;
        }
        const currentPageItems =
            (selectedItems || []).filter((it) => {
                const { id = null } = it || {};
                return (ids || []).indexOf(id) !== -1;
            }) || [];
        return currentPageItems.length > 0 && currentPageItems.length === (items || []).length;
    }, [selectedItems, items]);

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
                            {selectable && multipleSelection ? (
                                <th scope="col">
                                    <input
                                        id="checkAll"
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        autoComplete="off"
                                        checked={pageSelected}
                                        onChange={() => onSelectPage(pageSelected)}
                                    />
                                </th>
                            ) : null}
                            {selectable && !multipleSelection ? (
                                <th scope="col">
                                    <span className="form-check-label pe-2 text-muted" />
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
                                ? ((finalSelectedItems || []).find(
                                      ({ id: itemId = null } = {}) => id === itemId,
                                  ) || null) !== null
                                : false;

                            // TODO: fix this
                            const selectRow = (e) => {
                                // if (onSelectItem !== null && checkClickable(e.target)) {
                                //     onSelectItem(it);
                                // }
                                if (
                                    onSelectItem !== null &&
                                    e.target.tagName.toLowerCase() !== 'button' &&
                                    e.target.tagName.toLowerCase() !== 'a' &&
                                    e.target.tagName.toLowerCase() !== 'i'
                                ) {
                                    onSelectItem(it);
                                }
                            };

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
                                    {...(onSelectionChange !== null
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
                                            colId === 'actions'
                                                ? component || 'actions'
                                                : component || 'text',
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
                                                        {...displayProps}
                                                        actionsProps={
                                                            colId === 'actions'
                                                                ? actionsProps
                                                                : null
                                                        }
                                                        field={field}
                                                        value={displayValue}
                                                        placeholder={displayPlaceholder}
                                                        selected={checked}
                                                        item={it}
                                                    />
                                                ) : (
                                                    displayPlaceholder
                                                )}
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
            ) : null}
            {(items === null || items.length === 0) && !withoutLoading ? (
                <Loading withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            ) : null}
        </div>
    );
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
