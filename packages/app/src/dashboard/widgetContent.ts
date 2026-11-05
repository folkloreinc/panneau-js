import { can } from '@panneau/core';
import { ForbiddenError } from '@panneau/data';
import { useResourceList, useWidgetData } from '@panneau/data/query';
import type {
    Definition,
    Item,
    ListResponse,
    ListWidgetData,
    ListWidgetItem,
    Resource,
    StatWidgetData,
    Widget,
} from '@panneau/protocol';
import {
    WIDGET_LIST_MAX_ITEMS,
    type WidgetResource,
    checkWidgetData,
    getWidgetResource,
    isBuiltInWidgetType,
} from '@panneau/protocol/runtime';

import { getItemPath } from '../pages/itemLinks';
import { getItemTitle } from '../pages/itemTitle';
import { routePath } from '../routes';

/** What a widget of the dashboard draws: its skeleton, nothing, its error, or its data. */
export type WidgetContent =
    | { status: 'loading' }
    | { status: 'hidden' }
    | { status: 'error'; retry: () => void }
    | { status: 'ready'; data: unknown };

/** The link to the list of a resource, with the query of a widget on it. */
export function widgetListHref(read: WidgetResource, basePath: string): string {
    const search = read.params.toString();
    return `${routePath({ name: 'resource.index', resource: read.resource }, basePath)}${search !== '' ? `?${search}` : ''}`;
}

/** The badge of an item: the option of its value of the first `select` column of the list. */
function badgeOf(resource: Resource, item: Item): ListWidgetItem['badge'] {
    for (const column of resource.list?.columns ?? []) {
        const field = resource.fields.find(
            (candidate) => candidate.name === column.field && candidate.type === 'select',
        );
        if (field === undefined) {
            continue;
        }
        const raw = item[field.name];
        const value = Array.isArray(raw) ? (raw as unknown[])[0] : raw;
        const option = field.options?.find((candidate) => candidate.value === value);
        return option !== undefined
            ? { label: option.label, ...(option.tone !== undefined && { tone: option.tone }) }
            : null;
    }
    return null;
}

interface ResourceDataOptions {
    resource: Resource;
    read: WidgetResource;
    basePath: string;
    locale: string;
    untitled: (id: string) => string;
}

/** The data of a built-in `stat` or `list` on a resource, from a page of its list. */
function fromList(
    type: string,
    list: ListResponse,
    { resource, read, basePath, locale, untitled }: ResourceDataOptions,
): StatWidgetData | ListWidgetData | null {
    const url = widgetListHref(read, basePath);
    if (type === 'stat') {
        const total = (list.meta as { total?: unknown }).total;
        // A list paged with cursors has no total to count
        return typeof total === 'number' ? { value: total, url } : null;
    }
    return {
        items: list.data.slice(0, WIDGET_LIST_MAX_ITEMS).map((item) => ({
            title: getItemTitle(item, resource.itemTitle, locale) ?? untitled(item.id),
            url: getItemPath(resource, item, basePath),
            badge: badgeOf(resource, item),
        })),
        url,
    };
}

interface UseWidgetContentOptions {
    widget: Widget;
    definition: Definition;
    basePath: string;
    /** The title of an item without one. */
    untitled: (id: string) => string;
    /** `false` for a type that nothing draws: its data isn't fetched. */
    enabled?: boolean;
}

/**
 * The content of a widget of the dashboard (decision 0064): the data of a widget with data of its
 * own, checked against the shape of its type, or a `stat` or a `list` from the list of a resource.
 * A widget the user can't see (a `403`, a resource they can't list) is hidden.
 */
export function useWidgetContent({
    widget,
    definition,
    basePath,
    untitled,
    enabled = true,
}: UseWidgetContentOptions): WidgetContent {
    const read = getWidgetResource(widget);
    const resource =
        read !== null
            ? definition.resources.find((candidate) => candidate.id === read.resource)
            : undefined;
    const canList = resource !== undefined && can(resource.abilities, 'viewAny');
    const list = useResourceList(
        read?.resource ?? '',
        {
            ...read?.query,
            perPage: widget.type === 'stat' ? 1 : WIDGET_LIST_MAX_ITEMS,
        },
        { enabled: enabled && read !== null && canList },
    );
    const own = useWidgetData(widget.id, { enabled: enabled && read === null });
    const query = read !== null ? list : own;
    if (read !== null && !canList) {
        return { status: 'hidden' };
    }
    if (query.error instanceof ForbiddenError) {
        return { status: 'hidden' };
    }
    const retry = () => void query.refetch();
    if (query.data === undefined) {
        return query.isError ? { status: 'error', retry } : { status: 'loading' };
    }
    if (read !== null && resource !== undefined) {
        const data = fromList(widget.type, list.data as ListResponse, {
            resource,
            read,
            basePath,
            locale: definition.locale,
            untitled,
        });
        return data !== null ? { status: 'ready', data } : { status: 'error', retry };
    }
    // Data in the wrong shape draws the error, not a broken widget
    if (isBuiltInWidgetType(widget.type) && checkWidgetData(widget.type, own.data).length > 0) {
        return { status: 'error', retry };
    }
    return { status: 'ready', data: own.data };
}
