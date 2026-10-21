import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createMockBackend } from '../mock';
import { formatReport, runConformance } from './index';

function createBackend() {
    return createMockBackend({
        definition: createDefinition(),
        items: {
            pages: [
                {
                    title: { fr: 'Accueil', en: 'Home' },
                    status: 'published',
                    published_at: '2026-10-01T12:00:00Z',
                },
                { title: { fr: 'Contact', en: 'Contact' }, status: 'draft', published_at: null },
            ],
        },
    });
}

const writes = {
    create: { title: { fr: 'Nouvelle', en: 'New' }, status: 'draft' },
    update: { status: 'published', published_at: '2026-10-14T12:00:00Z' },
};

describe('runConformance', () => {
    it('passes against the mock backend', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
            writes,
        });
        expect(formatReport(report)).not.toContain('✗');
        expect(report.passed).toBe(true);
        expect(report.checks.filter((check) => check.status === 'skipped')).toEqual([]);
    });

    it('skips the write checks unless asked', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(report.passed).toBe(true);
        expect(
            report.checks.filter((check) => check.status === 'skipped').map((check) => check.id),
        ).toEqual(['create.invalid', 'create', 'update', 'update.conflict', 'delete']);
    });

    it('reports what a backend gets wrong', async () => {
        const backend = createBackend();
        // A backend that drops ETags and answers errors with HTML.
        const broken = async (input: string, init?: RequestInit) => {
            const response = await backend.fetch(input, init);
            if (response.status >= 400) {
                return new Response('<h1>Error</h1>', {
                    status: response.status,
                    headers: { 'Content-Type': 'text/html' },
                });
            }
            const headers = new Headers(response.headers);
            headers.delete('ETag');
            return new Response(response.body, { status: response.status, headers });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: broken,
            writes,
        });
        const failed = report.checks
            .filter((check) => check.status === 'failed')
            .map((check) => check.id);
        expect(report.passed).toBe(false);
        expect(failed).toEqual([
            'uploads.sign',
            'list.unknown-resource',
            'item',
            'item.missing',
            'create.invalid',
            'update.conflict',
            'delete',
        ]);
        expect(formatReport(report)).toContain(
            'Expected content type application/problem+json, got "text/html".',
        );
    });

    it('reports a backend that ignores the bounds of a range filter', async () => {
        const backend = createBackend();
        // A backend that only knows `filter[id]` and `filter[id][]`.
        const withoutRanges = (input: string, init?: RequestInit) => {
            const url = new URL(input);
            [...url.searchParams.keys()]
                .filter((key) => /\]\[(from|to)\]$/.test(key))
                .forEach((key) => url.searchParams.delete(key));
            return backend.fetch(url.toString(), init);
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: withoutRanges,
        });
        const range = report.checks.find((check) => check.id === 'list.filter-range');
        expect(range?.status).toBe('failed');
        expect(range?.issues).toEqual([
            'Filtered from 9999-12-31, the list has 2 items, expected 0.',
        ]);
    });

    it('skips the range check when the resource has no date-range filter', async () => {
        const definition = createDefinition();
        definition.resources.forEach((resource) => {
            if (resource.list !== undefined) {
                resource.list.filters = [];
            }
        });
        const backend = createMockBackend({ definition });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(report.checks.find((check) => check.id === 'list.filter-range')).toMatchObject({
            status: 'skipped',
            issues: ['The resource declares no date-range filter.'],
        });
    });
});
