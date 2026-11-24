import { Suspense, lazy, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { findResource, resolveResource } from '@panneau/core';
import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { Aside, LoadingRegion, Skeleton, usePanneauIntl, usePortalContainer } from '@panneau/ui';

import type { RelatedItemRequests } from '../relatedItems';
import styles from './RelatedItemPanel.module.css';

// The panel loads on first use (decision 0110), with its modal: the app's first page needs neither.
const LazyRelatedItemPanel = lazy(async () => ({
    default: (await import('./RelatedItemPanel')).RelatedItemPanelModal,
}));

export interface RelatedItemPanelSkeletonProps {
    /** The title of the panel: "New Author". */
    title: string;
    onClose: () => void;
}

/** The panel while its form loads: its title, and the skeleton of a few fields (decision 0034). */
export function RelatedItemPanelSkeleton({ title, onClose }: RelatedItemPanelSkeletonProps) {
    // The focus in the panel, where Escape closes it
    const panel = useRef<HTMLElement>(null);
    useEffect(() => {
        panel.current?.focus();
    }, []);
    return (
        <Aside
            ref={panel}
            tabIndex={-1}
            label={title}
            title={title}
            onClose={onClose}
            className={styles.panel}
        >
            <LoadingRegion className={styles.skeleton}>
                {[0, 1, 2].map((index) => (
                    <div key={index} className={styles.skeletonField}>
                        <Skeleton width="8rem" />
                        <Skeleton shape="rect" height="var(--panneau-control-height)" />
                    </div>
                ))}
            </LoadingRegion>
        </Aside>
    );
}

export interface RelatedItemPanelHostProps {
    requests: RelatedItemRequests;
    definition: Definition;
    basePath: string;
}

/**
 * The panel over the page where a relation field creates its item (decision 0110), while a field
 * asks for one: on the right, modal, with the focus in it until it closes. It loads with
 * `import()`, with a skeleton over the page until then.
 */
export function RelatedItemPanelHost({
    requests,
    definition,
    basePath,
}: RelatedItemPanelHostProps) {
    const intl = usePanneauIntl();
    const container = usePortalContainer();
    const request = useSyncExternalStore(requests.subscribe, requests.get, requests.get);
    const resource = request !== null ? findResource(definition, request.resource) : undefined;
    // A resource that the definition doesn't have creates nothing
    useEffect(() => {
        if (request !== null && resource === undefined) {
            request.settle(null);
        }
    }, [request, resource]);
    if (request === null || resource === undefined || container === null) {
        return null;
    }
    const title = intl.formatMessage(appMessages.create, { resource: resource.label.singular });
    return (
        <Suspense
            fallback={
                // Over the page as the panel will be, until its code is there
                createPortal(
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <RelatedItemPanelSkeleton
                                title={title}
                                onClose={() => request.settle(null)}
                            />
                        </div>
                    </div>,
                    // Outside a `PanneauRoot`, in the body, as dialogs
                    container ?? document.body,
                )
            }
        >
            <LazyRelatedItemPanel
                // A new request starts the panel over
                key={request.id}
                resolved={resolveResource(resource)}
                values={request.values}
                definition={definition}
                basePath={basePath}
                onClose={request.settle}
            />
        </Suspense>
    );
}
