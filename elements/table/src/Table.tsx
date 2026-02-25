/* eslint-disable jsx-a11y/control-has-associated-label  */
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useDisplaysComponents } from '@panneau/core/contexts';
import type { Field, Item, Label, TableColumn } from '@panneau/core/types';
import { getComponentFromName, selectItem, selectPage } from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

import SortLink from './SortLink';

interface TableProps {
    items?: Item[];
    columns?: TableColumn[];
    loading?: boolean;
    loaded?: boolean;
    empty?: boolean;
    theme?: string | null;
    baseUrl?: string | null;
    query?: Record<string, any> | null;
    sortColumnParameter?: string;
    sortDirectionParameter?: string;
    onQueryChange?: ((query: Record<string, any>) => void) | null;
    emptyLabel?: Label | null;
    striped?: boolean;
    stripedColumns?: boolean;
    withoutId?: boolean;
    withFadedId?: boolean;
    displayPlaceholder?: ReactNode | string | null;
    selectable?: boolean;
    selectedItems?: Item[] | Item | null;
    onSelectionChange?: ((items: Item[] | Item | null) => void) | null;
    multipleSelection?: boolean;
    withCustomActionsColumn?: boolean;
    withoutLoading?: boolean;
    withoutEmpty?: boolean;
    actionsComponent?: ComponentType<any> | null;
    actionsProps?: Record<string, any> | null;
    actionsClassName?: string | null;
    className?: string | null;
}

const DEFAULT_ITEMS: Item[] = [];
const DEFAULT_COLUMNS: TableColumn[] = [];

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
        (columns.find(({ id, field }: any) => id === 'id' || (field as any) === 'id') || null) !==
        null;
    const Actions = actionsComponent || null;
    const withActionsColumn = withCustomActionsColumn && Actions !== null;
    const withIdColumn = !withoutId && !hasIdColumn && !selectable;

    const finalSelectedItems = useMemo(() => {
        if (selectedItems === null) {
            return null;
        }
        return isArray(selectedItems) ? selectedItems : [selectedItems];
    }, [selectedItems]);

    const onSelectItem = useCallback(
        (newItem: Item | null = null) => {
            selectItem(
                newItem as any,
                selectedItems as any,
                onSelectionChange as any,
                multipleSelection,
            );
        },
        [items, selectedItems, onSelectionChange, multipleSelection],
    );

    const onSelectPage = useCallback(
        (pageSelected = false) => {
            selectPage(pageSelected, items, selectedItems as any, onSelectionChange as any);
        },
        [items, selectedItems, onSelectionChange],
    );

    const pageSelected = useMemo(() => {
        if (
            items === null ||
            items.length === 0 ||
            selectedItems === null ||
            (selectedItems as any).length === 0 ||
            !multipleSelection
        ) {
            return false;
        }
        const ids =
            (items || []).map(({ id = null }: any = {}) => id).filter((id) => id !== null) || [];
        if (ids === null || ids.length === 0) {
            return false;
        }
        const currentPageItems =
            ((finalSelectedItems as any) || []).filter((it: any) => {
                const { id = null } = it || {};
                return (ids || []).indexOf(id) !== -1;
            }) || [];
        return currentPageItems.length > 0 && currentPageItems.length === (items || []).length;
    }, [selectedItems, items, multipleSelection, finalSelectedItems]);

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
                        {
                            [`table-${theme}`]: theme !== null,
                            'table-striped': striped,
                            'table-striped-columns': stripedColumns,
                            [className!]: className !== null,
                        },
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
                            {columns.map((column: any, idx: number) => {
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
                        {items.map((it: any, rowIdx: number) => {
                            const {
                                id = null,
                                rowClassName = null,
                                actionsDisabled = false,
                                selectionDisabled = false,
                                loading: itemLoading = false,
                            } = it || {};

                            const checked =
                                selectable && !selectionDisabled
                                    ? ((finalSelectedItems || []).find(
                                          ({ id: itemId = null }: any = {}) => id === itemId,
                                      ) || null) !== null
                                    : false;

                            const selectRow = (e: MouseEvent) => {
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

                                    {columns.map((column: any, idx: number) => {
                                        const {
                                            id: colId,
                                            component,
                                            field = null,
                                            path = null,
                                            columnClassName = null,
                                            ...displayProps
                                        } = column || {};

                                        const isActions = colId === 'actions' || component === 'actions';

                                        const FieldDisplayComponent = getComponentFromName(
                                            isActions
                                                ? component || 'actions'
                                                : component || 'text',
                                            displayComponents,
                                            isActions && actionsComponent !== null
                                                ? actionsComponent
                                                : ('span' as any),
                                        );

                                        let displayValue: any = null;
                                        if (path !== null) {
                                            displayValue = get(it, path, null);
                                        } else if (field !== null) {
                                            displayValue = get(
                                                it,
                                                (field as Field).name || field,
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
                                                        'text-end':
                                                            isActions &&
                                                            !withActionsColumn,
                                                        [columnClassName]: columnClassName !== null,
                                                    },
                                                ])}
                                            >
                                                {FieldDisplayComponent !== null ? (
                                                    <FieldDisplayComponent
                                                        {...(isActions
                                                            ? { disabled: actionsDisabled, ...actionsProps }
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
                                                    [actionsClassName!]: actionsClassName !== null,
                                                },
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
                <Loading className="mt-3" withDelay>
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
