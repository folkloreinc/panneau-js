import { ExternalLink } from 'lucide-react';
import { createElement } from 'react';
import { Link } from 'react-aria-components';

import { usePlugins } from '@panneau/core';
import { useItemPreview } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { Item, Resource } from '@panneau/protocol';
import { Alert, Button, Icon, Spinner, usePanneauIntl } from '@panneau/ui';

import styles from './ItemPanel.module.css';

export interface ItemPreviewProps {
    resource: Resource;
    item: Item;
    /** The title of the item, for the accessible name of the preview. */
    title: string;
    locale: string;
}

/** Opens the URLs a new tab can: not the `data:` and `blob:` ones of tests and mocks. */
function canOpen(url: string): boolean {
    return /^(https?:)?\/\//.test(url) || url.startsWith('/');
}

function IframePreview({ resource, item, title }: Omit<ItemPreviewProps, 'locale'>) {
    const intl = usePanneauIntl();
    const { data, isError, refetch } = useItemPreview(resource.id, item.id);
    if (data === undefined) {
        return isError ? (
            <Alert tone="danger">
                <p>{intl.formatMessage(appMessages.previewError)}</p>
                <Button size="sm" onPress={() => void refetch()}>
                    {intl.formatMessage(appMessages.retry)}
                </Button>
            </Alert>
        ) : (
            <Spinner showLabel />
        );
    }
    return (
        <div className={styles.preview}>
            {canOpen(data.url) ? (
                <Link
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.previewLink}
                >
                    <Icon icon={ExternalLink} size="sm" />
                    {intl.formatMessage(appMessages.openPreview)}
                </Link>
            ) : null}
            <iframe
                src={data.url}
                title={intl.formatMessage(appMessages.previewOf, { title })}
                className={styles.frame}
            />
        </div>
    );
}

/**
 * The preview of an item, as its resource's `features.preview` says (decision 0009): a component
 * of a plugin (`previews`), or the item's page on the site in an iframe, from a short-lived URL
 * of the backend.
 */
export function ItemPreview({ resource, item, title, locale }: ItemPreviewProps) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const preview = resource.features?.preview ?? null;
    if (preview === null) {
        return null;
    }
    if (preview.mode === 'iframe') {
        return <IframePreview resource={resource} item={item} title={title} />;
    }
    const name = preview.component ?? '';
    const Component = plugins.previews.get(name);
    if (Component === undefined) {
        return (
            <Alert tone="warning">
                {intl.formatMessage(appMessages.previewMissing, { component: name })}
            </Alert>
        );
    }
    return (
        <div className={styles.preview}>{createElement(Component, { item, resource, locale })}</div>
    );
}
