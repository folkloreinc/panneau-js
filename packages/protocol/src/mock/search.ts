// The global search of a mock backend.
import type { Item, SearchResponse } from '../schemas/api';
import { SEARCH_MAX_LIMIT, readSearchQuery } from '../search';
import { json, problem } from './http';
import { applyQuery } from './items';
import type { MockState } from './state';

/** The global search of a mock backend (decision 0029). */
export function createMockSearch(state: MockState) {
    const { definition, store, present } = state;
    // The global search (decision 0029): the searchable resources asked for, `limit` items each
    // (5 by default), 20 in all, from 2 characters.
    const search = (
        params: URLSearchParams,
        inScope: (resource: string, list: Item[]) => Item[],
    ): Response => {
        const read = readSearchQuery(params, definition);
        if (read.errors !== undefined) {
            return problem(422, 'The given data was invalid.', {
                type: 'urn:panneau:problem:validation',
                errors: read.errors,
            });
        }
        const { q, limit, resources } = read.query;
        let left = SEARCH_MAX_LIMIT;
        const data: SearchResponse['data'] = resources.flatMap((id) => {
            if (left === 0) {
                return [];
            }
            const searched = definition.resources.find((candidate) => candidate.id === id);
            if (searched === undefined || searched.abilities?.viewAny === false) {
                return [];
            }
            const found = applyQuery(inScope(id, store.get(id) ?? []), { q });
            const items = found
                .slice(0, Math.min(limit, left))
                .map((item) => present(searched, item));
            left -= items.length;
            return items.length > 0 ? [{ resource: id, items, total: found.length }] : [];
        });
        return json(200, { data } satisfies SearchResponse);
    };

    return { search };
}
