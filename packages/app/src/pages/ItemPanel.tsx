import { useEffect, useRef } from 'react';

import { type ResolvedResource, getItemActions, getVisibleFields } from '@panneau/core';
import { ForbiddenError, NotFoundError } from '@panneau/data';
import { useResourceItem } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ItemDetails, type ItemDetailsColumn, getImageUrl } from '@panneau/lists';
import type { Field, Item, RouteReference } from '@panneau/protocol';
import { ITEM_TYPE_KEY, getTypeFields } from '@panneau/protocol/runtime';
import {
    Alert,
    Aside,
    Button,
    Skeleton,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    usePanneauIntl,
    usePreference,
} from '@panneau/ui';

import { navigate } from '../location';
import { useRecordRecentItem } from '../recentItems';
import { ItemActions } from './ItemActions';
import styles from './ItemPanel.module.css';
import { ItemPreview, PreviewSkeleton } from './ItemPreview';
import { useItemActionRunner } from './itemActionRunner';
import { createLinkResolver } from './itemLinks';
import { getItemTitle } from './itemTitle';

/**
 * The value of a field in the details: a group with the values of its fields, under its label.
 * Repeaters hold lists of fields, which only the form shows. A compound field (decision 0065) is
 * one value, shown by its display.
 */
function toDetailsColumns(fields: readonly Field[]): ItemDetailsColumn[] {
    return fields
        .filter((field) => field.type !== 'repeater')
        .map((field) => ({
            id: field.name,
            field,
            label: field.label ?? field.name,
            display: field.display ?? field.type,
            ...(field.type === 'group' ? { columns: toDetailsColumns(field.fields ?? []) } : {}),
        }));
}

/**
 * The image of a media of a library, over its details: its thumbnail, or the URL of an image. A
 * media without one (a document without a thumbnail) shows none, as a media that loads, whose
 * details draw the skeleton. Its title is the heading.
 */
function MediaImage({ item }: { item: Item | undefined }) {
    const url = item !== undefined ? getImageUrl(item.media) : null;
    return url !== null ? <img className={styles.mediaImage} src={url} alt="" /> : null;
}

const TABS = ['preview', 'details'] as const;

export interface ItemPanelProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
    id: string;
    /** Where closing the panel goes: the list, with its query. */
    closeHref: string;
    /** The path of a route reference of the definition, for `link` actions with a `route`. */
    resolveRoute?: (reference: RouteReference) => string | null;
}

/**
 * The details of an item next to its list (the show route), in an aside (decision 0074): its values
 * with the displays of the lists, a link to edit it, and the `link` actions of the resource, such
 * as its page on the site. A resource with a `features.preview` gets a preview tab first: a
 * component of a plugin, or its page on the site. The panel can be widened, for previews, and
 * remembers it. Escape closes it.
 */
export function ItemPanel({
    resolved,
    basePath,
    locale,
    id,
    closeHref,
    resolveRoute,
}: ItemPanelProps) {
    const intl = usePanneauIntl();
    const { resource } = resolved;
    const { data: item, error, isError, refetch } = useResourceItem(resource.id, id);
    const panel = useRef<HTMLElement>(null);
    const [tab, setTab] = usePreference('item-panel-tab', TABS);
    const hasPreview = (resource.features?.preview ?? null) !== null;
    const singular = resource.label.singular;
    const label = intl.formatMessage(appMessages.itemPanel, { resource: singular });
    const title =
        getItemTitle(item, resource.itemTitle, locale) ?? (item !== undefined ? item.id : '');
    useRecordRecentItem(basePath, item !== undefined ? { resource: resource.id, id, title } : null);

    // Focus moves to the panel when it opens or shows another item.
    useEffect(() => {
        panel.current?.focus();
    }, [id]);

    // The fields of the item's type after those of the resource (decision 0076)
    const columns = toDetailsColumns(
        getVisibleFields(getTypeFields(resource, item?.[ITEM_TYPE_KEY])),
    );
    // The actions of the item, as its row and its form show them, but `show`: this panel
    const { run, isSupported } = useItemActionRunner(resource, { basePath, locale });
    const itemActions =
        item !== undefined
            ? getItemActions(resource, item, 'panel', {
                  getLinkHref: createLinkResolver(resource, basePath, { resolveRoute }),
                  filter: isSupported,
              })
            : [];

    let content;
    if (item === undefined && error instanceof ForbiddenError) {
        // An item the user can't view: retrying won't help (decision 0046)
        content = (
            <Alert tone="warning">
                <p>{intl.formatMessage(appMessages.itemForbidden, { resource: singular })}</p>
            </Alert>
        );
    } else if (item === undefined && isError) {
        content = (
            <Alert tone="danger">
                <p>{intl.formatMessage(appMessages.itemLoadError, { resource: singular })}</p>
                <Button size="sm" onPress={() => void refetch()}>
                    {intl.formatMessage(appMessages.retry)}
                </Button>
            </Alert>
        );
    } else {
        // While the item loads, its details and its preview draw their skeleton. A media shows
        // its image first (decision 0061).
        const details = (
            <>
                {resource.kind === 'media' ? <MediaImage item={item} /> : null}
                <ItemDetails item={item} columns={columns} />
            </>
        );
        content = hasPreview ? (
            <Tabs
                selectedKey={tab ?? 'preview'}
                onSelectionChange={(key) => setTab(key === 'details' ? 'details' : 'preview')}
                className={styles.tabs}
            >
                <TabList aria-label={label}>
                    <Tab id="preview">{intl.formatMessage(appMessages.preview)}</Tab>
                    <Tab id="details">{intl.formatMessage(appMessages.details)}</Tab>
                </TabList>
                <TabPanel id="preview" className={styles.tabPanel}>
                    {item !== undefined ? (
                        <ItemPreview
                            resource={resource}
                            item={item}
                            title={title}
                            locale={locale}
                        />
                    ) : (
                        <PreviewSkeleton />
                    )}
                </TabPanel>
                <TabPanel id="details" className={styles.tabPanel}>
                    {details}
                </TabPanel>
            </Tabs>
        ) : (
            details
        );
    }

    return (
        <Aside
            ref={panel}
            tabIndex={-1}
            label={label}
            title={item !== undefined ? title : undefined}
            isLoading={item === undefined && !isError}
            isWidenable
            storageKey="item-panel"
            onClose={() => navigate(closeHref)}
            className={styles.panel}
            toolbar={
                item !== undefined ? (
                    <ItemActions
                        resource={resource.id}
                        actions={itemActions}
                        item={item}
                        runAction={run}
                        onRun={(_action, outcome) => {
                            // An action that removed the item (`delete`) closes the panel.
                            if (outcome.status !== 'done') {
                                return;
                            }
                            void refetch().then(({ error }) => {
                                if (error instanceof NotFoundError) {
                                    navigate(closeHref, { replace: true });
                                }
                            });
                        }}
                    />
                ) : !isError ? (
                    <Skeleton shape="rect" width="5rem" height="var(--panneau-control-height-sm)" />
                ) : undefined
            }
        >
            {content}
        </Aside>
    );
}
