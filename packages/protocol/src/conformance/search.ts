import type { Definition, Resource } from '../schemas';
import { ListResponse, SearchResponse } from '../schemas/api';
import {
    SEARCH_DEFAULT_LIMIT,
    SEARCH_MAX_LIMIT,
    type SearchQuery,
    isSearchableResource,
    toSearchQueryParams,
} from '../search';
import { UNKNOWN, textOf } from './check';
import { type ConformanceRun } from './run';

/**
 * The global search: a word of the title of an item of a searchable resource finds it.
 */
export async function checkSearch(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition, resource } = ctx.state;

    // The global search: a word of the title of an item of a searchable resource finds it.
    let searched: { resource: Resource; term: string } | null = null;
    const searchSkip = (): string | null => {
        const current = definition as Definition | null;
        if (current === null) {
            return 'No valid definition.';
        }
        if (current.search?.enabled === false) {
            return 'The definition disables the global search.';
        }
        return searched === null
            ? 'No searchable resource has an item with a title to search for.'
            : null;
    };
    const search = (query: SearchQuery) => request(`/search?${toSearchQueryParams(query)}`);

    await run('search', 'GET /search finds items of the searchable resources', async (check) => {
        const current = definition as Definition | null;
        const tested = resource as Resource | null;
        if (current === null || current.search?.enabled === false) {
            check.skip(searchSkip() ?? '');
            return;
        }
        const candidates = current.resources
            .filter(
                (candidate) =>
                    isSearchableResource(candidate) && candidate.abilities?.viewAny !== false,
            )
            // The tested resource first
            .sort((a, b) => Number(b.id === tested?.id) - Number(a.id === tested?.id));
        for (const candidate of candidates) {
            if (candidate.itemTitle === undefined || searched !== null) {
                continue;
            }
            const reply = await request(
                `/resources/${encodeURIComponent(candidate.id)}?page=1&perPage=1`,
            );
            const list = ListResponse.safeParse(reply.body);
            const title = list.success ? textOf(list.data.data[0]?.[candidate.itemTitle]) : null;
            const term = title?.split(/\s+/).find((word) => word.length >= 2);
            if (term !== undefined) {
                searched = { resource: candidate, term };
            }
        }
        const reason = searchSkip();
        if (reason !== null || searched === null) {
            check.skip(reason ?? '');
            return;
        }
        const { resource: target, term } = searched as { resource: Resource; term: string };
        const reply = await search({ q: term });
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const results = check.expectSchema(SearchResponse, reply.body, 'The results');
        if (results === null) {
            return;
        }
        const ids = candidates.map((candidate) => candidate.id);
        for (const group of results.data) {
            check.expect(
                ids.includes(group.resource),
                `Results of "${group.resource}", which is not a searchable resource.`,
            );
            check.expect(
                group.items.length <= SEARCH_DEFAULT_LIMIT,
                `"${group.resource}" has ${group.items.length} results; without a limit, at most ${SEARCH_DEFAULT_LIMIT}.`,
            );
        }
        const count = results.data.reduce((total, group) => total + group.items.length, 0);
        check.expect(
            count <= SEARCH_MAX_LIMIT,
            `The results have ${count} items, at most ${SEARCH_MAX_LIMIT}.`,
        );
        check.expect(
            results.data.some((group) => group.resource === target.id && group.items.length > 0),
            `Searching "${term}", a word of the title of an item of "${target.id}", finds none of its items.`,
        );
    });

    await run('search.scope', 'GET /search reads limit and resources', async (check) => {
        const reason = searchSkip();
        if (reason !== null || searched === null) {
            check.skip(reason ?? '');
            return;
        }
        const { resource: target, term } = searched as { resource: Resource; term: string };
        const reply = await search({ q: term, limit: 1, resources: [target.id] });
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const results = check.expectSchema(SearchResponse, reply.body, 'The results');
        if (results !== null) {
            check.expect(
                results.data.length === 1 &&
                    results.data[0]?.resource === target.id &&
                    results.data[0].items.length === 1,
                `With limit=1&resources=${target.id}, expected one item of "${target.id}", got ${JSON.stringify(results.data.map((group) => [group.resource, group.items.length]))}.`,
            );
        }
    });

    await run(
        'search.invalid',
        'An invalid search is a 422 problem, with errors keyed by parameter',
        async (check) => {
            const reason = searchSkip();
            if (reason !== null || searched === null) {
                check.skip(reason ?? '');
                return;
            }
            const { term } = searched as { resource: Resource; term: string };
            const invalid: [string, SearchQuery][] = [
                ['q', { q: term.slice(0, 1) }],
                ['limit', { q: term, limit: 0 }],
                ['limit', { q: term, limit: SEARCH_MAX_LIMIT + 1 }],
                ['resources', { q: term, resources: [UNKNOWN] }],
            ];
            for (const [parameter, query] of invalid) {
                const failure = check.expectProblem(await search(query), 422);
                if (failure !== null) {
                    check.expect(
                        failure.errors?.[parameter] !== undefined,
                        `${toSearchQueryParams(query)}: the 422 problem must have errors.${parameter}.`,
                    );
                }
            }
        },
    );
}
