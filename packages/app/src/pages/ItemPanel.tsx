import { ExternalLink, Pencil, X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { Link } from 'react-aria-components';

import type { ResolvedResource } from '@panneau/core';
import { useResourceItem } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import { ItemDetails, type ListColumn, getActionHref, isAllowedOn } from '@panneau/lists';
import { Alert, Button, Heading, Icon, IconButton, Spinner, usePanneauIntl } from '@panneau/ui';

import { navigate } from '../location';
import { routePath } from '../routes';
import styles from './ItemPanel.module.css';
import { getItemTitle } from './itemTitle';

/** Fields that hold other fields, shown in the form rather than in the details. */
const NESTED_TYPES = new Set(['group', 'repeater']);

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
 * Escape closes it.
 */
export function ItemPanel({ resolved, basePath, locale, id, closeHref }: ItemPanelProps) {
    const intl = usePanneauIntl();
    const { resource } = resolved;
    const { data: item, isError, refetch } = useResourceItem(resource.id, id);
    const panel = useRef<HTMLElement>(null);
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
        content = <ItemDetails item={item} columns={columns} />;
    }

    return (
        <section
            ref={panel}
            tabIndex={-1}
            aria-label={label}
            className={styles.panel}
            onKeyDown={onKeyDown}
        >
            <header className={styles.header}>
                <Heading level={2} className={styles.title}>
                    {title}
                </Heading>
                <IconButton
                    icon={X}
                    label={intl.formatMessage(appMessages.closePanel)}
                    size="sm"
                    onPress={() => navigate(closeHref)}
                />
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
