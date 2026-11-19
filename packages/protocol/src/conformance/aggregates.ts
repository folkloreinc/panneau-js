import type { z } from 'zod';

import { toAggregateParams } from '../aggregates';
import { BreakdownWidgetData, type Definition, SeriesWidgetData, StatWidgetData } from '../schemas';
import { ListResponse } from '../schemas/api';
import { UNKNOWN, expectPeriods } from './check';
import { type ConformanceRun } from './run';

/**
 * The aggregates of the lists (decision 0084).
 */
export async function checkAggregates(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition } = ctx.state;

    // The aggregates of the lists (decision 0084): each declared measure and group answers in the
    // shape of a widget, and what isn't declared is a 422.
    const aggregated = () =>
        ((definition as Definition | null)?.resources ?? []).filter(
            (candidate) =>
                candidate.list?.aggregates !== undefined && candidate.abilities?.viewAny !== false,
        );
    const aggregate = (id: string, params: URLSearchParams) =>
        request(`/resources/${encodeURIComponent(id)}/aggregate?${params.toString()}`);

    await run(
        'list.aggregate',
        'GET /resources/{resource}/aggregate answers the declared aggregates in the shape of a widget',
        async (check) => {
            const resources = aggregated();
            if (resources.length === 0) {
                check.skip('No resource declares aggregates.');
                return;
            }
            for (const current of resources) {
                const aggregates = current.list?.aggregates ?? {};
                const label = (params: URLSearchParams) =>
                    `The aggregate of "${current.id}" (${decodeURIComponent(params.toString())})`;
                const fetchShape = async <T extends z.ZodType>(
                    params: URLSearchParams,
                    schema: T,
                ) => {
                    const reply = await aggregate(current.id, params);
                    if (
                        !check.expect(
                            reply.status === 200,
                            `${label(params)}: expected status 200, got ${reply.status}.`,
                        )
                    ) {
                        return null;
                    }
                    return check.expectSchema(schema, reply.body, label(params));
                };
                // The count is the total of the list
                const count = await fetchShape(toAggregateParams({}), StatWidgetData);
                const list = await request(
                    `/resources/${encodeURIComponent(current.id)}?perPage=1`,
                );
                const total =
                    list.status === 200 && ListResponse.safeParse(list.body).success
                        ? (list.body as ListResponse).meta.total
                        : undefined;
                if (count !== null && typeof total === 'number') {
                    check.expect(
                        count.value === total,
                        `The count of "${current.id}" is ${count.value}; its list has ${total} items.`,
                    );
                }
                for (const field of aggregates.sum ?? []) {
                    await fetchShape(
                        toAggregateParams({ measure: `sum:${field}` }),
                        StatWidgetData,
                    );
                }
                for (const field of aggregates.groupBy ?? []) {
                    await fetchShape(toAggregateParams({ group: field }), BreakdownWidgetData);
                }
                for (const field of aggregates.dates ?? []) {
                    for (const period of ['day', 'week', 'month'] as const) {
                        const params = toAggregateParams({ group: `${period}:${field}` });
                        const series = await fetchShape(params, SeriesWidgetData);
                        if (series === null) {
                            continue;
                        }
                        check.expect(
                            series.period === period,
                            `${label(params)}: expected the period ${period}, got ${series.period}.`,
                        );
                        expectPeriods(check, series.points, period, label(params));
                    }
                    // The bounds of the date-range filter on the date are the range of the series
                    const filter = current.list?.filters?.find(
                        (candidate) => candidate.id === field && candidate.type === 'date-range',
                    );
                    if (filter === undefined) {
                        continue;
                    }
                    const params = toAggregateParams({
                        filter: { [field]: { from: '2026-01-01', to: '2026-01-07' } },
                        group: `day:${field}`,
                    });
                    const series = await fetchShape(params, SeriesWidgetData);
                    if (series !== null) {
                        const dates = series.points.map((point) => point.date);
                        check.expect(
                            dates.length === 7 &&
                                dates[0] === '2026-01-01' &&
                                dates[6] === '2026-01-07',
                            `${label(params)}: expected a point per day from 2026-01-01 to 2026-01-07, got ${dates.length > 0 ? `${dates[0]} to ${dates.at(-1)}` : 'none'}.`,
                        );
                    }
                }
            }
        },
    );

    await run(
        'list.aggregate.invalid',
        'GET /resources/{resource}/aggregate refuses undeclared fields and bad measures or groups with a 422',
        async (check) => {
            const resources = aggregated();
            if (resources.length === 0) {
                check.skip('No resource declares aggregates.');
                return;
            }
            for (const current of resources) {
                const date = current.list?.aggregates?.dates?.[0] ?? 'created_at';
                const invalid: [Record<string, string>, string][] = [
                    [{ measure: 'average' }, 'measure'],
                    [{ measure: `sum:${UNKNOWN}` }, 'measure'],
                    [{ group: UNKNOWN }, 'group'],
                    [{ group: `day:${UNKNOWN}` }, 'group'],
                    [{ group: `year:${date}` }, 'group'],
                ];
                for (const [params, key] of invalid) {
                    const reply = await aggregate(current.id, new URLSearchParams(params));
                    const refused = check.expectProblem(reply, 422);
                    if (refused !== null) {
                        check.expect(
                            refused.errors?.[key] !== undefined,
                            `The aggregate of "${current.id}" with ${new URLSearchParams(params).toString()}: expected errors on "${key}".`,
                        );
                    }
                }
            }
            // A resource without aggregates has none
            const without = ((definition as Definition | null)?.resources ?? []).find(
                (candidate) =>
                    candidate.list?.aggregates === undefined &&
                    candidate.abilities?.viewAny !== false,
            );
            if (without !== undefined) {
                check.expectProblem(await aggregate(without.id, toAggregateParams({})), 404);
            }
        },
    );
}
