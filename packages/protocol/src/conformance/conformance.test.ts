import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createMockBackend } from '../mock';
import { formatReport, runConformance } from './index';

function createBackend() {
    return createMockBackend({
        definition: createDefinition(),
        items: { pages: [{ title: { fr: 'Accueil', en: 'Home' }, status: 'draft' }] },
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
});
