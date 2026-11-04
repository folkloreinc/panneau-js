import { Plus } from 'lucide-react';
import { useEffect } from 'react';

import { useActionPreview } from '@panneau/actions';
import {
    type ResolvedResource,
    getOpenMode,
    getVisibleFields,
    useList,
    usePanneau,
} from '@panneau/core';
import { useResourceItem, useResourceList, useUpdateItem } from '@panneau/data/query';
import { useFormatRuleFailure } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import { ListView, getPagingProps } from '@panneau/lists';
import type { RouteReference } from '@panneau/protocol';
import { getItemImageField } from '@panneau/protocol/runtime';
import { LinkButton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { useDocumentTitle } from '../documentTitle';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { ErrorPage, getErrorPageKind } from './ErrorPage';
import { ItemPanel } from './ItemPanel';
import { PageHeader } from './PageHeader';
import { filterActions, useItemActionRunner } from './itemActionRunner';
import { createLinkResolver, getItemPath, opensInForm } from './itemLinks';
import { getItemTitle } from './itemTitle';
import styles from './pages.module.css';

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
    const { resource, list: definitionList, abilities } = resolved;
    const { definition } = usePanneau();
    // The view of the list (filters, sort, layout, columns) is remembered for the user, in this
    // browser (decision 0042).
    const { query, list } = useList({
        list: definitionList,
        remember: { key: `${basePath}:${definition?.user?.id ?? ''}:${resource.id}` },
    });
    const { data, error, isFetching, refetch } = useResourceList(resource.id, query, {
        placeholderData: (previous) => previous,
    });
    const { run: runAction, isSupported } = useItemActionRunner(resource, { basePath, locale });
    const previewAction = useActionPreview(resource.id);
    // Fields edited in place are saved alone, with the version of the item (decision 0043).
    const update = useUpdateItem(resource.id);
    const formatError = useFormatRuleFailure(resource.fields);
    const title = capitalize(resource.label.plural, locale);
    // The item of the panel, which the panel fetches too
    const { data: selected, isError: selectedError } = useResourceItem(resource.id, selectedId);
    useDocumentTitle([
        selectedId !== null
            ? (getItemTitle(selected, resource.itemTitle, locale) ?? selectedId)
            : null,
        title,
    ]);
    // The list keeps its query in the URL: the panel opens and closes without losing it.
    const search = window.location.search;
    const indexPath = routePath({ name: 'resource.index', resource: resource.id }, basePath);
    // With `"open": "edit"`, the show route of an item that can be updated goes to its form
    // (decision 0040), with the hash of the link. One that can't stays in the panel.
    const redirect =
        selectedId !== null && selected !== undefined && opensInForm(resource, selected.abilities)
            ? `${routePath({ name: 'resource.edit', resource: resource.id, id: selectedId }, basePath)}${window.location.hash}`
            : null;
    useEffect(() => {
        if (redirect !== null) {
            navigate(redirect, { replace: true });
        }
    }, [redirect]);
    // Until the item says whether it opens in its form, the page waits, rather than showing the
    // list and its panel for an instant.
    if (
        redirect !== null ||
        (getOpenMode(resource) === 'edit' &&
            selectedId !== null &&
            selected === undefined &&
            !selectedError)
    ) {
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
    return (
        <div className={cx(styles.page, selectedId !== null && styles.withPanel)}>
            <PageHeader
                title={title}
                actions={
                    abilities.create ? (
                        <LinkButton
                            href={routePath(
                                { name: 'resource.create', resource: resource.id },
                                basePath,
                            )}
                            variant="primary"
                            icon={Plus}
                        >
                            {intl.formatMessage(appMessages.create, {
                                resource: resource.label.singular,
                            })}
                        </LinkButton>
                    ) : undefined
                }
            />
            {resource.description !== undefined ? (
                <p className={styles.intro}>{resource.description}</p>
            ) : null}
            <div className={styles.split}>
                <ListView
                    {...definitionList}
                    actions={filterActions(definitionList.actions, isSupported)}
                    aria-label={title}
                    list={list}
                    items={data?.data}
                    {...getPagingProps(data?.meta)}
                    isLoading={isFetching}
                    error={error}
                    onRetry={() => void refetch()}
                    fields={getVisibleFields(resource.fields)}
                    itemTitle={resource.itemTitle}
                    itemImage={getItemImageField(resource)}
                    // The layouts of the definition, or the table and the cards without any
                    layouts={
                        resource.list?.layouts !== undefined
                            ? definitionList.layouts
                            : ['table', 'cards']
                    }
                    perPageOptions={[10, 20, 50, 100]}
                    // Titles open the panel, with the list's query, or the form (`open` of the resource)
                    getItemHref={(item) => getItemPath(resource, item, basePath, search)}
                    getLinkHref={createLinkResolver(resource, basePath, { search, resolveRoute })}
                    currentItemId={selectedId}
                    // The main action of rows keeps its label: what the title opens
                    primaryAction={getOpenMode(resource) === 'edit' ? 'edit' : 'show'}
                    onAction={runAction}
                    previewAction={previewAction}
                    onInlineEdit={({ item, field, value }) =>
                        update.mutateAsync({
                            id: item.id,
                            values: { [field.name]: value },
                            version: typeof item.version === 'string' ? item.version : null,
                        })
                    }
                    formatError={formatError}
                />
                {selectedId !== null ? (
                    <ItemPanel
                        key={selectedId}
                        resolved={resolved}
                        basePath={basePath}
                        locale={locale}
                        id={selectedId}
                        closeHref={`${indexPath}${search}`}
                        {...(resolveRoute !== undefined ? { resolveRoute } : {})}
                    />
                ) : null}
            </div>
        </div>
    );
}
