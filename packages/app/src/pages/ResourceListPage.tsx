import { Plus } from 'lucide-react';

import { useActionPreview, useActionRunner } from '@panneau/actions';
import { type ResolvedResource, useList } from '@panneau/core';
import { useResourceItem, useResourceList } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ListView, getPagingProps } from '@panneau/lists';
import { Icon, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { useDocumentTitle } from '../documentTitle';
import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { ItemPanel } from './ItemPanel';
import { LinkButton, PageHeader } from './PageHeader';
import { getItemTitle } from './itemTitle';
import styles from './pages.module.css';

export interface ResourceListPageProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
    /** The item shown in a panel next to the list (the show route), or `null`. */
    selectedId?: string | null;
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
}: ResourceListPageProps) {
    const intl = usePanneauIntl();
    const { resource, list: definitionList, abilities } = resolved;
    const { query, list } = useList({ list: definitionList });
    const { data, error, isFetching, refetch } = useResourceList(resource.id, query, {
        placeholderData: (previous) => previous,
    });
    const runAction = useActionRunner(resource.id);
    const previewAction = useActionPreview(resource.id);
    const title = capitalize(resource.label.plural, locale);
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
    const indexPath = routePath({ name: 'resource.index', resource: resource.id }, basePath);
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
                            icon={<Icon icon={Plus} size="md" />}
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
                    aria-label={title}
                    list={list}
                    items={data?.data}
                    {...getPagingProps(data?.meta)}
                    isLoading={isFetching}
                    error={error}
                    onRetry={() => void refetch()}
                    fields={resource.fields}
                    itemTitle={resource.itemTitle}
                    layouts={['table', 'cards']}
                    perPageOptions={[10, 20, 50, 100]}
                    getItemHref={(item) =>
                        `${routePath({ name: 'resource.show', resource: resource.id, id: item.id }, basePath)}${search}`
                    }
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
                    />
                ) : null}
            </div>
        </div>
    );
}
