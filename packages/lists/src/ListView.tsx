import { type ReactNode, useRef, useState } from 'react';

import type { List } from '@panneau/core';
import { usePlugins } from '@panneau/core';
import type { Action, Field, Filter } from '@panneau/protocol';
import { Alert, Button, Checkbox, usePanneauIntl, useToast } from '@panneau/ui';

import { ListSkeleton } from './ListSkeleton';
import styles from './ListView.module.css';
import { ActionButton } from './actions/ActionButton';
import { ConfirmDialog, type ConfirmPreview, needsConfirmation } from './actions/ConfirmDialog';
import { RowActions } from './actions/RowActions';
import {
    type ListActions,
    getActionHref,
    groupListActions,
    hasScope,
    isAllowedOn,
} from './actions/actions';
import type { ActionIcons } from './actions/icons';
import { cx } from './cx';
import { FilterChips, FilterControls, useFilterLabels } from './filters/Filters';
import { builtInLayouts } from './layouts/builtIn';
import { messages } from './messages';
import { countSelected, getPageSelection, isItemSelected } from './selection';
import { LayoutSwitch } from './toolbar/LayoutSwitch';
import { Pagination } from './toolbar/Pagination';
import { SearchField } from './toolbar/SearchField';
import { SortSelect } from './toolbar/SortSelect';
import type {
    DisplayEntry,
    FilterEntry,
    ListActionEvent,
    ListActionHandler,
    ListActionPreviewer,
    ListColumn,
    ListItem,
    ListLayoutEntry,
} from './types';
import { useListState } from './useListState';
import { useRenderValue } from './useRenderValue';
import { getColumnValue, toText } from './values';

export interface ListViewProps {
    /** The list state of `@panneau/core` (`useList()`): query and selection. */
    list: List;
    /**
     * The items of the current page. `undefined` while they load for the first time: the list
     * draws a skeleton of its rows, from its columns and its page size.
     */
    items: readonly ListItem[] | undefined;
    columns: readonly ListColumn[];
    /**
     * How many items match the query, on every page (`meta.total`). With it, the list shows
     * pagination and offers to select every matching item. Without it, `items` is the whole list.
     */
    total?: number | undefined;
    /** Shows that items are loading. Items already shown stay, dimmed. */
    isLoading?: boolean;
    /** An error while loading: an alert with a retry replaces the items. */
    error?: Error | null;
    onRetry?: () => void;
    /** Filter controls, with chips for the active filters. */
    filters?: readonly Filter[];
    /** Fields of the items, for the labels and options of filters that are not columns. */
    fields?: readonly Field[];
    /** Shows a search field (`q`). */
    search?: boolean;
    /** Layouts to choose from, the first one being the default. Defaults to `['table']`. */
    layouts?: readonly string[];
    /** The layout, controlled. */
    layout?: string;
    onLayoutChange?: (layout: string) => void;
    /** Page sizes to choose from. */
    perPageOptions?: readonly number[];
    /** Shows checkboxes. Defaults to whether there are selection actions. */
    selectable?: boolean;
    /**
     * Actions: a list (placed by their `placement`, or by scope), or grouped by placement as
     * `resolveList()` does. Those the user can't run (`abilities.run`) are hidden.
     */
    actions?: ListActions;
    /** Runs an action, after its confirmation. */
    onAction?: ListActionHandler;
    /**
     * Asks the backend how many items of a query selection ("Select all N items") an action will
     * skip, before the confirmation: the list only knows the abilities of the current page. Only
     * for actions with `dryRun`. `useActionPreview()` of `@panneau/actions` is one.
     */
    previewAction?: ListActionPreviewer;
    /**
     * Icons of actions by action id (`{ archive: Archive }`), for actions written in code. They
     * win over the Lucide icon an action names (`"icon": "archive"`).
     */
    actionIcons?: ActionIcons;
    /** The field that titles items, for their label (`itemTitle` of the resource). */
    itemTitle?: string;
    /** The label of an item, for checkboxes and actions. Defaults to its title, then its id. */
    getItemLabel?: (item: ListItem) => string;
    /** A link to an item, on its title. */
    getItemHref?: (item: ListItem) => string | null;
    /**
     * The item shown next to the list, such as in a panel of its details: its row is marked, and
     * the link of its title is the current page.
     */
    currentItemId?: string | null;
    /** Displays by name, over the built-in ones and those of the plugins. */
    displays?: Readonly<Record<string, DisplayEntry>>;
    /** Layouts by id, over the built-in ones and those of the plugins. */
    layoutComponents?: Readonly<Record<string, ListLayoutEntry>>;
    /** Filter controls by filter type, over the built-in ones. */
    filterControls?: Readonly<Record<string, FilterEntry>>;
    /** Content at the end of the toolbar, such as a button to create an item. */
    toolbar?: ReactNode;
    /** Shown when the list has no items, without filters or search. */
    emptyMessage?: ReactNode;
    /** Accessible name of the list. Defaults to "Items". */
    'aria-label'?: string;
    className?: string;
}

function keyOf(action: Action, item?: ListItem): string {
    return item !== undefined ? `${action.id}\u0000${item.id}` : action.id;
}

/**
 * Renders the list state of `@panneau/core`: the items of the current page in a layout (table or
 * cards), with sorting, search, filters and their chips, pagination, selection and actions. It
 * fetches nothing: the caller gives the items of the list's query and their total.
 */
export function ListView({
    list,
    items,
    columns,
    total,
    isLoading = false,
    error = null,
    onRetry,
    filters = [],
    fields = [],
    search = false,
    layouts: layoutsProp = ['table'],
    layout: controlledLayout,
    onLayoutChange,
    perPageOptions,
    selectable: selectableProp,
    actions: actionsProp,
    onAction,
    previewAction,
    actionIcons,
    itemTitle,
    getItemLabel: getItemLabelProp,
    getItemHref,
    currentItemId = null,
    displays,
    layoutComponents,
    filterControls,
    toolbar,
    emptyMessage,
    'aria-label': ariaLabel,
    className,
}: ListViewProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const plugins = usePlugins();
    const { query, selection } = useListState(list);
    const filterLabels = useFilterLabels();
    const [uncontrolledLayout, setLayout] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<ListActionEvent | null>(null);
    const [preview, setPreview] = useState<ConfirmPreview | null>(null);
    // The confirmation a dry run belongs to: a later one, or a cancel, discards its answer.
    const confirmation = useRef(0);
    const [pending, setPending] = useState<string | null>(null);

    const label = ariaLabel ?? intl.formatMessage(messages.list);
    const pageItems = items ?? [];
    const count = total ?? pageItems.length;
    const sort = query.sort ?? [];
    const filterValues = query.filter ?? {};
    const hasQuery = Object.keys(filterValues).length > 0 || (query.q ?? '') !== '';

    const allLayouts: Record<string, ListLayoutEntry> = {
        ...builtInLayouts,
        ...(Object.fromEntries(plugins.listLayouts) as Record<string, ListLayoutEntry>),
        ...layoutComponents,
    };
    // Layouts without a component (a plugin's that isn't installed) are left out.
    const available = layoutsProp.filter((id) => allLayouts[id] !== undefined);
    const layouts = available.length > 0 ? available : ['table'];
    const layout = controlledLayout ?? uncontrolledLayout ?? layouts[0] ?? 'table';
    const Layout = allLayouts[layout] ?? builtInLayouts.table;

    const grouped = groupListActions(actionsProp);
    const rowActions = grouped.row.filter((action) => hasScope(action, 'item'));
    const rowMenu = grouped.menu.filter((action) => hasScope(action, 'item'));
    // Actions placed in the menu also apply to selections, from the toolbar (once each).
    const toolbarActions = [...grouped.toolbar, ...grouped.menu].filter(
        (action, index, all) =>
            (hasScope(action, 'selection') || hasScope(action, 'resource')) &&
            all.findIndex((candidate) => candidate.id === action.id) === index,
    );
    const selectionActions = toolbarActions.filter((action) => hasScope(action, 'selection'));
    const resourceActions = toolbarActions.filter((action) => hasScope(action, 'resource'));
    const selectable = selectableProp ?? selectionActions.length > 0;

    const selectedCount = selectable ? countSelected(selection, count) : 0;
    const selectedItems = pageItems.filter((item) => isItemSelected(selection, item.id));
    const pageSelection = getPageSelection(selection, pageItems);

    const getItemLabel = (item: ListItem): string => {
        if (getItemLabelProp !== undefined) {
            return getItemLabelProp(item);
        }
        const titleColumn =
            columns.find((column) => column.id === itemTitle) ??
            (itemTitle === undefined ? columns[0] : undefined);
        const title =
            titleColumn !== undefined
                ? toText(getColumnValue(item, titleColumn, intl.locale), intl.locale)
                : itemTitle !== undefined
                  ? toText(item[itemTitle], intl.locale)
                  : '';
        return title !== '' ? title : item.id;
    };

    const renderValue = useRenderValue(displays);

    const closeConfirmation = () => {
        confirmation.current += 1;
        setConfirming(null);
        setPreview(null);
    };

    const execute = async (event: ListActionEvent) => {
        closeConfirmation();
        setPending(keyOf(event.action, event.item));
        // A promise chain rather than `try`, which the React Compiler only handles in part.
        await Promise.resolve()
            .then(() => onAction?.(event))
            .then((outcome) => {
                // `false`: the action didn't run (its parameters were cancelled).
                if (event.scope === 'selection' && outcome !== false) {
                    list.clearSelection();
                }
            })
            .catch((caught: unknown) => {
                toasts.show({
                    title: intl.formatMessage(messages.actionFailed, {
                        action: event.action.label,
                    }),
                    ...(caught instanceof Error && caught.message !== ''
                        ? { description: caught.message }
                        : {}),
                    tone: 'danger',
                });
            });
        setPending(null);
    };

    const run = (event: ListActionEvent) => {
        const { action, selection } = event;
        if (
            previewAction !== undefined &&
            action.dryRun === true &&
            selection !== undefined &&
            'query' in selection
        ) {
            // Every item matching a query: only the backend knows how many it would skip.
            const current = ++confirmation.current;
            const asks = action.confirm !== undefined && action.confirm !== false;
            setConfirming(event);
            setPreview({ status: 'loading' });
            previewAction(event).then(
                (result) => {
                    if (confirmation.current !== current) {
                        return;
                    }
                    const skipped = result?.skipped ?? event.skipped.length;
                    if (skipped === 0 && !asks) {
                        void execute(event);
                    } else {
                        setPreview(result !== null ? { status: 'done', ...result } : null);
                    }
                },
                () => {
                    // Without an answer, the list confirms with what it knows.
                    if (confirmation.current !== current) {
                        return;
                    }
                    if (needsConfirmation(event)) {
                        setPreview(null);
                    } else {
                        void execute(event);
                    }
                },
            );
            return;
        }
        if (needsConfirmation(event)) {
            setConfirming(event);
        } else {
            void execute(event);
        }
    };

    const runOnItem = (action: Action, item: ListItem) =>
        run({ action, scope: 'item', item, count: 1, skipped: [] });

    const runOnSelection = (action: Action) => {
        const selected = list.getSelection();
        if (selected === null) {
            return;
        }
        run({
            action,
            scope: 'selection',
            selection: selected,
            count: selectedCount,
            skipped: selectedItems.filter((item) => !isAllowedOn(action, item)),
        });
    };

    const runOnResource = (action: Action) =>
        run({ action, scope: 'resource', count: count, skipped: [] });

    const renderActions = (item: ListItem): ReactNode => {
        const allowed = rowActions.filter((action) => isAllowedOn(action, item));
        const menu = rowMenu.filter((action) => isAllowedOn(action, item));
        if (allowed.length === 0 && menu.length === 0) {
            return null;
        }
        const running =
            pending?.endsWith(`\u0000${item.id}`) === true ? pending.split('\u0000')[0] : null;
        return (
            <RowActions
                item={item}
                itemLabel={getItemLabel(item)}
                actions={allowed}
                menu={menu}
                pending={running ?? null}
                onRun={(action) => runOnItem(action, item)}
                icons={actionIcons}
            />
        );
    };

    const pageCheckbox = (
        <Checkbox
            aria-label={intl.formatMessage(messages.selectPage)}
            isSelected={pageSelection === 'all'}
            isIndeterminate={pageSelection === 'some'}
            isDisabled={pageItems.length === 0}
            onChange={() => {
                const ids = pageItems.map((item) => item.id);
                if (pageSelection === 'all') {
                    list.deselect(ids);
                } else {
                    list.select(ids);
                }
            }}
        />
    );

    const sortable = columns.some((column) => column.sortable === true);
    const showToolbar =
        search ||
        filters.length > 0 ||
        sortable ||
        layouts.length > 1 ||
        resourceActions.length > 0 ||
        toolbar !== undefined;

    function clearFilters() {
        Object.keys(filterValues).forEach((id) => list.setFilter(id, undefined));
        if ((query.q ?? '') !== '') {
            list.setSearch('');
        }
    }

    const body = (() => {
        if (error !== null) {
            return (
                <Alert
                    tone="danger"
                    title={intl.formatMessage(messages.loadFailed)}
                    actions={
                        onRetry !== undefined ? (
                            <Button size="sm" onPress={onRetry}>
                                {intl.formatMessage(messages.retry)}
                            </Button>
                        ) : undefined
                    }
                >
                    {error.message}
                </Alert>
            );
        }
        if (items === undefined) {
            return (
                <ListSkeleton
                    Layout={Layout}
                    columns={columns}
                    perPage={query.perPage}
                    sort={sort}
                    label={label}
                />
            );
        }
        if (pageItems.length === 0) {
            return (
                <div className={styles.state}>
                    <p>
                        {hasQuery
                            ? intl.formatMessage(messages.noResults)
                            : (emptyMessage ?? intl.formatMessage(messages.empty))}
                    </p>
                    {hasQuery ? (
                        <Button size="sm" onPress={() => clearFilters()}>
                            {intl.formatMessage(messages.clearFilters)}
                        </Button>
                    ) : null}
                </div>
            );
        }
        return (
            <Layout
                items={pageItems}
                columns={columns}
                renderValue={renderValue}
                getItemLabel={getItemLabel}
                getItemHref={getItemHref}
                isCurrent={(item) => item.id === currentItemId}
                selectable={selectable}
                isSelected={(item) => isItemSelected(selection, item.id)}
                onToggle={(item) => list.toggle(item.id)}
                renderActions={renderActions}
                sort={sort}
                onSort={(column) => list.toggleSort(column.id)}
                label={label}
                pageSelection={pageCheckbox}
            />
        );
    })();

    return (
        <div className={cx(styles.list, className)}>
            {showToolbar ? (
                <div className={styles.toolbar}>
                    <div className={styles.toolbarStart}>
                        {search ? (
                            <SearchField
                                value={query.q ?? ''}
                                onChange={(q) => list.setSearch(q)}
                            />
                        ) : null}
                        {filters.length > 0 ? (
                            <FilterControls
                                filters={filters}
                                values={filterValues}
                                onChange={(id, value) => list.setFilter(id, value)}
                                onLabel={filterLabels.remember}
                                controls={filterControls}
                                columns={columns}
                                fields={fields}
                                labels={filterLabels.labels}
                            />
                        ) : null}
                    </div>
                    <div className={styles.toolbarEnd}>
                        {sortable ? (
                            <div className={layout === 'table' ? styles.tableSort : undefined}>
                                <SortSelect
                                    columns={columns}
                                    sort={sort}
                                    onChange={(next) => list.setSort(next)}
                                />
                            </div>
                        ) : null}
                        {layouts.length > 1 ? (
                            <LayoutSwitch
                                layouts={layouts}
                                value={layout}
                                onChange={(next) => {
                                    setLayout(next);
                                    onLayoutChange?.(next);
                                }}
                            />
                        ) : null}
                        {resourceActions
                            .filter(
                                (action) => selectedCount === 0 || !hasScope(action, 'selection'),
                            )
                            .map((action) => (
                                <ActionButton
                                    key={action.id}
                                    action={action}
                                    icons={actionIcons}
                                    size="md"
                                    href={getActionHref(action)}
                                    isPending={pending === keyOf(action)}
                                    onPress={() => runOnResource(action)}
                                />
                            ))}
                        {toolbar}
                    </div>
                </div>
            ) : null}
            <FilterChips
                filters={filters}
                values={filterValues}
                q={query.q}
                onRemove={(id) => list.setFilter(id, undefined)}
                onClearSearch={() => list.setSearch('')}
                onClear={clearFilters}
                columns={columns}
                fields={fields}
                labels={filterLabels.labels}
            />
            {selectedCount > 0 ? (
                <div className={styles.selection}>
                    <span className={styles.selectionCount} role="status">
                        {selection.mode === 'all'
                            ? intl.formatMessage(messages.allMatchingSelected, {
                                  total: selectedCount,
                              })
                            : intl.formatMessage(messages.selectedCount, { count: selectedCount })}
                    </span>
                    {selection.mode === 'ids' &&
                    pageSelection === 'all' &&
                    count > pageItems.length ? (
                        <Button size="sm" variant="ghost" onPress={() => list.selectAllMatching()}>
                            {intl.formatMessage(messages.selectAllMatching, { total: count })}
                        </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onPress={() => list.clearSelection()}>
                        {intl.formatMessage(messages.clearSelection)}
                    </Button>
                    {selectionActions.length > 0 ? (
                        <div className={styles.selectionActions}>
                            {selectionActions.map((action) => {
                                const skipped = selectedItems.filter(
                                    (item) => !isAllowedOn(action, item),
                                ).length;
                                return (
                                    <ActionButton
                                        key={action.id}
                                        action={action}
                                        icons={actionIcons}
                                        size="md"
                                        href={null}
                                        isPending={pending === keyOf(action)}
                                        isDisabled={
                                            (pending !== null && pending !== keyOf(action)) ||
                                            skipped >= selectedCount
                                        }
                                        onPress={() => runOnSelection(action)}
                                    />
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ) : null}
            <div className={styles.body} aria-busy={isLoading && items !== undefined}>
                {body}
            </div>
            {total !== undefined && error === null && total > 0 ? (
                <Pagination
                    page={query.page ?? 1}
                    perPage={query.perPage ?? pageItems.length}
                    total={total}
                    onPageChange={(page) => list.setPage(page)}
                    perPageOptions={perPageOptions}
                    onPerPageChange={(perPage) => list.setPerPage(perPage)}
                />
            ) : null}
            <ConfirmDialog
                event={confirming}
                preview={preview}
                onConfirm={(event) => void execute(event)}
                onCancel={closeConfirmation}
            />
        </div>
    );
}
