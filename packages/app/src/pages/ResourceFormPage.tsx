import { type ResolvedResource, getItemActions, getItemValues, resolveForm } from '@panneau/core';
import { NotFoundError } from '@panneau/data';
import { useCreateItem, useDataAdapter, useResourceItem, useUpdateItem } from '@panneau/data/query';
import { createRelationSource } from '@panneau/fields';
import { Form } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import type { Definition, Item, RouteReference } from '@panneau/protocol';
import { Alert, Button, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { useRecordRecentItem } from '../recentItems';
import { routePath } from '../routes';
import { ItemActions } from './ItemActions';
import { PageHeader, PageLayout } from './PageHeader';
import { useItemActionRunner } from './itemActionRunner';
import { createLinkResolver } from './itemLinks';
import { getItemTitle } from './itemTitle';

export interface ResourceFormPageProps {
    definition: Definition;
    resolved: ResolvedResource;
    basePath: string;
    /** The item to edit, or `null` to create one. */
    id: string | null;
    /** The path of a route reference of the definition, for `link` actions with a `route`. */
    resolveRoute?: (reference: RouteReference) => string | null;
}

/**
 * The form to create or edit an item: saved through the adapter, with validation errors from the
 * server, version conflicts and a guard on unsaved changes. A new item opens in its edit page.
 */
export function ResourceFormPage({
    definition,
    resolved,
    basePath,
    id,
    resolveRoute,
}: ResourceFormPageProps) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const { resource } = resolved;
    const mode = id === null ? 'create' : 'update';
    const itemQuery = useResourceItem(resource.id, id);
    const createItem = useCreateItem(resource.id);
    const updateItem = useUpdateItem(resource.id);
    const relationSource = createRelationSource(adapter, { definition });
    const { fields, layout } = resolveForm(resource, { mode });
    const item = itemQuery.data;
    const singular = resource.label.singular;
    const title =
        mode === 'create'
            ? intl.formatMessage(appMessages.create, { resource: singular })
            : (getItemTitle(item, resource.itemTitle, definition.locale) ??
              intl.formatMessage(appMessages.edit, { resource: singular }));
    useRecordRecentItem(
        basePath,
        id !== null && item !== undefined
            ? {
                  resource: resource.id,
                  id,
                  title: getItemTitle(item, resource.itemTitle, definition.locale) ?? id,
              }
            : null,
    );
    const back = {
        href: routePath({ name: 'resource.index', resource: resource.id }, basePath),
        label: capitalize(resource.label.plural, definition.locale),
    };
    useDocumentTitle([title, back.label]);
    // The actions of the item, as its row and its panel show them, but `edit`: this page
    const { run, isSupported } = useItemActionRunner(resource, {
        basePath,
        locale: definition.locale,
    });
    const formActions =
        item !== undefined
            ? getItemActions(resource, item, 'form', {
                  getLinkHref: createLinkResolver(resource, basePath, { resolveRoute }),
                  filter: isSupported,
              })
            : [];
    const itemActions =
        mode === 'update' && item !== undefined && formActions.length > 0 ? (
            <ItemActions
                resource={resource.id}
                actions={formActions}
                item={item}
                runAction={run}
                onRun={(_action, outcome) => {
                    // An action that removed the item (`delete`) leaves its page: back to the list,
                    // unless its result went somewhere already (`redirect`).
                    if (outcome.status !== 'done' || (outcome.result.redirect ?? null) !== null) {
                        return;
                    }
                    void itemQuery.refetch().then(({ error }) => {
                        if (error instanceof NotFoundError) {
                            // In place of the item's page, which Back can't return to
                            navigate(back.href, { replace: true });
                        }
                    });
                }}
            />
        ) : undefined;

    let content;
    if (mode === 'update' && item === undefined && itemQuery.isError) {
        content = (
            <Alert tone="danger">
                <p>{intl.formatMessage(appMessages.itemLoadError, { resource: singular })}</p>
                <Button size="sm" onPress={() => void itemQuery.refetch()}>
                    {intl.formatMessage(appMessages.retry)}
                </Button>
            </Alert>
        );
    } else {
        // While the item loads, the form draws its skeleton; it starts over from the item's values.
        content = (
            <Form
                key={item?.version ?? item?.id ?? 'new'}
                aria-label={title}
                isLoading={mode === 'update' && item === undefined}
                fields={fields}
                layout={layout}
                values={
                    item !== undefined
                        ? getItemValues(
                              item,
                              fields.map((field) => field.name),
                          )
                        : undefined
                }
                version={item?.version ?? null}
                mode={mode}
                locales={definition.locales}
                relationSource={relationSource}
                guardUnsavedChanges
                showSavedToast
                onSubmit={(values, { version, changes }) =>
                    id === null
                        ? createItem.mutateAsync(values)
                        : updateItem.mutateAsync({ id, values: changes, version })
                }
                onSubmitted={(result) => {
                    if (id === null) {
                        navigate(
                            routePath(
                                {
                                    name: 'resource.edit',
                                    resource: resource.id,
                                    id: (result as Item).id,
                                },
                                basePath,
                            ),
                        );
                    }
                }}
                onReload={() => void itemQuery.refetch()}
            />
        );
    }

    // A form with a sidebar takes the width of a list: its main column stays wide enough
    const hasSidebar = layout.some((node) => node.type === 'sidebar');
    return (
        <PageLayout width={hasSidebar ? 'default' : 'narrow'}>
            <PageHeader title={title} back={back} actions={itemActions} />
            {content}
        </PageLayout>
    );
}
