import { Definition } from '../schemas';
import { checkAbilities } from './abilities';
import { checkAggregates } from './aggregates';
import { checkAuth } from './auth';
import { checkContext } from './context';
import { checkDashboards } from './dashboards';
import { checkLists } from './lists';
import { createRun } from './run';
import { checkSearch } from './search';
import type { ConformanceOptions, ConformanceReport, ConformanceStatus } from './types';
import { checkWrites } from './writes';

export type {
    ConformanceCheck,
    ConformanceOptions,
    ConformanceReport,
    ConformanceStatus,
} from './types';

/**
 * Runs the protocol's conformance checks against a live backend. Read-only checks always run;
 * checks that write data run only with `writes`. The checks of each domain are in their own
 * module, and run in this order: their ids and their order are those of the report.
 */
export async function runConformance(options: ConformanceOptions): Promise<ConformanceReport> {
    const ctx = createRun(options);
    const { request, run } = ctx;

    await run('definition', 'GET /definition returns a valid definition', async (check) => {
        const reply = await request('/definition');
        if (check.expectStatus(reply, 200)) {
            ctx.state.definition = check.expectSchema(Definition, reply.body, 'The definition');
        }
    });

    await run('definition.resource', 'The definition has the resource to test', async (check) => {
        const current = ctx.state.definition;
        if (current === null) {
            check.skip('No valid definition.');
            return;
        }
        ctx.state.resource =
            (options.resource !== undefined
                ? current.resources.find((candidate) => candidate.id === options.resource)
                : current.resources[0]) ?? null;
        check.expect(
            ctx.state.resource !== null,
            options.resource !== undefined
                ? `The definition has no resource "${options.resource}".`
                : 'The definition has no resources.',
        );
    });

    await checkContext(ctx);
    await checkAuth(ctx);
    await checkLists(ctx);
    await checkAbilities(ctx);
    await checkSearch(ctx);
    await checkAggregates(ctx);
    await checkDashboards(ctx);
    await checkWrites(ctx);

    return {
        passed: ctx.checks.every((check) => check.status !== 'failed'),
        checks: ctx.checks,
    };
}

/** Formats a report as text, one line per check. */
export function formatReport(report: ConformanceReport): string {
    const symbols: Record<ConformanceStatus, string> = { passed: '✓', failed: '✗', skipped: '-' };
    return report.checks
        .map((check) =>
            [
                `${symbols[check.status]} ${check.title}`,
                ...check.issues.map((issue) => `    ${issue}`),
            ].join('\n'),
        )
        .join('\n');
}
