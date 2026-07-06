import classNames from 'classnames';
import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import omit from 'lodash-es/omit';
import { type ElementType, type ReactNode, type SyntheticEvent } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Item, Resource, TableColumn } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import {
    getColumnsWithFields,
    getComponentFromName,
    selectItems,
    toggleSelectedItem,
    unselectItems,
} from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';
import Table, { type TableColumn as ElementColumn } from '@panneau/element-table';

interface TableItem extends Item {
    rowClassName?: string | null;
    actionsDisabled?: boolean;
    selectionDisabled?: boolean;
    loading?: boolean;
}

type ColumnKind = 'selection' | 'id' | 'actions' | 'customActions' | 'field';

interface RenderColumn extends ElementColumn {
    _kind: ColumnKind;
}

interface TableListProps {
    resource?: Resource | null;
    items?: TableItem[] | null;
    columns?: TableColumn[] | null;
    actions?: (string | { id?: string })[] | null;
    withoutId?: boolean;
    withFadedId?: boolean;
    withoutActionsColumn?: boolean;
    actionsComponent?: ElementType | null;
    actionsProps?: Record<string, unknown> | null;
    actionsClassName?: string | null;
    displayPlaceholder?: ReactNode | string | null;
    selectable?: boolean;
    selectedItems?: Item[] | null;
    onSelectionChange?: ((items: Item[] | null) => void) | null;
    multipleSelection?: boolean;
    theme?: string | null;
    baseUrl?: string | null;
    query?: Record<string, unknown> | null;
    sortColumnParameter?: string;
    sortDirectionParameter?: string;
    onQueryChange?: ((query: Record<string, unknown>) => void) | null;
    emptyLabel?: ReactNode | null;
    striped?: boolean;
    stripedColumns?: boolean;
    loading?: boolean;
    loaded?: boolean;
    empty?: boolean;
    withoutLoading?: boolean;
    withoutEmpty?: boolean;
    className?: string | null;
    [key: string]: unknown;
}

const DEFAULT_ITEMS: TableItem[] = [];
const DEFAULT_COLUMNS: TableColumn[] = [];

function TableList({
    resource = null,
    items = DEFAULT_ITEMS,
    columns = DEFAULT_COLUMNS,
    withoutId = false,
    withFadedId = true,
    withoutActionsColumn = false,
    actionsComponent = null,
    actionsProps = null,
    actionsClassName = null,
    displayPlaceholder = null,
    selectable = false,
    selectedItems = null,
    onSelectionChange = null,
    multipleSelection = false,
    theme = null,
    baseUrl = null,
    query = null,
    sortColumnParameter = 'order',
    sortDirectionParameter = 'order_direction',
    onQueryChange = null,
    emptyLabel = null,
    striped = false,
    stripedColumns = false,
    loading = false,
    loaded = false,
    empty = false,
    withoutLoading = false,
    withoutEmpty = false,
    className = null,
}: TableListProps) {
    const displayComponents = useDisplaysComponents();

    const columnList =
        resource !== null
            ? getColumnsWithFields(resource, columns)
            : (columns || []).map((column) =>
                  isString(column) ? { id: column, field: column } : column,
              );

    const hasIdColumn =
        (columnList.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const actionColumn = (columnList || []).find((it) => it.id === 'actions') || null;
    const fieldColumns = withoutActionsColumn
        ? (columnList || []).filter((it) => it.id !== 'actions')
        : columnList;

    const Actions = actionsComponent || null;
    const withIdColumn = !withoutId && !hasIdColumn && !selectable;
    const withCustomActions = actionColumn === null && !withoutActionsColumn && Actions !== null;

    // Selection
    const isItemChecked = (item: TableItem) => {
        const { id = null, selectionDisabled = false } = item || {};
        return selectable && !selectionDisabled
            ? ((selectedItems || []).find(({ id: itemId = null }) => id === itemId) || null) !==
                  null
            : false;
    };

    const onSelectItem = (newItem: Item | null = null) => {
        const newSelectedItems = toggleSelectedItem(selectedItems, newItem, {
            multiple: multipleSelection,
        });
        if (newSelectedItems !== selectedItems && onSelectionChange !== null) {
            onSelectionChange(newSelectedItems);
        }
    };

    const onSelectPage = (pageIsSelected = false) => {
        const newSelectedItems = pageIsSelected
            ? unselectItems(selectedItems, items || [])
            : selectItems(selectedItems, items || []);
        if (newSelectedItems !== selectedItems && onSelectionChange !== null) {
            onSelectionChange(newSelectedItems);
        }
    };

    const selectRow = (e: SyntheticEvent, item: TableItem) => {
        const { selectionDisabled = false } = item || {};
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (
            onSelectionChange !== null &&
            !selectionDisabled &&
            tag !== 'button' &&
            tag !== 'a' &&
            tag !== 'i'
        ) {
            onSelectItem(item);
        }
    };

    const ids = (items || []).map(({ id = null }) => id).filter((id) => id !== null);
    const currentPageItems = (selectedItems || []).filter(
        ({ id = null }) => ids.indexOf(id) !== -1,
    );
    const pageSelected =
        multipleSelection &&
        currentPageItems.length > 0 &&
        currentPageItems.length === (items || []).length;

    // Columns
    const finalColumns: RenderColumn[] = [
        selectable
            ? {
                  id: '__selection',
                  _kind: 'selection',
                  columnClassName: 'text-nowrap',
                  label: multipleSelection ? (
                      <input
                          id="checkAll"
                          type="checkbox"
                          className="form-check-input me-2"
                          autoComplete="off"
                          checked={pageSelected}
                          onChange={() => onSelectPage(pageSelected)}
                      />
                  ) : (
                      <span className="form-check-label pe-2 text-muted" />
                  ),
              }
            : null,
        withIdColumn ? { id: '__id', _kind: 'id', label: '#' } : null,
        ...(fieldColumns || []).map((column) => {
            const { id: colId = null, component = null } = column || {};
            const isActions = colId === 'actions' || component === 'actions';
            return { ...column, _kind: isActions ? 'actions' : 'field' };
        }),
        withCustomActions
            ? {
                  id: '__actions',
                  _kind: 'customActions',
                  label: ' ',
                  columnClassName: classNames(['text-end', actionsClassName]),
              }
            : null,
    ].filter((it) => it !== null) as RenderColumn[];

    const renderCellContent = (item: TableItem, column: RenderColumn): ReactNode => {
        const {
            id = null,
            selectionDisabled = false,
            actionsDisabled = false,
            loading: itemLoading = false,
        } = item || {};
        const { _kind } = column;
        const checked = isItemChecked(item);

        if (_kind === 'selection') {
            return (
                <>
                    <input
                        id={`check-${id}`}
                        type="checkbox"
                        className="form-check-input"
                        autoComplete="off"
                        checked={checked}
                        disabled={selectionDisabled}
                        onChange={() => {
                            onSelectItem(item);
                        }}
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
                </>
            );
        }

        if (_kind === 'id') {
            return <span className={classNames([{ 'opacity-50': withFadedId }])}>{id}</span>;
        }

        if (_kind === 'customActions') {
            return Actions !== null ? (
                <Actions {...actionsProps} item={item} disabled={actionsDisabled} />
            ) : null;
        }

        const { id: colId = null, component = null, field = null, path = null } = column;
        const displayProps = omit(column, [
            'id',
            'component',
            'field',
            'path',
            'columnClassName',
            '_kind',
        ]);
        const isActions = colId === 'actions' || component === 'actions';

        const FieldDisplayComponent = getComponentFromName(
            isActions ? component || 'actions' : component || 'text',
            displayComponents,
            isActions && Actions !== null ? Actions : 'span',
        );

        let displayValue = null;
        if (path !== null) {
            displayValue = get(item, path, null);
        } else if (field !== null) {
            displayValue = get(item, isString(field) ? field : field?.name, null);
        }

        if (FieldDisplayComponent === null) {
            return displayPlaceholder;
        }

        return (
            <FieldDisplayComponent
                {...(isActions ? { disabled: actionsDisabled, ...actionsProps } : null)}
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
                item={item}
            />
        );
    };

    return (
        <div>
            {items !== null ? (
                <Table
                    columns={finalColumns}
                    theme={theme}
                    baseUrl={baseUrl}
                    query={query}
                    sortColumnParameter={sortColumnParameter}
                    sortDirectionParameter={sortDirectionParameter}
                    onQueryChange={onQueryChange}
                    striped={striped}
                    stripedColumns={stripedColumns}
                    className={className}
                >
                    {(items || []).map((item, rowIdx) => {
                        const { id = null, rowClassName = null } = item || {};
                        const checked = isItemChecked(item);
                        return (
                            <tr
                                key={`row-${id}-${rowIdx + 1}`}
                                className={classNames(['table-row', rowClassName])}
                                style={{ borderColor: checked ? 'var(--bs-primary)' : undefined }}
                                {...(onSelectionChange !== null
                                    ? {
                                          onClick: (e: SyntheticEvent) => selectRow(e, item),
                                          role: 'button',
                                      }
                                    : {})}
                            >
                                {finalColumns.map((column, colIdx) => {
                                    const {
                                        id: colId = null,
                                        component = null,
                                        field = null,
                                        path = null,
                                    } = column;
                                    const isActions =
                                        colId === 'actions' || component === 'actions';
                                    let displayValue = null;
                                    if (path !== null) {
                                        displayValue = get(item, path, null);
                                    } else if (field !== null) {
                                        displayValue = get(
                                            item,
                                            isString(field) ? field : field?.name,
                                            null,
                                        );
                                    }
                                    return (
                                        <td
                                            key={`col-${id}-${column.id ?? ''}-${colIdx + 1}`}
                                            className={classNames([
                                                'col-auto',
                                                column.columnClassName,
                                                {
                                                    'text-break':
                                                        (displayValue !== null &&
                                                            isString(displayValue) &&
                                                            displayValue.length >= 30) ||
                                                        isObject(displayValue),
                                                    'text-end': isActions && !withCustomActions,
                                                },
                                            ])}
                                        >
                                            {renderCellContent(item, column)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </Table>
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

export default TableList;
