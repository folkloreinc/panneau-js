import { type ResolvedResource, getItemValues, resolveForm } from '@panneau/core';
import { useCreateItem, useDataAdapter, useResourceItem, useUpdateItem } from '@panneau/data/query';
import { createRelationSource } from '@panneau/fields';
import { Form } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import type { Definition, Item } from '@panneau/protocol';
import { Alert, Button, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { useRecordRecentItem } from '../recentItems';
import { routePath } from '../routes';
import { ItemActions } from './ItemActions';
import { PageHeader, PageLayout } from './PageHeader';
import { getItemTitle } from './itemTitle';

export interface ResourceFormPageProps {
    definition: Definition;
    resolved: ResolvedResource;
    basePath: string;
    /** The item to edit, or `null` to create one. */
    id: string | null;
}

/**
 * The form to create or edit an item: saved through the adapter, with validation errors from the
 * server, version conflicts and a guard on unsaved changes. A new item opens in its edit page.
 */
export function ResourceFormPage({ definition, resolved, basePath, id }: ResourceFormPageProps) {
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
    // The actions placed in `form`, once the item says which it allows, but the page's own
    const formActions = resolved.list.actions.form.filter((action) => action.id !== 'edit');
    const itemActions =
        mode === 'update' && item !== undefined && formActions.length > 0 ? (
            <ItemActions resource={resource.id} actions={formActions} item={item} />
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

    return (
        <PageLayout width="narrow">
            <PageHeader title={title} back={back} actions={itemActions} />
            {content}
        </PageLayout>
    );
}
