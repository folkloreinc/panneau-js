import { ExternalLink, Maximize2, Minimize2, Pencil, X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { Link } from 'react-aria-components';

import type { ResolvedResource } from '@panneau/core';
import { useResourceItem } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ItemDetails, type ListColumn, getActionHref, isAllowedOn } from '@panneau/lists';
import {
    Alert,
    Button,
    Heading,
    Icon,
    IconButton,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    usePanneauIntl,
} from '@panneau/ui';

import { cx } from '../cx';
import { navigate } from '../location';
import { usePreference } from '../preferences';
import { routePath } from '../routes';
import styles from './ItemPanel.module.css';
import { ItemPreview } from './ItemPreview';
import { getItemTitle } from './itemTitle';

/** Fields that hold other fields, shown in the form rather than in the details. */
const NESTED_TYPES = new Set(['group', 'repeater']);

const SIZES = ['normal', 'wide'] as const;
const TABS = ['preview', 'details'] as const;

export interface ItemPanelProps {
    resolved: ResolvedResource;
    basePath: string;
    locale: string;
    id: string;
    /** Where closing the panel goes: the list, with its query. */
    closeHref: string;
}

/**
 * The details of an item next to its list (the show route): its values with the displays of the
 * lists, a link to edit it, and the `link` actions of the resource, such as its page on the site.
 * A resource with a `features.preview` gets a preview tab first: a component of a plugin, or its
 * page on the site. The panel can be widened, for previews, and remembers it. Escape closes it.
 */
export function ItemPanel({ resolved, basePath, locale, id, closeHref }: ItemPanelProps) {
    const intl = usePanneauIntl();
    const { resource } = resolved;
    const { data: item, isError, refetch } = useResourceItem(resource.id, id);
    const panel = useRef<HTMLElement>(null);
    const [size, setSize] = usePreference('item-panel-size', SIZES);
    const [tab, setTab] = usePreference('item-panel-tab', TABS);
    const wide = size === 'wide';
    const hasPreview = (resource.features?.preview ?? null) !== null;
    const singular = resource.label.singular;
    const label = intl.formatMessage(appMessages.itemPanel, { resource: singular });
    const title =
        getItemTitle(item, resource.itemTitle, locale) ?? (item !== undefined ? item.id : '');

    // Focus moves to the panel when it opens or shows another item.
    useEffect(() => {
        panel.current?.focus();
    }, [id]);

    const columns: ListColumn[] = resource.fields
        .filter((field) => !NESTED_TYPES.has(field.type))
        .map((field) => ({
            id: field.name,
            field,
            label: field.label ?? field.name,
            display: field.display ?? field.type,
        }));
    const links = (resource.actions ?? []).flatMap((action) => {
        if (item === undefined || !action.scope.includes('item') || !isAllowedOn(action, item)) {
            return [];
        }
        const href = getActionHref(action, item);
        return href !== null ? [{ action, href }] : [];
    });

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
            event.preventDefault();
            navigate(closeHref);
        }
    };

    let content;
    if (item === undefined) {
        content = isError ? (
            <Alert tone="danger">
                <p>{intl.formatMessage(appMessages.itemLoadError, { resource: singular })}</p>
                <Button size="sm" onPress={() => void refetch()}>
                    {intl.formatMessage(appMessages.retry)}
                </Button>
            </Alert>
        ) : (
            <Spinner showLabel />
        );
    } else {
        const details = <ItemDetails item={item} columns={columns} />;
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
                    <ItemPreview resource={resource} item={item} title={title} locale={locale} />
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
        <section
            ref={panel}
            tabIndex={-1}
            aria-label={label}
            className={cx(styles.panel, wide && styles.wide)}
            data-wide={wide || undefined}
            onKeyDown={onKeyDown}
        >
            <header className={styles.header}>
                <Heading level={2} className={styles.title}>
                    {title}
                </Heading>
                <div className={styles.headerButtons}>
                    <IconButton
                        icon={wide ? Minimize2 : Maximize2}
                        label={intl.formatMessage(
                            wide ? appMessages.narrowPanel : appMessages.widenPanel,
                        )}
                        size="sm"
                        className={styles.widen}
                        onPress={() => setSize(wide ? 'normal' : 'wide')}
                    />
                    <IconButton
                        icon={X}
                        label={intl.formatMessage(appMessages.closePanel)}
                        size="sm"
                        onPress={() => navigate(closeHref)}
                    />
                </div>
            </header>
            {item !== undefined ? (
                <div className={styles.actions}>
                    {item.abilities.update !== false ? (
                        <Link
                            href={routePath(
                                { name: 'resource.edit', resource: resource.id, id },
                                basePath,
                            )}
                            className={styles.action}
                        >
                            <Icon icon={Pencil} size="sm" />
                            {intl.formatMessage(appMessages.editItem)}
                        </Link>
                    ) : null}
                    {links.map(({ action, href }) => {
                        const external = /^https?:\/\//.test(href);
                        return (
                            <Link
                                key={action.id}
                                href={href}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                                className={styles.action}
                            >
                                {external ? <Icon icon={ExternalLink} size="sm" /> : null}
                                {action.label}
                            </Link>
                        );
                    })}
                </div>
            ) : null}
            <div className={styles.body}>{content}</div>
        </section>
    );
}
