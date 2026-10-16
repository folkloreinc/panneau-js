import type { ComponentType, ReactNode } from 'react';

import type {
    Abilities,
    Action,
    ActionScope,
    Field,
    Filter,
    FilterValue,
    Option,
    Selection,
} from '@panneau/protocol';

/**
 * An item of a list: an id, and the values of its fields. Items of the protocol (`Item`) are list
 * items; so are a product's own records, without `version` or `abilities`.
 */
export interface ListItem {
    id: string;
    /** What the user can do with the item. Without abilities, every action is shown. */
    abilities?: Abilities;
    [key: string]: unknown;
}

/**
 * A column. A resolved column of `@panneau/core` (`ResolvedColumn`) is a column, and so is a
 * column written by hand: `{ id: 'title', label: 'Title' }`.
 */
export interface ListColumn {
    /** The column id. Without `render`, the value is `item[id]`. Also the key to sort by. */
    id: string;
    label?: ReactNode;
    /** The field shown, for the display (options of a select, locales of a localized value). */
    field?: Field | null;
    /** How the value is displayed: a display of the registry (`date`, `select`). */
    display?: string | null;
    sortable?: boolean;
    width?: number | string;
    align?: 'start' | 'center' | 'end';
    /** Renders the cell, instead of a display. */
    render?: (item: ListItem) => ReactNode;
}

/** Props of a display: shows the value of a column for an item. */
export interface DisplayProps {
    value: unknown;
    item: ListItem;
    column: ListColumn;
    /** The column's field, or `null`. */
    field: Field | null;
}

/** A registry entry: renders a value with a display (`date`, `select`, a plugin's own). */
export type DisplayEntry = ComponentType<DisplayProps>;

/** What a selection action or a toolbar action applies to. */
export interface ListActionEvent {
    action: Action;
    /** `item` for a row action, `selection` or `resource` for a toolbar action. */
    scope: ActionScope;
    /** The item of a row action. */
    item?: ListItem;
    /** The selection to send with a `selection` action, as the protocol's action request has it. */
    selection?: Selection;
    /** How many items the action applies to: 1 for an item, the selected count for a selection. */
    count: number;
    /** Selected items of the current page that don't allow the action: the backend skips them. */
    skipped: readonly ListItem[];
}

/**
 * Runs an action. Lists ask for confirmation first when the action has `confirm`. A returned
 * promise shows the action as pending until it settles; after a selection action succeeds, the
 * selection is cleared.
 */
export type ListActionHandler = (event: ListActionEvent) => unknown;

/** Props of a filter control. */
export interface FilterControlProps {
    filter: Filter;
    /** The filter's label: its `label`, or its id. */
    label: string;
    /** Options, from the filter or from the field it filters. */
    options: readonly Option[];
    /** The current value: strings, as the URL keeps them, or what the control set. */
    value: unknown;
    /** Sets the value, or removes the filter with `undefined`. */
    onChange: (value: FilterValue | undefined) => void;
    /** Remembers the label of a value, for the chip of the active filter (relations). */
    onLabel: (value: string, label: string) => void;
    /** The label remembered for a value, if any. */
    getValueLabel: (value: string) => string | null;
}

/** A filter control, by filter type (`select`, `date`). */
export type FilterEntry = ComponentType<FilterControlProps>;

/** Props of a list layout: renders the items of the current page. */
export interface ListLayoutProps {
    items: readonly ListItem[];
    columns: readonly ListColumn[];
    /** Renders the value of a column for an item, with its display. */
    renderValue: (item: ListItem, column: ListColumn) => ReactNode;
    /** The label of an item: its title, for checkboxes and actions. */
    getItemLabel: (item: ListItem) => string;
    /** A link to the item, when the list has one. */
    getItemHref?: ((item: ListItem) => string | null) | undefined;
    /** Whether items have checkboxes. */
    selectable: boolean;
    isSelected: (item: ListItem) => boolean;
    onToggle: (item: ListItem) => void;
    /** The row actions of an item, or `null` without any. */
    renderActions: (item: ListItem) => ReactNode;
    /** The current sort, as `sort` query values (`['-published_at']`). */
    sort: readonly string[];
    onSort: (column: ListColumn) => void;
    /** Accessible name of the list. */
    label: string;
    /** The checkbox that selects the page, for layouts that show it in a header. */
    pageSelection: ReactNode;
}

/** A list layout, by id (`table`, `cards`). */
export type ListLayoutEntry = ComponentType<ListLayoutProps>;
