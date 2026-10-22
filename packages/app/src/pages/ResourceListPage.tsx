import { Plus } from 'lucide-react';

import { useActionPreview, useActionRunner } from '@panneau/actions';
import { type ResolvedResource, useList } from '@panneau/core';
import { useResourceList } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ListView } from '@panneau/lists';
import { Icon, usePanneauIntl } from '@panneau/ui';

import { capitalize } from '../navigation';
import { routePath } from '../routes';
import { LinkButton, PageHeader } from './PageHeader';
import styles from './pages.module.css';

export interface ResourceListPageProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
}

/**
 * The list of a resource: its query in the URL, its items fetched through the adapter, and its
 * actions run by the action runner. Rendered with a `key` per resource, so each one keeps its own
 * list state.
 */
export function ResourceListPage({ resolved, basePath, locale }: ResourceListPageProps) {
    const intl = usePanneauIntl();
    const { resource, list: definitionList, abilities } = resolved;
    const { query, list } = useList({ list: definitionList });
    const { data, error, isFetching, refetch } = useResourceList(resource.id, query, {
        placeholderData: (previous) => previous,
    });
    const runAction = useActionRunner(resource.id);
    const previewAction = useActionPreview(resource.id);
    const title = capitalize(resource.label.plural, locale);
    return (
        <div className={styles.page}>
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
            <ListView
                {...definitionList}
                aria-label={title}
                list={list}
                items={data?.data}
                total={data?.meta.total}
                isLoading={isFetching}
                error={error}
                onRetry={() => void refetch()}
                fields={resource.fields}
                itemTitle={resource.itemTitle}
                layouts={['table', 'cards']}
                perPageOptions={[10, 20, 50, 100]}
                getItemHref={(item) =>
                    routePath(
                        { name: 'resource.edit', resource: resource.id, id: item.id },
                        basePath,
                    )
                }
                onAction={runAction}
                previewAction={previewAction}
            />
        </div>
    );
}
