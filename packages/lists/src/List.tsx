import { type ListOptions, useList } from '@panneau/core';
import { usePanneauIntl } from '@panneau/ui';

import { ListView, type ListViewProps } from './ListView';
import { applyListQuery } from './query';
import type { ListItem } from './types';

export interface ListProps extends Omit<ListViewProps, 'list' | 'total' | 'items'> {
    /** Every item: the list searches, filters, sorts and paginates them in memory. */
    items: readonly ListItem[] | undefined;
    /** Items per page. Defaults to 20. */
    perPage?: number;
    /** Default sort, as `sort` query values (`['-published_at']`). */
    defaultSort?: string[];
    /**
     * Keeps the query in a router (`createHistoryRouter()`). Defaults to the router of the closest
     * `PanneauProvider`; `null` keeps it in memory.
     */
    router?: ListOptions['router'];
}

/**
 * A list of items held in memory, from columns and items, with or without a definition. It
 * creates its state with `useList()` of `@panneau/core`, and applies the query to `items` itself.
 * For items fetched page by page, create the state with `useList()`, fetch its `query`, and render
 * `ListView`.
 *
 * The page size and the default sort are read once.
 */
export function List({ items, perPage = 20, defaultSort = [], router, ...props }: ListProps) {
    const intl = usePanneauIntl();
    const { query, list } = useList({
        defaults: { perPage, sort: defaultSort },
        ...(router !== undefined ? { router } : {}),
    });
    const result =
        items !== undefined
            ? applyListQuery(items, query, { columns: props.columns, locale: intl.locale })
            : undefined;
    return <ListView {...props} list={list} items={result?.items} total={result?.total} />;
}
