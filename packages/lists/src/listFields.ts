import { type List, type ResolvedCalendar, usePlugins } from '@panneau/core';

import { getShownColumns } from './columns';
import { builtInLayouts } from './layouts/builtIn';
import { getLayoutComponents, resolveListLayout } from './layouts/resolve';
import type { ListColumn, ListLayoutEntry } from './types';
import { useListState } from './useListState';

export interface ListFieldsOptions {
    /** The columns shown, in their order. */
    columns: readonly ListColumn[];
    /** The layout shown. */
    layout: string;
    /** Whether the layout is a built-in one: another layout can read any value of the items. */
    builtIn?: boolean;
    /** The field that titles items (`itemTitle` of the resource). */
    itemTitle?: string | undefined;
    /** The field shown as the image of items (`itemImage` of the resource). */
    itemImage?: string | undefined;
    /** The calendar of the list, for its `calendar` layout. */
    calendar?: Pick<ResolvedCalendar, 'field'> | null | undefined;
}

/**
 * The fields that a list shows of its items, for the `fields` of its query: those of its columns
 * (with the field that a `region` reads its country from), its items' title and image, and, in the
 * calendar, the field that places them on its days. Sorted, so that moving a column doesn't ask
 * for the items again. `undefined` when the list can show any value of the items: a column that
 * renders its cells itself (`render`), or a layout that isn't built in.
 */
export function getListFields({
    columns,
    layout,
    builtIn = true,
    itemTitle,
    itemImage,
    calendar,
}: ListFieldsOptions): string[] | undefined {
    if (!builtIn || columns.some((column) => column.render !== undefined)) {
        return undefined;
    }
    const fields = new Set<string>();
    columns.forEach((column) => {
        fields.add(column.field?.name ?? column.id);
        const from = column.field?.from;
        if (typeof from === 'string' && from !== '') {
            fields.add(from);
        }
    });
    if (itemTitle !== undefined) {
        fields.add(itemTitle);
    }
    if (itemImage !== undefined) {
        fields.add(itemImage);
    }
    if (layout === 'calendar' && calendar !== null && calendar !== undefined) {
        fields.add(calendar.field);
    }
    return [...fields].sort();
}

export interface UseListFieldsOptions {
    /** The list state of `@panneau/core`, for the columns and the layout that the user chose. */
    list: List;
    /** Every column of the list, as `ListView` has them. */
    columns: readonly ListColumn[];
    /** The layouts of the list, as `ListView` has them. Defaults to `['table']`. */
    layouts?: readonly string[];
    /** The layout, controlled, as `ListView` has it. */
    layout?: string | undefined;
    itemTitle?: string | undefined;
    itemImage?: string | undefined;
    calendar?: Pick<ResolvedCalendar, 'field'> | null | undefined;
    /** Layouts by id, as `ListView` has them. */
    layoutComponents?: Readonly<Record<string, ListLayoutEntry>> | undefined;
}

/**
 * The fields that a `ListView` with the same props shows of its items (`getListFields()`), for the
 * `fields` of the query that fetches them: its columns shown and its layout, as the user chose
 * them. `undefined` when it can show any value of the items. A `getItemLabel` of the list that
 * reads other fields needs them added.
 */
export function useListFields({
    list,
    columns,
    layouts = ['table'],
    layout: controlled,
    itemTitle,
    itemImage,
    calendar = null,
    layoutComponents,
}: UseListFieldsOptions): string[] | undefined {
    const { view } = useListState(list);
    const plugins = usePlugins();
    const components = getLayoutComponents(plugins, layoutComponents);
    const { layout } = resolveListLayout({
        components,
        layouts,
        chosen: view.layout,
        controlled,
        itemImage,
        calendar,
    });
    return getListFields({
        columns: getShownColumns(columns, view.columns),
        layout,
        builtIn: components[layout] === builtInLayouts[layout],
        itemTitle,
        itemImage,
        calendar,
    });
}
