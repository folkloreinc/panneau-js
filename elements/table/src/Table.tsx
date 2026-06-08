import classNames from 'classnames';
import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import type { ChangeEvent, ElementType, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Column, Item, Label } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import {
    getComponentFromName,
    selectItems,
    toggleSelectedItem,
    unselectItems,
} from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

import SortLink from './SortLink';

interface TableItem extends Item {
    rowClassName?: string | null;
    actionsDisabled?: boolean;
    selectionDisabled?: boolean;
    loading?: boolean;
}

interface TableProps {
    items?: TableItem[];
    columns?: Column[];
    loading?: boolean;
    loaded?: boolean;
    empty?: boolean;
    theme?: string | null;
    baseUrl?: string | null;
    query?: Record<string, unknown> | null;
    sortColumnParameter?: string;
    sortDirectionParameter?: string;
    onQueryChange?: ((query: Record<string, unknown>) => void) | null;
    emptyLabel?: Label | null;
    striped?: boolean;
    stripedColumns?: boolean;
    withoutId?: boolean;
    withFadedId?: boolean;
    displayPlaceholder?: ReactNode | string | null;
    selectable?: boolean;
    selectedItems?: Item[] | null;
    onSelectionChange?: ((items: Item[] | null) => void) | null;
    multipleSelection?: boolean;
    withCustomActionsColumn?: boolean;
    withoutLoading?: boolean;
    withoutEmpty?: boolean;
    actionsComponent?: ElementType | null;
    actionsProps?: Record<string, unknown> | null;
    actionsClassName?: string | null;
    className?: string | null;
}

const DEFAULT_ITEMS: Item[] = [];
const DEFAULT_COLUMNS: Column[] = [];

function Table({
    items = DEFAULT_ITEMS,
    columns = DEFAULT_COLUMNS,
    loading = false,
    loaded = false,
    empty = false,
    theme = null,
    baseUrl = null,
    query = null,
    sortColumnParameter = 'order',
    sortDirectionParameter = 'order_direction',
    onQueryChange = null,
    emptyLabel = null,
    striped = false,
    stripedColumns = false,
    withoutId = false,
    withFadedId = true,
    displayPlaceholder = null,
    selectable = false,
    selectedItems = null,
    onSelectionChange = null,
    multipleSelection = false,
    withCustomActionsColumn = false,
    withoutLoading = false,
    withoutEmpty = false,
    actionsComponent = null,
    actionsProps = null,
    actionsClassName = null,
    className = null,
}: TableProps) {
    const displayComponents = useDisplaysComponents();
    const hasIdColumn =
        (columns.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const Actions = actionsComponent || null;
    const withActionsColumn = withCustomActionsColumn && Actions !== null;
    const withIdColumn = !withoutId && !hasIdColumn && !selectable;

    const onSelectItem = (newItem: Item | null = null) => {
        const newSelectedItems = toggleSelectedItem(selectedItems, newItem, {
            multiple: multipleSelection,
        });
        if (newSelectedItems !== selectedItems && onSelectionChange !== null) {
            onSelectionChange(newSelectedItems);
        }
    };

    const onSelectPage = (pageSelected = false) => {
        const newSelectedItems = pageSelected
            ? selectItems(selectedItems, items)
            : unselectItems(selectedItems, items);
        if (newSelectedItems !== selectedItems && onSelectionChange !== null) {
            onSelectionChange(newSelectedItems);
        }
    };

    const ids = (items || []).map(({ id = null }) => id).filter((id) => id !== null) || [];
    const currentPageItems =
        (selectedItems || []).filter((it) => {
            const { id = null } = it;
            return (ids || []).indexOf(id) !== -1;
        }) || [];
    const pageSelected =
        multipleSelection &&
        currentPageItems.length > 0 &&
        currentPageItems.length === (items || []).length;

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
                        theme !== null ? `table-${theme}` : null,
                        {
                            'table-striped': striped,
                            'table-striped-columns': stripedColumns,
                        },
                        className,
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
                            {columns.map((column, idx: number) => {
                                const {
                                    id,
                                    field = null,
                                    label = null,
                                    path = null,
                                    sortable: columnSortable = false,
                                    sortColumnName = null,
                                    sortColumnParameter: columnSortColumnParameter,
                                    sortDirectionParameter: columnSortDirectionParameter,
                                    sortDirections,
                                } = column;
                                return (
                                    <th scope="col" key={`col-${id}-${label}-${idx + 1}`}>
                                        {columnSortable ? (
                                            <SortLink
                                                className="text-nowrap"
                                                baseUrl={baseUrl || undefined}
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
                                );
                            })}
                            {withActionsColumn ? <th scope="col">&nbsp;</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, rowIdx: number) => {
                            const {
                                id = null,
                                rowClassName = null,
                                actionsDisabled = false,
                                selectionDisabled = false,
                                loading: itemLoading = false,
                            } = it || {};

                            const checked =
                                selectable && !selectionDisabled
                                    ? ((selectedItems || []).find(
                                          ({ id: itemId = null }) => id === itemId,
                                      ) || null) !== null
                                    : false;

                            const selectRow = (e: ChangeEvent) => {
                                if (
                                    onSelectItem !== null &&
                                    !selectionDisabled &&
                                    (e.target as HTMLElement).tagName.toLowerCase() !== 'button' &&
                                    (e.target as HTMLElement).tagName.toLowerCase() !== 'a' &&
                                    (e.target as HTMLElement).tagName.toLowerCase() !== 'i'
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
                                            [rowClassName]: rowClassName !== null,
                                        },
                                    ])}
                                    style={{
                                        borderColor: checked ? 'var(--bs-primary)' : undefined,
                                    }}
                                    {...(onSelectionChange !== null
                                        ? { onClick: selectRow, role: 'button' }
                                        : {})}
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
                                            <span className="form-check-label px-2 text-nowrap">
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

                                    {columns.map((column, idx: number) => {
                                        const {
                                            id: colId,
                                            component,
                                            field = null,
                                            path = null,
                                            columnClassName = null,
                                            ...displayProps
                                        } = column || {};

                                        const isActions =
                                            colId === 'actions' || component === 'actions';

                                        const FieldDisplayComponent = getComponentFromName(
                                            isActions
                                                ? component || 'actions'
                                                : component || 'text',
                                            displayComponents,
                                            isActions && actionsComponent !== null
                                                ? actionsComponent
                                                : 'span',
                                        );

                                        let displayValue = null;
                                        if (path !== null) {
                                            displayValue = get(it, path, null);
                                        } else if (field !== null) {
                                            displayValue = get(
                                                it,
                                                isString(field) ? field : field?.name,
                                                null,
                                            );
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
                                                        'text-end': isActions && !withActionsColumn,
                                                    },
                                                    columnClassName,
                                                ])}
                                            >
                                                {FieldDisplayComponent !== null ? (
                                                    <FieldDisplayComponent
                                                        {...(isActions
                                                            ? {
                                                                  disabled: actionsDisabled,
                                                                  ...actionsProps,
                                                              }
                                                            : null)}
                                                        {...displayProps}
                                                        field={field}
                                                        value={displayValue}
                                                        placeholder={
                                                            itemLoading ? (
                                                                <div className="placeholder-glow">
                                                                    <span className="placeholder placeholder-xs w-100" />
                                                                </div>
                                                            ) : (
                                                                displayPlaceholder
                                                            )
                                                        }
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
                                                },
                                                actionsClassName,
                                            ])}
                                            key={`col-${id}-actions`}
                                        >
                                            {Actions ? (
                                                <Actions
                                                    {...actionsProps}
                                                    item={it}
                                                    disabled={actionsDisabled}
                                                />
                                            ) : null}
                                        </td>
                                    ) : null}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : null}
            {loading && !loaded && (items === null || items.length === 0) && !withoutLoading ? (
                <Loading className="mw-25 mt-3 m-auto" withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            ) : null}
            {(empty || (!loading && loaded && (items === null || items.length === 0))) &&
            !withoutEmpty ? (
                <Empty className="mt-3" withDelay>
                    {emptyLabel || (
                        <FormattedMessage defaultMessage="No results" description="Empty label" />
                    )}
                </Empty>
            ) : null}
        </div>
    );
}

export default Table;
