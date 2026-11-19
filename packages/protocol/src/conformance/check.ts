// What every check of the conformance kit uses: the replies of the backend, and the issues
// of a check.
import type { z } from 'zod';

import { nextPeriod } from '../aggregates';
import { Problem } from '../schemas/api';
import { PROBLEM_CONTENT_TYPE } from '../version';
import type { WidgetSeriesPeriod } from '../widgets';

/** A reply of the backend, read once. */
export interface Reply {
    status: number;
    contentType: string;
    etag: string | null;
    body: unknown;
}

/** An id or a value that no backend has. */
export const UNKNOWN = '__panneau_conformance_unknown__';

export function describeIssues(error: z.ZodError): string[] {
    return error.issues.slice(0, 10).map((issue) => {
        const path = issue.path.map(String).join('.');
        return path === '' ? issue.message : `${path}: ${issue.message}`;
    });
}

/** The first text of a value: a string, or the first string of a localized value. */
export function textOf(value: unknown): string | null {
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        for (const entry of Object.values(value)) {
            if (typeof entry === 'string' && entry.trim() !== '') {
                return entry;
            }
        }
    }
    return null;
}

export function normalizeEtag(value: string): string {
    return value.replace(/^W\//, '');
}

/** The issues of a check, and why it was skipped. */
export class Check {
    issues: string[] = [];
    skippedBecause: string | null = null;

    expect(condition: boolean, issue: string): boolean {
        if (!condition) {
            this.issues.push(issue);
        }
        return condition;
    }

    expectStatus(reply: Reply, status: number): boolean {
        return this.expect(
            reply.status === status,
            `Expected status ${status}, got ${reply.status}.`,
        );
    }

    expectSchema<T extends z.ZodType>(schema: T, value: unknown, label: string): z.infer<T> | null {
        const result = schema.safeParse(value);
        if (result.success) {
            return result.data;
        }
        this.issues.push(
            `${label} does not match the schema:`,
            ...describeIssues(result.error).map((issue) => `  ${issue}`),
        );
        return null;
    }

    expectProblem(reply: Reply, status: number): Problem | null {
        if (!this.expectStatus(reply, status)) {
            return null;
        }
        this.expect(
            reply.contentType.startsWith(PROBLEM_CONTENT_TYPE),
            `Expected content type ${PROBLEM_CONTENT_TYPE}, got "${reply.contentType}".`,
        );
        return this.expectSchema(Problem, reply.body, 'The error');
    }

    skip(reason: string) {
        this.skippedBecause = reason;
    }
}

/** The points of a series: one per period, each on the first day of its period, going up. */
export function expectPeriods(
    check: Check,
    points: { date: string }[],
    period: WidgetSeriesPeriod,
    label: string,
) {
    points.forEach((point, index) => {
        const previous = points[index - 1];
        if (previous !== undefined) {
            const expected = nextPeriod(previous.date, period);
            check.expect(
                point.date === expected,
                `${label}: after ${previous.date}, expected a point on ${expected}, got ${point.date}.`,
            );
        }
    });
}
