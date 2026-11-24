import { Inbox, Plus, SearchX } from 'lucide-react';
import {
    type CSSProperties,
    type ReactNode,
    isValidElement,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import type { List, ResolvedCalendar } from '@panneau/core';
import {
    asksConfirmation,
    currentMonth,
    fillActionUrl,
    formatRuleFailure,
    selectItemActions,
    usePlugins,
} from '@panneau/core';
import { getFileKind } from '@panneau/fields';
import { getActionLabel } from '@panneau/intl';
import type { Action, Field, Filter, RuleFailure } from '@panneau/protocol';
import {
    Alert,
    Button,
    Checkbox,
    EmptyState,
    LinkButton,
    prefersReducedMotion,
    usePanneauIntl,
    useToast,
} from '@panneau/ui';

import { ListSkeleton } from './ListSkeleton';
import styles from './ListView.module.css';
import { ActionButton } from './actions/ActionButton';
import { ConfirmDialog, type ConfirmPreview, needsConfirmation } from './actions/ConfirmDialog';
import { RowActions, orderRowActions } from './actions/RowActions';
import { type ListActions, groupListActions, hasScope, isAllowedOn } from './actions/actions';
import type { ActionIcons } from './actions/icons';
import { getShownColumns } from './columns';
import { cx } from './cx';
import { FilterBar } from './filters/FilterBar';
import { FilterChips, useFilterLabels } from './filters/Filters';
import { moveFocusFromLeaving } from './focus';
import { getImageUrl } from './images';
import { InlineCell } from './inline/InlineCell';
import { getInlineField } from './inline/editable';
import { builtInLayouts } from './layouts/builtIn';
import { getCalendarTimeZone } from './layouts/calendarDays';
import { getLayoutComponents, resolveListLayout } from './layouts/resolve';
import { useLeavingItems, withLeavingItems } from './leaving';
import { messages } from './messages';
import { countSelected, getPageSelection, isItemSelected } from './selection';
import { getItemStatus } from './status';
import { CursorPagination, Pagination } from './toolbar/Pagination';
import { SearchField } from './toolbar/SearchField';
import { ToolbarControls } from './toolbar/ToolbarControls';
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
import { useNarrow } from './useNarrow';
import { useRenderValue } from './useRenderValue';
import { getColumnValue, toText } from './values';

/** The actions of a `ListView`. */
export interface ListViewActions {
    /**
     * The actions: a list (placed by their `placement`, or by scope), or grouped by placement as
     * `resolveList()` does. Those the user can't run (`abilities.run`) are hidden.
     */
    available?: ListActions | undefined;
    /** Runs an action, after its confirmation. */
    onRun?: ListActionHandler | undefined;
    /**
     * Asks the backend how many items of a query selection ("Select all N items") an action will
     * skip, before the confirmation: the list only knows the abilities of the current page. Only
     * for actions with `dryRun`. `useActionPreview()` of `@panneau/actions` is one.
     */
    preview?: ListActionPreviewer | undefined;
    /**
     * Icons of actions by action id (`{ archive: Archive }`), for actions written in code. They
     * win over the Lucide icon an action names (`"icon": "archive"`).
     */
    icons?: ActionIcons | undefined;
    /**
     * The id of the main action of rows, which keeps its label while the others show their icons
     * (decision 0060): the one the title of an item opens, `edit` for a resource that opens its
     * items in their form. Defaults to `show` when rows have it, else `edit`.
     */
    primary?: string | null | undefined;
}

/** The fields of a `ListView` that columns edit in place (decision 0043). */
export interface ListViewInline {
    /**
     * The fields that columns edit in place (`inlineEdit` of the list), on the items that can be
     * updated. Needs `onEdit`.
     */
    fields: readonly string[];
    /** Saves a field edited in place, and resolves with the updated item. */
    onEdit: ListInlineEditHandler;
    /**
     * The message of a portable rule that a value edited in place fails. Defaults to
     * `formatRuleFailure()` of `@panneau/core`, in English; `useFormatRuleFailure()` of
     * `@panneau/forms` translates them.
     */
    formatError?: ((failure: RuleFailure, path: string) => string) | undefined;
}

/** The layouts of a `ListView`. */
export interface ListViewLayouts {
    /** Layouts to choose from, the first one being the default. Defaults to `['table']`. */
    available?: readonly string[] | undefined;
    /** The layout, controlled. Without it, the layout is the view of the list state. */
    current?: string | undefined;
    onChange?: ((layout: string) => void) | undefined;
    /** Layouts by id, over the built-in ones and those of the plugins. */
    components?: Readonly<Record<string, ListLayoutEntry>> | undefined;
}

/**
 * The action of an empty list (`emptyAction` of `ListView`): a button, a menu, or a label and the
 * link it goes to.
 */
export type ListViewEmptyAction = ReactNode | { label: string; href: string };

function isLinkAction(
    action: ListViewEmptyAction | undefined,
): action is { label: string; href: string } {
    return (
        typeof action === 'object' &&
        action !== null &&
        !isValidElement(action) &&
        'href' in action &&
        'label' in action
    );
}

/**
 * The height of the selection bar, which sticks to the top of the window: what sticks in the
 * layout (the header of the table) sticks under it. `0` without ResizeObserver (jsdom); the list
 * only uses it while the bar is shown.
 */
function useStickyHeight(): [height: number, ref: (element: HTMLElement | null) => void] {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        if (element === null || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        // The observer is called as soon as it observes: a bar shown again gets its height.
        const observer = new ResizeObserver(() => {
            setHeight(element.getBoundingClientRect().height);
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);
    return [height, setElement];
}

// Defaults made once: the React Compiler doesn't memoize what is computed from an array or an
// object made before a hook
const DEFAULT_LAYOUTS: readonly string[] = ['table'];
const NO_INLINE_FIELDS: readonly string[] = [];
const NO_OPTIONS: Readonly<Record<string, never>> = {};

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
    /**
     * Filter controls, with chips for the active filters. Those with `primary` show first (or the
     * first 3), the others behind "More filters"; a narrow list shows them all behind one
     * "Filters" button.
     */
    filters?: readonly Filter[];
    /** Fields of the items, for the labels and options of filters that are not columns. */
    fields?: readonly Field[];
    /** Shows a search field (`q`). */
    search?: boolean;
    /** The layouts of the list: those to choose from, the current one, and their components. */
    layouts?: ListViewLayouts;
    /** Page sizes to choose from. */
    perPageOptions?: readonly number[];
    /**
     * Whether items can be selected: a "Select" button in the toolbar shows their checkboxes.
     * Defaults to whether there are selection actions.
     */
    selectable?: boolean;
    /** The actions of the list, what runs them, their icons and the main one of rows. */
    actions?: ListViewActions;
    /** The field that titles items, for their label (`itemTitle` of the resource). */
    itemTitle?: string;
    /**
     * The labels of the resource, to name items in the confirmations of actions: "Delete 3
     * articles?" (the `label` of the resource).
     */
    resourceLabel?: { readonly singular: string; readonly plural: string } | undefined;
    /**
     * The field shown as the image of items (`itemImage` of the resource, or `media` in a media
     * library): a media reference, a media, a file or a URL. The `gallery` layout needs it
     * (decision 0044), and the table starts each title with its thumbnail (decision 0061).
     */
    itemImage?: string | undefined;
    /**
     * The field that holds the state of items (`itemStatus` of the resource, decision 0103),
     * usually a `select` with tones: the calendar shows it next to each title, in its tone.
     */
    itemStatus?: string | undefined;
    /**
     * The calendar of the list (`calendar` of `resolveList()`), for its `calendar` layout. The list
     * state asks for its month when it is given the same calendar.
     */
    calendar?: Pick<ResolvedCalendar, 'field' | 'filter'> | null | undefined;
    /** The label of an item, for checkboxes and actions. Defaults to its title, then its id. */
    getItemLabel?: (item: ListItem) => string;
    /** A link to an item, on its title. */
    getItemHref?: (item: ListItem) => string | null;
    /**
     * The user is about to open an item from its link: the pointer rested on it for a moment (not
     * from touch), or it got the focus. Only items with a link (`getItemHref`) call it. A caller
     * with a data layer prefetches the item, so it opens from the cache.
     */
    onItemIntent?: (item: ListItem) => void;
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
    /** Filter controls by filter type, over the built-in ones. */
    filterControls?: Readonly<Record<string, FilterEntry>>;
    /** Fields that columns edit in place, in the table (decision 0043), and how they are saved. */
    inline?: ListViewInline;
    /** Content at the end of the toolbar, such as a button to create an item. */
    toolbar?: ReactNode;
    /** Shown when the list has no items, without filters or search. */
    emptyMessage?: ReactNode;
    /**
     * The action of a list that has no items, without filters or search, such as a button to
     * create the first one: a node (a button, a menu of types), or a label and its link. A list
     * emptied by its filters or its search offers to clear them instead.
     */
    emptyAction?: ListViewEmptyAction;
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
    layouts: layoutOptions = NO_OPTIONS,
    perPageOptions,
    selectable: selectableProp,
    actions: actionOptions = NO_OPTIONS,
    itemTitle,
    resourceLabel,
    itemImage,
    itemStatus,
    calendar = null,
    getItemLabel: getItemLabelProp,
    getItemHref,
    onItemIntent,
    getLinkHref,
    currentItemId = null,
    highlightedItemId = null,
    displays,
    filterControls,
    inline,
    toolbar,
    emptyMessage,
    emptyAction,
    'aria-label': ariaLabel,
    className,
}: ListViewProps) {
    const {
        available: layoutsProp = DEFAULT_LAYOUTS,
        current: controlledLayout,
        onChange: onLayoutChange,
        components: layoutComponents,
    }: ListViewLayouts = layoutOptions;
    const {
        available: actionsProp,
        onRun: onAction,
        preview: previewAction,
        icons: actionIcons,
        primary: primaryActionProp,
    }: ListViewActions = actionOptions;
    const inlineEdit = inline?.fields ?? NO_INLINE_FIELDS;
    const onInlineEdit = inline?.onEdit;
    const formatError = inline?.formatError ?? formatRuleFailure;
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
    const narrow = useNarrow(root);
    const [pending, setPending] = useState<string | null>(null);
    // Checkboxes show once the user asks for them ("Select"), or while items are selected: until
    // then, rows read without a column of empty space before them.
    const [selecting, setSelecting] = useState(false);
    const [selectionHeight, measureSelection] = useStickyHeight();

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
    // Items that left the list (deleted, or out of its filters) fade out before they go.
    const content = useRef<HTMLDivElement>(null);
    const leaving = useLeavingItems(items, JSON.stringify(query), content);
    // The element that last had the focus in the list, which a browser can move to the body once
    // its item is inert.
    const lastFocus = useRef<Element | null>(null);
    useLayoutEffect(() => {
        if (leaving.leaving.length > 0 && content.current !== null) {
            moveFocusFromLeaving(content.current, lastFocus.current);
        }
    }, [leaving.leaving]);
    const count = total ?? pageItems.length;
    const sort = query.sort ?? [];

    const allLayouts = getLayoutComponents(plugins, layoutComponents);
    const { layouts, layout: chosenLayout } = resolveListLayout({
        components: allLayouts,
        layouts: layoutsProp,
        chosen: view.layout,
        controlled: controlledLayout,
        itemImage,
        calendar,
    });
    // On a phone, the table shows each row as a card, with the labels of its values, its
    // thumbnail and its edits in place: where the list has both, the cards would show the same
    // thing with less, so the layout switch leaves them out, and the table is what it says (#406).
    // The chosen layout stays the view's, back once the list is wide again.
    const narrowTable = narrow && layouts.includes('table');
    const layout = narrowTable && chosenLayout === 'cards' ? 'table' : chosenLayout;
    const switchLayouts = narrowTable ? layouts.filter((id) => id !== 'cards') : layouts;
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

    // One polite message of the results, once those of a new search, filter or page are shown:
    // how many items, or that none match. Not for a sort, which shows the same items.
    const resultsKey = JSON.stringify({ ...query, sort: undefined });
    const [results, setResults] = useState({ key: resultsKey, waiting: false, message: '' });
    if (results.key !== resultsKey) {
        setResults({ key: resultsKey, waiting: true, message: results.message });
    } else if (results.waiting && !isLoading && items !== undefined && error === null) {
        setResults({
            key: resultsKey,
            waiting: false,
            message:
                items.length === 0 && !inCalendar
                    ? intl.formatMessage(hasQuery ? messages.noResults : messages.empty)
                    : total === undefined && cursors !== undefined
                      ? intl.formatMessage(messages.resultsOnPage, { count: items.length })
                      : intl.formatMessage(messages.resultsCount, {
                            count: total ?? items.length,
                        }),
        });
    }

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
            })
            // Even when the toast throws, as a `finally` block would.
            .finally(() => setPending(null));
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

    // Each layout shows the controls that change it (#412): the calendar is in date order, shows
    // titles and selects nothing; the gallery shows titles.
    const sortable = !inCalendar && allColumns.some((column) => column.sortable === true);
    const choosesColumns =
        columnChoice && allColumns.length > 1 && !inCalendar && layout !== 'gallery';
    const selects = selectable && !inCalendar;
    const shownResourceActions = resourceActions.filter(
        (action) => selectedCount === 0 || !hasScope(action, 'selection'),
    );
    const showToolbar =
        search ||
        filters.length > 0 ||
        sortable ||
        choosesColumns ||
        switchLayouts.length > 1 ||
        shownResourceActions.length > 0 ||
        selects ||
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
                <EmptyState
                    className={styles.state}
                    icon={hasQuery ? SearchX : Inbox}
                    title={
                        hasQuery
                            ? intl.formatMessage(messages.noResults)
                            : (emptyMessage ?? intl.formatMessage(messages.empty))
                    }
                    actions={
                        hasQuery ? (
                            <Button size="sm" onPress={() => clearFilters()}>
                                {intl.formatMessage(messages.clearFilters)}
                            </Button>
                        ) : isLinkAction(emptyAction) ? (
                            <LinkButton href={emptyAction.href} icon={Plus}>
                                {emptyAction.label}
                            </LinkButton>
                        ) : (
                            emptyAction
                        )
                    }
                />
            );
        }
        return (
            <Layout
                items={withLeavingItems(pageItems, leaving.leaving)}
                columns={columns}
                renderValue={renderValue}
                getItemLabel={getItemLabel}
                getItemHref={getItemHref}
                onItemIntent={onItemIntent}
                getItemImage={
                    itemImage !== undefined ? (item) => getImageUrl(item[itemImage]) : undefined
                }
                getItemFileKind={
                    itemImage !== undefined ? (item) => getFileKind(item[itemImage]) : undefined
                }
                getItemStatus={
                    itemStatus !== undefined
                        ? (item) =>
                              getItemStatus(
                                  item,
                                  itemStatus,
                                  [...fields, ...allColumns.map((column) => column.field)].find(
                                      (field) => field?.name === itemStatus,
                                  ),
                                  intl.locale,
                              )
                        : undefined
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
                              isLoading,
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
                isLeaving={leaving.isLeaving}
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
        element?.scrollIntoView?.({
            block: 'nearest',
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }, [highlightShown, highlightedItemId]);

    return (
        <div
            ref={root}
            className={cx(styles.list, className)}
            style={
                selectedCount > 0 && selectionHeight > 0
                    ? ({
                          '--_panneau-list-sticky-top': `calc(var(--panneau-frame-top) + ${String(selectionHeight)}px)`,
                      } as CSSProperties)
                    : undefined
            }
        >
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
                            <FilterBar
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
                        <ToolbarControls
                            narrow={narrow}
                            sort={
                                sortable
                                    ? {
                                          columns: allColumns,
                                          sort,
                                          onChange: (next) => list.setSort(next),
                                      }
                                    : null
                            }
                            columns={
                                choosesColumns
                                    ? {
                                          columns: allColumns,
                                          shown: columns,
                                          onChange: (ids) => list.setColumns(ids),
                                          onReset:
                                              view.columns !== undefined
                                                  ? () => list.resetColumns()
                                                  : null,
                                      }
                                    : null
                            }
                            layouts={
                                switchLayouts.length > 1
                                    ? {
                                          layouts: switchLayouts,
                                          value: layout,
                                          onChange: (next) => {
                                              if (controlledLayout === undefined) {
                                                  list.setLayout(next);
                                              }
                                              onLayoutChange?.(next);
                                          },
                                      }
                                    : null
                            }
                            selection={
                                selects
                                    ? {
                                          isSelecting: showsChecks,
                                          onPress: () =>
                                              showsChecks ? endSelection() : setSelecting(true),
                                      }
                                    : null
                            }
                            actions={shownResourceActions.map((action) => ({
                                action,
                                href: fillActionUrl(action),
                                isPending: pending === keyOf(action),
                            }))}
                            onAction={(action) => runOnResource(action)}
                            icons={actionIcons}
                        >
                            {toolbar}
                        </ToolbarControls>
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
                <div ref={measureSelection} className={styles.selection}>
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
                        <Button
                            size="sm"
                            appearance="ghost"
                            onPress={() => list.selectAllMatching()}
                        >
                            {intl.formatMessage(messages.selectAllMatching, { total: count })}
                        </Button>
                    ) : null}
                    <Button size="sm" appearance="ghost" onPress={() => list.clearSelection()}>
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
            {/* Once the skeleton, which says the items load, is gone */}
            {items !== undefined ? (
                <span className={styles.status} role="status">
                    {results.message}
                </span>
            ) : null}
            <div
                ref={content}
                className={styles.body}
                role="group"
                aria-label={label}
                aria-busy={isLoading && items !== undefined}
                // The focus of an item that left the list, when no other item is left
                tabIndex={-1}
                onFocus={(event) => {
                    lastFocus.current = event.target;
                }}
            >
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
                itemLabel={
                    confirming?.item !== undefined ? getItemLabel(confirming.item) : undefined
                }
                labels={resourceLabel}
                onConfirm={(event) => void execute(event)}
                onCancel={closeConfirmation}
            />
        </div>
    );
}
