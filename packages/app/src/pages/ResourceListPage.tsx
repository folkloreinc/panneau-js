import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { useActionPreview } from '@panneau/actions';
import {
    type ResolvedResource,
    getOpenMode,
    getVisibleFields,
    useList,
    usePanneau,
} from '@panneau/core';
import {
    usePrefetchItem,
    useResourceItem,
    useResourceList,
    useUpdateItem,
} from '@panneau/data/query';
import { useFormatRuleFailure } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import { ListView, getPagingProps, useListFields } from '@panneau/lists';
import type { RouteReference } from '@panneau/protocol';
import {
    getCreatableTypes,
    getItemImageField,
    getSummaryPeriodFilter,
} from '@panneau/protocol/runtime';
import {
    AsideLayout,
    Button,
    LinkButton,
    Menu,
    MenuItem,
    MenuTrigger,
    getNamedIcon,
    usePanneauIntl,
    useToast,
} from '@panneau/ui';

import { useSummaryPeriod } from '../dashboard/period';
import { useDocumentTitle } from '../documentTitle';
import { getListKey, rememberListSearch } from '../listLocation';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { ErrorPage, getErrorPageKind } from './ErrorPage';
import { ItemPanel } from './ItemPanel';
import { PageHeader } from './PageHeader';
import { ResourceSummary, useSummaryOpen } from './ResourceSummary';
import { clearCreatedItem, peekCreatedItem } from './createdItem';
import { filterActions, useItemActionRunner } from './itemActionRunner';
import { createLinkResolver, getItemPath, opensInForm } from './itemLinks';
import { getItemTitle } from './itemTitle';
import styles from './pages.module.css';

/** How long the item just created stays highlighted: its fade, with some room. */
const HIGHLIGHT_DURATION = 4000;

/** The parameters of a URL that say which items of a list to show: a link to some of them. */
const LIST_QUERY_PARAM = /^(page|cursor|sort|q|filter\[.+)$/;

/**
 * Whether a URL opens a list on some of its items: its filters, its search, a page or a sort. The
 * filter of the period of its summary isn't one: the summary sets it.
 */
function hasListQuery(search: string, periodFilter: string | null): boolean {
    return [...new URLSearchParams(search).keys()].some(
        (key) =>
            LIST_QUERY_PARAM.test(key) &&
            (periodFilter === null || !key.startsWith(`filter[${periodFilter}]`)),
    );
}

export interface ResourceListPageProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
    /** The item shown in a panel next to the list (the show route), or `null`. */
    selectedId?: string | null;
    /** The path of a route reference of the definition, for `link` actions with a `route`. */
    resolveRoute?: (reference: RouteReference) => string | null;
}

/**
 * The list of a resource: its query in the URL, its items fetched through the adapter, and its
 * actions run by the action runner. Rendered with a `key` per resource, so each one keeps its own
 * list state.
 */
export function ResourceListPage({
    resolved,
    basePath,
    locale,
    selectedId = null,
    resolveRoute,
}: ResourceListPageProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const { resource, list: definitionList, abilities } = resolved;
    const createLabel = intl.formatMessage(appMessages.create, {
        resource: resource.label.singular,
    });
    const creatableTypes = getCreatableTypes(resource);
    const { definition, router } = usePanneau();
    // The view of the list (filters, sort, layout, columns) is remembered for the user, in this
    // browser (decision 0042).
    const listKey = getListKey(basePath, definition?.user?.id, resource.id);
    const { query, list } = useList({ list: definitionList, remember: { key: listKey } });
    // The layouts of the definition, or the table and the cards without any
    const layouts =
        resource.list?.layouts !== undefined ? definitionList.layouts : ['table', 'cards'];
    const itemImage = getItemImageField(resource);
    // Only the fields the list shows: its columns and what its layout needs
    const fields = useListFields({
        list,
        columns: definitionList.columns,
        layouts,
        itemTitle: resource.itemTitle,
        itemImage,
        calendar: definitionList.calendar,
    });
    const { data, error, isFetching, refetch } = useResourceList(
        resource.id,
        fields !== undefined ? { ...query, fields } : query,
        { placeholderData: (previous) => previous },
    );
    // The summary above the list (decision 0084), which the user can hide. A resource whose list
    // comes second opens on its summary, its list folded under it, unless the URL asks for some
    // items (a link of a widget, a filtered list) or an item.
    const summary = resource.summary;
    const [summaryOpen, setSummaryOpen] = useSummaryOpen(resource.id);
    const periodFilter = getSummaryPeriodFilter(resource);
    const [listRequested, setListRequested] = useState(
        () =>
            summary?.list !== 'collapsed' ||
            selectedId !== null ||
            hasListQuery(router?.getSearch() ?? window.location.search, periodFilter),
    );
    // The period of the summary is the list's own date-range filter (decision 0084)
    const period = useSummaryPeriod({
        period: summary?.period,
        filter: periodFilter,
        list,
        value: periodFilter !== null ? query.filter?.[periodFilter] : undefined,
        router,
    });
    const listShown = summary === undefined || !summaryOpen || listRequested;
    const total = (data?.meta as { total?: unknown } | undefined)?.total;
    const { run: runAction, isSupported } = useItemActionRunner(resource, { basePath, locale });
    const previewAction = useActionPreview(resource.id);
    // Fields edited in place are saved alone, with the version of the item (decision 0043).
    const update = useUpdateItem(resource.id);
    const prefetchItem = usePrefetchItem(resource.id);
    const formatError = useFormatRuleFailure(resource.fields);
    const title = capitalize(resource.label.plural, locale);
    // The item that the create page just created: the list highlights it once it shows it, without
    // a toast. A list that doesn't show it (another page, a filter) says it was created, in a toast
    // with "Open" (decision 0066).
    const [created] = useState(() => peekCreatedItem(resource.id));
    const [highlightedId, setHighlightedId] = useState(created?.id ?? null);
    useEffect(() => {
        if (created !== null) {
            clearCreatedItem(created);
        }
    }, [created]);
    const createdSettled = created !== null && data !== undefined && !isFetching;
    const createdShown = created !== null && (data?.data ?? []).some(({ id }) => id === created.id);
    const createdReported = useRef(false);
    const reportCreated = useEffectEvent(() => {
        if (created === null || createdReported.current) {
            return;
        }
        createdReported.current = true;
        if (createdShown) {
            return;
        }
        toasts.show(
            {
                title:
                    created.title !== null && created.title !== ''
                        ? intl.formatMessage(appMessages.itemCreated, { title: created.title })
                        : intl.formatMessage(appMessages.created, {
                              resource: resource.label.singular,
                          }),
                tone: 'success',
                action: {
                    label: intl.formatMessage(appMessages.openCreated),
                    onAction: () => navigate(created.href),
                },
            },
            { key: `panneau-created:${resource.id}` },
        );
    });
    useEffect(() => {
        if (!createdSettled) {
            return undefined;
        }
        reportCreated();
        // The highlight fades by itself: then the item is like the others, also when it shows again
        const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION);
        return () => clearTimeout(timer);
    }, [createdSettled]);
    // The item of the panel, which the panel fetches too
    const { data: selected } = useResourceItem(resource.id, selectedId);
    useDocumentTitle([
        selectedId !== null
            ? (getItemTitle(selected, resource.itemTitle, locale) ?? selectedId)
            : null,
        title,
    ]);
    // The list keeps its query in the URL: the panel opens and closes without losing it.
    const search = window.location.search;
    // Links back to the list, from its items, show it as it is now (decision 0102)
    useEffect(() => rememberListSearch(listKey, search), [listKey, search]);
    const indexPath = routePath({ name: 'resource.index', resource: resource.id }, basePath);
    // Unless the resource opens items in the panel, the show route of an item that can be updated
    // goes to its form (decision 0082), with the hash of the link. One that can't stays in the panel.
    // Until the item says which, the list stays and the panel shows its skeleton: the list isn't
    // rendered again when one of its items opens (#422), and a link to an item shows the page.
    const redirect =
        selectedId !== null && selected !== undefined && opensInForm(resource, selected.abilities)
            ? `${routePath({ name: 'resource.edit', resource: resource.id, id: selectedId }, basePath)}${window.location.hash}`
            : null;
    useEffect(() => {
        if (redirect !== null) {
            navigate(redirect, { replace: true });
        }
    }, [redirect]);
    // The page leaves for the form of the item
    if (redirect !== null) {
        return null;
    }
    // A list that never loaded: the error page, in place of the page. Once it has items, an error
    // of a refetch shows in the list, which keeps them.
    if (error !== null && data === undefined) {
        return (
            <ErrorPage
                kind={getErrorPageKind(error)}
                homeHref={routePath({ name: 'home' }, basePath)}
                onRetry={() => void refetch()}
            />
        );
    }
    // "New …", in the header of the page and in the empty list
    const createAction = !abilities.create ? undefined : creatableTypes.length > 1 ? (
        // A resource with types: a menu of the types to create (decision 0077)
        <MenuTrigger>
            <Button tone="accent" icon={Plus} iconEnd={ChevronDown}>
                {createLabel}
            </Button>
            <Menu placement="bottom end">
                {creatableTypes.map((type) => (
                    <MenuItem
                        key={type.id}
                        id={type.id}
                        href={routePath(
                            {
                                name: 'resource.create',
                                resource: resource.id,
                                type: type.id,
                            },
                            basePath,
                        )}
                        {...(type.icon !== undefined ? { icon: getNamedIcon(type.icon) } : {})}
                        {...(type.description !== undefined
                            ? { description: type.description }
                            : {})}
                    >
                        {type.label}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    ) : (
        <LinkButton
            href={routePath(
                {
                    name: 'resource.create',
                    resource: resource.id,
                    ...(creatableTypes[0] !== undefined ? { type: creatableTypes[0].id } : {}),
                },
                basePath,
            )}
            tone="accent"
            icon={Plus}
        >
            {createLabel}
        </LinkButton>
    );
    return (
        <div className={styles.page}>
            <PageHeader title={title} actions={createAction} />
            {resource.description !== undefined ? (
                <p className={styles.intro}>{resource.description}</p>
            ) : null}
            {summary !== undefined && definition !== null ? (
                <ResourceSummary
                    resource={resource}
                    summary={summary}
                    definition={definition}
                    basePath={basePath}
                    query={{
                        ...(query.filter !== undefined && { filter: query.filter }),
                        ...(query.q !== undefined && { q: query.q }),
                    }}
                    isOpen={summaryOpen}
                    onOpenChange={setSummaryOpen}
                    period={period}
                />
            ) : null}
            {!listShown ? (
                <Button className={styles.showList} onPress={() => setListRequested(true)}>
                    {typeof total === 'number'
                        ? intl.formatMessage(appMessages.showListItems, {
                              count: total,
                              singular: resource.label.singular,
                              plural: resource.label.plural,
                          })
                        : intl.formatMessage(appMessages.showList)}
                </Button>
            ) : null}
            {/* The panel goes over the list, so that opening an item doesn't reflow it (decision 0099) */}
            <AsideLayout
                placement="overlay"
                aside={
                    selectedId !== null ? (
                        <ItemPanel
                            key={selectedId}
                            resolved={resolved}
                            basePath={basePath}
                            locale={locale}
                            id={selectedId}
                            closeHref={`${indexPath}${search}`}
                            {...(resolveRoute !== undefined ? { resolveRoute } : {})}
                        />
                    ) : null
                }
            >
                {listShown ? (
                    <ListView
                        columns={definitionList.columns}
                        filters={definitionList.filters}
                        search={definitionList.search}
                        selectable={definitionList.selectable}
                        calendar={definitionList.calendar}
                        actions={{
                            available: filterActions(definitionList.actions, isSupported),
                            // The main action of rows keeps its label: what the title opens
                            primary: getOpenMode(resource) === 'edit' ? 'edit' : 'show',
                            onRun: runAction,
                            preview: previewAction,
                        }}
                        aria-label={title}
                        emptyAction={createAction}
                        list={list}
                        items={data?.data}
                        {...getPagingProps(data?.meta)}
                        isLoading={isFetching}
                        error={error}
                        onRetry={() => void refetch()}
                        fields={getVisibleFields(resource.fields)}
                        itemTitle={resource.itemTitle}
                        itemImage={itemImage}
                        layouts={{ available: layouts }}
                        perPageOptions={[10, 20, 50, 100]}
                        // Titles open the panel, with the list's query, or the form (`open` of the resource)
                        getItemHref={(item) => getItemPath(resource, item, basePath, search)}
                        // Hovering or focusing a title loads its item, so it opens from the cache
                        onItemIntent={(item) => prefetchItem(item.id)}
                        getLinkHref={createLinkResolver(resource, basePath, {
                            search,
                            resolveRoute,
                        })}
                        currentItemId={selectedId}
                        highlightedItemId={highlightedId}
                        inline={{
                            fields: definitionList.inlineEdit,
                            onEdit: ({ item, field, value }) =>
                                update.mutateAsync({
                                    id: item.id,
                                    values: { [field.name]: value },
                                    version: typeof item.version === 'string' ? item.version : null,
                                }),
                            formatError,
                        }}
                    />
                ) : null}
            </AsideLayout>
        </div>
    );
}
