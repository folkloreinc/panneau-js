import { Plus } from 'lucide-react';
import { useEffect } from 'react';

import { useActionPreview } from '@panneau/actions';
import { type ResolvedResource, getOpenMode, getVisibleFields, useList } from '@panneau/core';
import { ForbiddenError } from '@panneau/data';
import { useResourceItem, useResourceList } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ListView, getPagingProps } from '@panneau/lists';
import type { RouteReference } from '@panneau/protocol';
import { LinkButton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { useDocumentTitle } from '../documentTitle';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { ForbiddenPage } from './ForbiddenPage';
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
    const { query, list } = useList({ list: definitionList });
    const { data, error, isFetching, refetch } = useResourceList(resource.id, query, {
        placeholderData: (previous) => previous,
    });
    const { run: runAction, isSupported } = useItemActionRunner(resource, { basePath, locale });
    const previewAction = useActionPreview(resource.id);
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
    // A list the backend refuses (decision 0046)
    if (error instanceof ForbiddenError) {
        return <ForbiddenPage homeHref={routePath({ name: 'home' }, basePath)} />;
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
                    layouts={['table', 'cards']}
                    perPageOptions={[10, 20, 50, 100]}
                    // Titles open the panel, with the list's query, or the form (`open` of the resource)
                    getItemHref={(item) => getItemPath(resource, item, basePath, search)}
                    getLinkHref={createLinkResolver(resource, basePath, { search, resolveRoute })}
                    currentItemId={selectedId}
                    onAction={runAction}
                    previewAction={previewAction}
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
