import { useEffect, useSyncExternalStore } from 'react';

import { findResource, resolveResource } from '@panneau/core';
import type { Definition } from '@panneau/protocol';

import type { RelatedItemRequests } from '../relatedItems';
import { RelatedItemPanelModal } from './RelatedItemPanel';

export interface RelatedItemPanelHostProps {
    requests: RelatedItemRequests;
    definition: Definition;
    basePath: string;
}

/**
 * The panel over the page where a relation field creates its item (decision 0110), while a field
 * asks for one: on the right, modal, with the focus in it until it closes.
 *
 * It isn't loaded with `import()`: what it needs (the form, the aside, the modal) is already in the
 * first page's JavaScript, and a chunk of its own would split the modules it shares with that page
 * into many small chunks, which weigh more than the panel itself.
 */
export function RelatedItemPanelHost({
    requests,
    definition,
    basePath,
}: RelatedItemPanelHostProps) {
    const request = useSyncExternalStore(requests.subscribe, requests.get, requests.get);
    const resource = request !== null ? findResource(definition, request.resource) : undefined;
    // A resource that the definition doesn't have creates nothing
    useEffect(() => {
        if (request !== null && resource === undefined) {
            request.settle(null);
        }
    }, [request, resource]);
    if (request === null || resource === undefined) {
        return null;
    }
    return (
        <RelatedItemPanelModal
            // A new request starts the panel over
            key={request.id}
            resolved={resolveResource(resource)}
            values={request.values}
            definition={definition}
            basePath={basePath}
            onClose={request.settle}
        />
    );
}
