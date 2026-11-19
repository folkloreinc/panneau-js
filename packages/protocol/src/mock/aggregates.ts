// The aggregates of the lists of a mock backend (decision 0084).
import { aggregateItems, getFilterRange, readAggregateQuery } from '../aggregates';
import { fromSearchParams } from '../query';
import { json, problem } from './http';
import { applyQuery } from './items';
import type { MockRoute } from './route';
import type { MockState } from './state';

/** `GET /resources/{resource}/aggregate` (decision 0084). */
export async function answerAggregate(
    state: MockState,
    route: MockRoute,
): Promise<Response | null> {
    const { url, segments, method, resource, scoped } = route;
    // The aggregates of the list (decision 0084): the items the user can list, filtered as the
    // list filters them, counted or summed, and grouped by a period or a field.
    if (segments.length === 3 && segments[2] === 'aggregate' && method === 'GET') {
        if (resource.abilities?.viewAny === false) {
            return problem(403, 'This resource can’t be listed.');
        }
        const aggregates = resource.list?.aggregates;
        if (aggregates === undefined) {
            return problem(404, 'This resource has no aggregates.');
        }
        const read = readAggregateQuery(url.searchParams, aggregates);
        if (read.errors !== undefined) {
            return problem(422, 'The given data was invalid.', {
                type: 'urn:panneau:problem:validation',
                errors: read.errors,
            });
        }
        const query = fromSearchParams(url.searchParams);
        const group = read.query.group;
        return json(
            200,
            aggregateItems(applyQuery(scoped, { ...query, sort: [] }), read.query, {
                fields: [
                    ...resource.fields,
                    ...(resource.types ?? []).flatMap((type) => type.fields),
                ],
                range: group?.type === 'period' ? getFilterRange(query, group.field) : undefined,
            }),
        );
    }
    return null;
}
