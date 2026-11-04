import { useEffect, useState } from 'react';

import type { RelationReference, RelationSource } from '../shared/relation';

/** A page found: its reference, and its resource. */
export interface FoundPage extends RelationReference {
    resource: string;
}

/**
 * The pages of several resources that match a text, as it is typed: the results of each resource,
 * in the order of the resources.
 */
export function usePageSearch(
    source: RelationSource | null,
    resources: readonly string[],
    query: string,
    { enabled = true, delay = 250 }: { enabled?: boolean; delay?: number } = {},
): { items: FoundPage[]; isLoading: boolean } {
    const key = `${resources.join('\u0000')}\u0001${query}`;
    const [state, setState] = useState<{ key: string; items: FoundPage[]; isLoading: boolean }>({
        key: '',
        items: [],
        isLoading: false,
    });
    useEffect(() => {
        if (source === null || !enabled) {
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setState((current) => ({ ...current, key, isLoading: true }));
            // The resources and the query, from the key that stands for them
            const [joined = '', text = ''] = key.split('\u0001');
            Promise.all(
                joined.split('\u0000').map((resource) =>
                    source
                        .search(resource, text, { signal: controller.signal })
                        .then((items) => items.map((item) => ({ ...item, resource })))
                        .catch(() => [] as FoundPage[]),
                ),
            )
                .then((lists) => {
                    if (!controller.signal.aborted) {
                        setState({ key, items: lists.flat(), isLoading: false });
                    }
                })
                .catch(() => undefined);
        }, delay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [source, key, enabled, delay]);
    return { items: state.items, isLoading: state.isLoading || state.key !== key };
}
