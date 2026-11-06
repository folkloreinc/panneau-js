import { ListChecks } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import type { List, ResolvedCalendar } from '@panneau/core';
import {
    asksConfirmation,
    currentMonth,
    formatRuleFailure,
    selectItemActions,
    usePlugins,
} from '@panneau/core';
import { getFileKind } from '@panneau/fields';
import { getActionLabel } from '@panneau/intl';
import type { Action, Field, Filter, RuleFailure } from '@panneau/protocol';
import { Alert, Button, Checkbox, usePanneauIntl, useToast } from '@panneau/ui';

import { ListSkeleton } from './ListSkeleton';
import styles from './ListView.module.css';
import { ActionButton } from './actions/ActionButton';
import { ConfirmDialog, type ConfirmPreview, needsConfirmation } from './actions/ConfirmDialog';
import { RowActions, orderRowActions } from './actions/RowActions';
import {
    type ListActions,
    getActionHref,
    groupListActions,
    hasScope,
    isAllowedOn,
} from './actions/actions';
import type { ActionIcons } from './actions/icons';
import { getShownColumns } from './columns';
import { cx } from './cx';
import { FilterChips, FilterControls, useFilterLabels } from './filters/Filters';
import { getImageUrl } from './images';
import { InlineCell } from './inline/InlineCell';
import { getInlineField } from './inline/editable';
import { builtInLayouts } from './layouts/builtIn';
import { getCalendarTimeZone } from './layouts/calendarDays';
import { messages } from './messages';
import { countSelected, getPageSelection, isItemSelected } from './selection';
import { ColumnMenu } from './toolbar/ColumnMenu';
import { LayoutSwitch } from './toolbar/LayoutSwitch';
import { CursorPagination, Pagination } from './toolbar/Pagination';
import { SearchField } from './toolbar/SearchField';
import { SortSelect } from './toolbar/SortSelect';
import type {
    DisplayEntry,
    FilterEntry,
    ListActionEvent,
    ListActionHandler,
    ListActionPreviewer,
    ListColumn,
    ListInlineEditHandler,
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
    /**
     * Every column of the list. Those with `hidden` are shown when the user chooses them, from
     * the "Columns" menu, and the view of the list state says which ones are shown (decision 0042).
     */
    columns: readonly ListColumn[];
    /** Offers the user to show, hide and order the columns. Defaults to `true`. */
    columnChoice?: boolean;
    /**
     * How many items match the query, on every page (`meta.total`). With it, the list shows
     * pagination and offers to select every matching item. Without it, `items` is the whole list.
     */
    total?: number | undefined;
    /**
     * The cursors of the page, for a list paged with cursors (`nextCursor` and `previousCursor`
     * of its `meta`): the list then has buttons to the previous and next pages, without page
     * numbers or a total, and doesn't offer to select every matching item.
     */
    cursors?: { next: string | null; previous?: string | null | undefined } | undefined;
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
    /** The layout, controlled. Without it, the layout is the view of the list state. */
    layout?: string;
    onLayoutChange?: (layout: string) => void;
    /** Page sizes to choose from. */
    perPageOptions?: readonly number[];
    /**
     * Whether items can be selected: a "Select" button in the toolbar shows their checkboxes.
     * Defaults to whether there are selection actions.
     */
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
    /**
     * The field shown as the image of items (`itemImage` of the resource, or `media` in a media
     * library): a media reference, a media, a file or a URL. The `gallery` layout needs it
     * (decision 0044), and the table starts each title with its thumbnail (decision 0061).
     */
    itemImage?: string | undefined;
    /**
     * The calendar of the list (`calendar` of `resolveList()`), for its `calendar` layout. The list
     * state asks for its month when it is given the same calendar.
     */
    calendar?: Pick<ResolvedCalendar, 'field' | 'filter'> | null | undefined;
    /**
     * The id of the main action of rows, which keeps its label while the others show their icons
     * (decision 0060): the one the title of an item opens, `edit` for a resource that opens its
     * items in their form. Defaults to `show` when rows have it, else `edit`.
     */
    primaryAction?: string | null;
    /** The label of an item, for checkboxes and actions. Defaults to its title, then its id. */
    getItemLabel?: (item: ListItem) => string;
    /** A link to an item, on its title. */
    getItemHref?: (item: ListItem) => string | null;
    /**
     * The link of a built-in `show` or `edit` action without a `url` or a `route` (decision 0040),
     * which the caller resolves to its own routes. Without it, or when it answers `null`, the list
     * leaves those links out.
     */
    getLinkHref?: (action: Action, item: ListItem) => string | null;
    /**
     * The item shown next to the list, such as in a panel of its details: its row is marked, and
     * the link of its title is the current page.
     */
    currentItemId?: string | null;
    /**
     * An item that just appeared, such as one just created (decision 0066): once it is among the
     * items, it is scrolled into view, and its background shows it for a moment, then fades.
     */
    highlightedItemId?: string | null;
    /** Displays by name, over the built-in ones and those of the plugins. */
    displays?: Readonly<Record<string, DisplayEntry>>;
    /** Layouts by id, over the built-in ones and those of the plugins. */
    layoutComponents?: Readonly<Record<string, ListLayoutEntry>>;
    /** Filter controls by filter type, over the built-in ones. */
    filterControls?: Readonly<Record<string, FilterEntry>>;
    /**
     * The fields that columns edit in place (`inlineEdit` of the list), on the items that can be
     * updated, in the table (decision 0043). Needs `onInlineEdit`.
     */
    inlineEdit?: readonly string[];
    /** Saves a field edited in place, and resolves with the updated item. */
    onInlineEdit?: ListInlineEditHandler;
    /**
     * The message of a portable rule that a value edited in place fails. Defaults to
     * `formatRuleFailure()` of `@panneau/core`, in English; `useFormatRuleFailure()` of
     * `@panneau/forms` translates them.
     */
    formatError?: (failure: RuleFailure, path: string) => string;
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
    columns: allColumns,
    columnChoice = true,
    total,
    cursors,
    isLoading = false,
    error = null,
    onRetry,
    filters: filtersProp = [],
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
    itemImage,
    calendar = null,
    primaryAction: primaryActionProp,
    getItemLabel: getItemLabelProp,
    getItemHref,
    getLinkHref,
    currentItemId = null,
    highlightedItemId = null,
    displays,
    layoutComponents,
    filterControls,
    inlineEdit = [],
    onInlineEdit,
    formatError = formatRuleFailure,
    toolbar,
    emptyMessage,
    'aria-label': ariaLabel,
    className,
}: ListViewProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const plugins = usePlugins();
    const { query, view, selection } = useListState(list);
    const filterLabels = useFilterLabels();
    const [confirming, setConfirming] = useState<ListActionEvent | null>(null);
    const [preview, setPreview] = useState<ConfirmPreview | null>(null);
    // The confirmation a dry run belongs to: a later one, or a cancel, discards its answer.
    const confirmation = useRef(0);
    const root = useRef<HTMLDivElement>(null);
    const [pending, setPending] = useState<string | null>(null);
    // Checkboxes show once the user asks for them ("Select"), or while items are selected: until
    // then, rows read without a column of empty space before them.
    const [selecting, setSelecting] = useState(false);

    // Items saved in place, over the item the caller gave, until it gives another one.
    const [saved, setSaved] = useState<
        Readonly<Record<string, { base: ListItem; item: ListItem }>>
    >({});
    const showItem = (item: ListItem) => {
        const base = items?.find((candidate) => candidate.id === item.id);
        if (base !== undefined) {
            setSaved((current) => ({ ...current, [item.id]: { base, item } }));
        }
    };

    const label = ariaLabel ?? intl.formatMessage(messages.list);
    const pageItems = (items ?? []).map((item) =>
        saved[item.id]?.base === item ? (saved[item.id]?.item ?? item) : item,
    );
    const count = total ?? pageItems.length;
    const sort = query.sort ?? [];

    const allLayouts: Record<string, ListLayoutEntry> = {
        ...builtInLayouts,
        ...(Object.fromEntries(plugins.listLayouts) as Record<string, ListLayoutEntry>),
        ...layoutComponents,
    };
    // Layouts without a component (a plugin's that isn't installed) are left out, and so are the
    // gallery without images and the calendar without a calendar.
    const available = layoutsProp.filter(
        (id) =>
            allLayouts[id] !== undefined &&
            (id !== 'gallery' || itemImage !== undefined) &&
            (id !== 'calendar' || calendar !== null),
    );
    const layouts = available.length > 0 ? available : ['table'];
    const chosenLayout =
        view.layout !== undefined && layouts.includes(view.layout) ? view.layout : undefined;
    const layout = controlledLayout ?? chosenLayout ?? layouts[0] ?? 'table';
    const columns = getShownColumns(allColumns, view.columns);
    const Layout = allLayouts[layout] ?? builtInLayouts.table;
    const inCalendar = layout === 'calendar' && calendar !== null;
    // The calendar asks for its month through its filter, which it sets itself.
    const filters = inCalendar
        ? filtersProp.filter((filter) => filter.id !== calendar.filter)
        : filtersProp;
    const filterValues = Object.fromEntries(
        Object.entries(query.filter ?? {}).filter(
            ([id]) => !(inCalendar && id === calendar.filter),
        ),
    );
    const hasQuery = Object.keys(filterValues).length > 0 || (query.q ?? '') !== '';

    const grouped = groupListActions(actionsProp);
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
    const showsChecks = selectable && (selecting || selectedCount > 0);
    const endSelection = () => {
        setSelecting(false);
        list.clearSelection();
    };

    const getItemLabel = (item: ListItem): string => {
        if (getItemLabelProp !== undefined) {
            return getItemLabelProp(item);
        }
        const titleColumn =
            allColumns.find((column) => column.id === itemTitle) ??
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

    const renderCell = (item: ListItem, column: ListColumn, content: ReactNode): ReactNode => {
        const field = onInlineEdit !== undefined ? getInlineField(column, item, inlineEdit) : null;
        if (field === null || onInlineEdit === undefined) {
            return content;
        }
        return (
            <InlineCell
                key={`${item.id}\u0000${column.id}`}
                item={item}
                field={field}
                itemLabel={getItemLabel(item)}
                getItemLabel={getItemLabel}
                renderValue={(current) => renderValue(current, column)}
                onSave={(base, value) => onInlineEdit({ item: base, field, value })}
                onItem={showItem}
                formatError={(failure) => formatError(failure, field.name)}
            >
                {content}
            </InlineCell>
        );
    };

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
                    endSelection();
                }
            })
            .catch((caught: unknown) => {
                toasts.show({
                    title: intl.formatMessage(messages.actionFailed, {
                        action: getActionLabel(event.action, intl),
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
                    // An undoable action asks above the limit of the undo, counted without the
                    // items it skips (decision 0063).
                    if (
                        skipped === 0 &&
                        !asks &&
                        !asksConfirmation(action, Math.max(0, event.count - skipped))
                    ) {
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

    // The actions of the rows of the page, in order: each row keeps the place of those it doesn't
    // have, so they line up (decision 0060).
    const pageActions = pageItems.map((item) => [
        ...selectItemActions(grouped.row, item, 'row', { getLinkHref }),
        ...selectItemActions(grouped.menu, item, 'menu', { getLinkHref }),
    ]);
    const firstOf = (action: Action) =>
        pageActions.flat().find((entry) => entry.action.id === action.id) ?? [];
    const slots = orderRowActions(grouped.row.flatMap(firstOf), grouped.menu.flatMap(firstOf));
    const primaryAction =
        primaryActionProp !== undefined
            ? primaryActionProp
            : (['show', 'edit'].find((id) => slots.some((slot) => slot.action.id === id)) ?? null);

    // The actions of a row and of its menu, as everywhere else an item shows its actions
    const renderActions = (item: ListItem): ReactNode => {
        const allowed = selectItemActions(grouped.row, item, 'row', { getLinkHref });
        const menu = selectItemActions(grouped.menu, item, 'menu', { getLinkHref });
        if (allowed.length === 0 && menu.length === 0) {
            return null;
        }
        const running =
            pending?.endsWith(`\u0000${item.id}`) === true ? pending.split('\u0000')[0] : null;
        return (
            <RowActions
                itemLabel={getItemLabel(item)}
                actions={allowed}
                menu={menu}
                pending={running ?? null}
                onRun={(action) => runOnItem(action, item)}
                icons={actionIcons}
                slots={slots}
                primary={primaryAction}
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

    const sortable = allColumns.some((column) => column.sortable === true);
    const choosesColumns = columnChoice && allColumns.length > 1;
    const showToolbar =
        search ||
        filters.length > 0 ||
        sortable ||
        choosesColumns ||
        layouts.length > 1 ||
        resourceActions.length > 0 ||
        selectable ||
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
                    withImages={itemImage !== undefined}
                />
            );
        }
        // An empty month is still a calendar: it goes to the others.
        if (pageItems.length === 0 && !inCalendar) {
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
                getItemImage={
                    itemImage !== undefined ? (item) => getImageUrl(item[itemImage]) : undefined
                }
                getItemFileKind={
                    itemImage !== undefined ? (item) => getFileKind(item[itemImage]) : undefined
                }
                calendar={
                    inCalendar
                        ? {
                              field: calendar.field,
                              timeZone: getCalendarTimeZone(
                                  [...fields, ...allColumns.map((column) => column.field)].find(
                                      (field) => field?.name === calendar.field,
                                  ),
                              ),
                              month: view.month ?? currentMonth(),
                              onMonthChange: (month) => list.setMonth(month),
                              more:
                                  total !== undefined && total > pageItems.length
                                      ? { total }
                                      : cursors !== undefined && cursors.next !== null
                                        ? { total: null }
                                        : null,
                          }
                        : undefined
                }
                isCurrent={(item) => item.id === currentItemId}
                isHighlighted={(item) => item.id === highlightedItemId}
                selectable={showsChecks}
                isSelected={(item) => isItemSelected(selection, item.id)}
                onToggle={(item) => list.toggle(item.id)}
                renderActions={renderActions}
                sort={sort}
                onSort={(column) => list.toggleSort(column.id)}
                label={label}
                pageSelection={pageCheckbox}
                renderCell={renderCell}
            />
        );
    })();

    // The highlighted item comes into view once the list shows it
    const highlightShown =
        highlightedItemId !== null && pageItems.some((item) => item.id === highlightedItemId);
    useEffect(() => {
        if (!highlightShown) {
            return;
        }
        const element = root.current?.querySelector<HTMLElement>('[data-highlighted]');
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        element?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }, [highlightShown, highlightedItemId]);

    return (
        <div ref={root} className={cx(styles.list, className)}>
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
                                columns={allColumns}
                                fields={fields}
                                labels={filterLabels.labels}
                            />
                        ) : null}
                    </div>
                    <div className={styles.toolbarEnd}>
                        {sortable ? (
                            <div className={layout === 'table' ? styles.tableSort : undefined}>
                                <SortSelect
                                    columns={allColumns}
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
                                    if (controlledLayout === undefined) {
                                        list.setLayout(next);
                                    }
                                    onLayoutChange?.(next);
                                }}
                            />
                        ) : null}
                        {choosesColumns ? (
                            <ColumnMenu
                                columns={allColumns}
                                shown={columns}
                                onChange={(ids) => list.setColumns(ids)}
                                onReset={
                                    view.columns !== undefined ? () => list.resetColumns() : null
                                }
                            />
                        ) : null}
                        {selectable ? (
                            <Button
                                icon={ListChecks}
                                appearance={showsChecks ? 'solid' : 'outline'}
                                onPress={() => (showsChecks ? endSelection() : setSelecting(true))}
                            >
                                {intl.formatMessage(
                                    showsChecks ? messages.endSelection : messages.startSelection,
                                )}
                            </Button>
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
                columns={allColumns}
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
            {inCalendar ? null : cursors !== undefined && error === null ? (
                <CursorPagination
                    perPage={query.perPage ?? pageItems.length}
                    hasPrevious={query.cursor !== undefined}
                    hasNext={cursors.next !== null}
                    onPrevious={() => list.previousPage(cursors.previous)}
                    onNext={() => {
                        if (cursors.next !== null) {
                            list.nextPage(cursors.next);
                        }
                    }}
                    perPageOptions={perPageOptions}
                    onPerPageChange={(perPage) => list.setPerPage(perPage)}
                />
            ) : total !== undefined && error === null && total > 0 ? (
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
