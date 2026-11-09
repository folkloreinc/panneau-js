import { useEffect, useState } from 'react';

import { type ResolvedResource, getItemActions, getItemValues, resolveForm } from '@panneau/core';
import { NotFoundError } from '@panneau/data';
import { useCreateItem, useDataAdapter, useResourceItem, useUpdateItem } from '@panneau/data/query';
import { createFieldCheckSource, createRelationSource } from '@panneau/fields';
import { Form } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import type { Definition, Item, RouteReference } from '@panneau/protocol';
import { ITEM_TYPE_KEY, getItemType, getResourceType } from '@panneau/protocol/runtime';
import { usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { navigate } from '../location';
import { capitalize } from '../navigation';
import { useRecordRecentItem } from '../recentItems';
import { routePath } from '../routes';
import { ErrorPage, getErrorPageKind } from './ErrorPage';
import { ItemActions } from './ItemActions';
import { PageHeader, PageLayout } from './PageHeader';
import { setCreatedItem } from './createdItem';
import { ActionsPanel, FormPageContext } from './formPage';
import { useItemActionRunner } from './itemActionRunner';
import { createLinkResolver, getItemPath } from './itemLinks';
import { getItemTitle } from './itemTitle';

/** The panels of the app, for the sidebars of its forms (decision 0075). */
const PANELS = { actions: ActionsPanel };

export interface ResourceFormPageProps {
    definition: Definition;
    resolved: ResolvedResource;
    basePath: string;
    /** The item to edit, or `null` to create one. */
    id: string | null;
    /**
     * The type of the item to create, in a resource with types (decision 0076). An item to edit
     * has its own.
     */
    type?: string | undefined;
    /** The path of a route reference of the definition, for `link` actions with a `route`. */
    resolveRoute?: (reference: RouteReference) => string | null;
}

/**
 * The form to create or edit an item: saved through the adapter, with validation errors from the
 * server, version conflicts and a guard on unsaved changes. A new item goes back to the list, which
 * highlights it (decision 0066).
 */
export function ResourceFormPage({
    definition,
    resolved,
    basePath,
    id,
    type: createType,
    resolveRoute,
}: ResourceFormPageProps) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    // The version this page just saved: the form starts over from it, and still says "Saved".
    const [savedVersion, setSavedVersion] = useState<string | null>(null);
    const { resource } = resolved;
    const mode = id === null ? 'create' : 'update';
    const itemQuery = useResourceItem(resource.id, id);
    const createItem = useCreateItem(resource.id);
    const updateItem = useUpdateItem(resource.id);
    // The cards of relation fields link to their items: the show route, which goes to the form of
    // an item that opens there (decision 0067).
    const relationSource = createRelationSource(adapter, {
        definition,
        getItemHref: (related, relatedId) =>
            definition.resources.some((candidate) => candidate.id === related)
                ? routePath({ name: 'resource.show', resource: related, id: relatedId }, basePath)
                : null,
    });
    // Fields with `check`, such as slugs, check their value with the backend as it is typed
    const checkSource = createFieldCheckSource(adapter, resource.id, id);
    const item = itemQuery.data;
    // The fields of the item's type after those of the resource (decision 0076)
    const type =
        mode === 'create'
            ? getResourceType(resource, createType)
            : item !== undefined
              ? getItemType(resource, item)
              : undefined;
    const { fields, layout } = resolveForm(resource, { mode, type: type?.id });
    const singular = resource.label.singular;
    const title =
        mode === 'create'
            ? intl.formatMessage(appMessages.create, { resource: type?.label ?? singular })
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

    // An item the user can't update opens in its panel, as its title does (decisions 0040 and
    // 0046), or is forbidden when they can't view it either.
    const updatable = item === undefined || item.abilities.update === true;
    const viewable =
        item !== undefined && item.abilities.view === true && resolved.abilities.viewAny;
    const showHref =
        id !== null && !updatable && viewable
            ? `${routePath({ name: 'resource.show', resource: resource.id, id }, basePath)}${window.location.hash}`
            : null;
    useEffect(() => {
        if (showHref !== null) {
            navigate(showHref, { replace: true });
        }
    }, [showHref]);
    if (showHref !== null) {
        return null;
    }
    if (mode === 'update' && !updatable) {
        return <ErrorPage kind="forbidden" homeHref={routePath({ name: 'home' }, basePath)} />;
    }
    if (mode === 'update' && item === undefined && itemQuery.isError) {
        // In place of the page: the item is missing or forbidden, or the server failed
        return (
            <ErrorPage
                kind={getErrorPageKind(itemQuery.error)}
                homeHref={routePath({ name: 'home' }, basePath)}
                onRetry={() => void itemQuery.refetch()}
            />
        );
    }
    // While the item loads, the form draws its skeleton; it starts over from the item's values.
    const content = (
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
            checkSource={checkSource}
            guardUnsavedChanges
            panels={PANELS}
            // The panels of its sidebar that the user collapsed, per resource (decision 0074)
            sidebarStorageKey={`form-${resource.id}`}
            saved={savedVersion !== null && item?.version === savedVersion}
            onSubmit={(values, { version, changes }) =>
                id === null
                    ? createItem.mutateAsync(
                          type !== undefined ? { ...values, [ITEM_TYPE_KEY]: type.id } : values,
                      )
                    : updateItem.mutateAsync({ id, values: changes, version })
            }
            onSubmitted={(result) => {
                const saved = result as Item;
                setSavedVersion(saved.version ?? null);
                if (id === null) {
                    // Back to the list, which highlights the new item: it says it was created,
                    // without a toast (decision 0066). In place of the create page, which Back
                    // would open again empty.
                    setCreatedItem({
                        resource: resource.id,
                        id: saved.id,
                        title: getItemTitle(saved, resource.itemTitle, definition.locale),
                        href: getItemPath(resource, saved, basePath),
                    });
                    navigate(back.href, { replace: true });
                }
            }}
            onReload={() => void itemQuery.refetch()}
        />
    );

    // A form with a sidebar takes the width of a list: its main column stays wide enough
    const hasSidebar = layout.some((node) => node.type === 'sidebar');
    // The `actions` panel of its sidebar takes the actions of the header (decision 0075)
    const hasActionsPanel = layout.some(
        (node) => node.type === 'sidebar' && node.panel === 'actions',
    );
    return (
        <FormPageContext
            value={{
                resource: resolved,
                item,
                basePath,
                locale: definition.locale,
                actions: itemActions,
            }}
        >
            <PageLayout width={hasSidebar ? 'default' : 'narrow'}>
                <PageHeader
                    title={title}
                    back={back}
                    actions={hasActionsPanel ? undefined : itemActions}
                />
                {content}
            </PageLayout>
        </FormPageContext>
    );
}
