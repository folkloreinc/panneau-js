import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createMockBackend } from './index';

function createBackend() {
    return createMockBackend({
        definition: createDefinition(),
        items: {
            pages: [
                {
                    title: { fr: 'Accueil' },
                    status: 'published',
                    published_at: '2026-01-01T00:00:00Z',
                },
                { title: { fr: 'À propos' }, status: 'draft' },
                { title: { fr: 'Contact' }, status: 'draft' },
            ],
            authors: [{ id: 'ada', name: 'Ada' }],
        },
    });
}

const json = (body: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...init.headers },
});

describe('createMockBackend', () => {
    it('serves the definition', async () => {
        const response = await createBackend().fetch('/panneau/api/definition');
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ protocol: 1, name: 'Test site' });
    });

    it('lists, filters, searches, sorts and paginates', async () => {
        const backend = createBackend();
        const list = async (query: string) => {
            const response = await backend.fetch(`/panneau/api/resources/pages?${query}`);
            return (await response.json()) as {
                data: { id: string }[];
                meta: Record<string, number>;
            };
        };
        expect((await list('filter[status]=draft')).data.map((item) => item.id)).toEqual([
            '2',
            '3',
        ]);
        expect((await list('q=propos')).data.map((item) => item.id)).toEqual(['2']);
        expect((await list('sort=-title')).data.map((item) => item.id)).toEqual(['3', '1', '2']);
        expect(await list('perPage=2&page=2')).toMatchObject({
            data: [{ id: '3' }],
            meta: { page: 2, perPage: 2, total: 3, lastPage: 2 },
        });
    });

    it('filters by the bounds of a range, both inclusive and both optional', async () => {
        const backend = createMockBackend({
            definition: createDefinition(),
            items: {
                pages: [
                    { title: { fr: 'Un' }, published_at: '2026-01-01T09:00:00Z', views: 5 },
                    { title: { fr: 'Deux' }, published_at: '2026-01-31T23:00:00Z', views: 50 },
                    { title: { fr: 'Trois' }, published_at: '2026-02-01T00:00:00Z', views: 500 },
                    { title: { fr: 'Quatre' }, published_at: null, views: null },
                ],
            },
        });
        const ids = async (query: string) => {
            const response = await backend.fetch(`/panneau/api/resources/pages?${query}`);
            return ((await response.json()) as { data: { id: string }[] }).data
                .map((item) => item.id)
                .sort();
        };
        const range = 'filter[published_at]';
        expect(await ids(`${range}[from]=2026-01-01&${range}[to]=2026-01-31`)).toEqual(['1', '2']);
        expect(await ids(`${range}[from]=2026-01-31`)).toEqual(['2', '3']);
        expect(await ids(`${range}[to]=2026-01-01`)).toEqual(['1']);
        expect(await ids(`${range}[from]=2027-01-01`)).toEqual([]);
        // Numbers compare as numbers, not as strings.
        expect(await ids('filter[views][from]=10&filter[views][to]=100')).toEqual(['2']);
    });

    it('validates values with the portable rules', async () => {
        const response = await createBackend().fetch(
            '/panneau/api/resources/pages',
            json({ title: { fr: 'Nouvelle' }, status: 'archived' }, { method: 'POST' }),
        );
        expect(response.status).toBe(422);
        expect(response.headers.get('Content-Type')).toBe('application/problem+json');
        expect(await response.json()).toMatchObject({
            status: 422,
            errors: {
                'title.en': ['This field is required.'],
                status: ['This value is not one of the choices.'],
            },
        });
    });

    it('creates, updates with versions, and deletes', async () => {
        const backend = createBackend();
        const created = await backend.fetch(
            '/panneau/api/resources/pages',
            json({ title: { fr: 'Nouvelle', en: 'New' }, status: 'draft' }, { method: 'POST' }),
        );
        expect(created.status).toBe(201);
        expect(created.headers.get('ETag')).toBe('"1"');
        const { data } = (await created.json()) as { data: { id: string } };

        const stale = await backend.fetch(
            `/panneau/api/resources/pages/${data.id}`,
            json({ status: 'published' }, { method: 'PATCH', headers: { 'If-Match': '"0"' } }),
        );
        expect(stale.status).toBe(412);
        expect(await stale.json()).toMatchObject({ current: { id: data.id, version: '1' } });

        const updated = await backend.fetch(
            `/panneau/api/resources/pages/${data.id}`,
            json({ status: 'draft' }, { method: 'PATCH', headers: { 'If-Match': '"1"' } }),
        );
        expect(updated.status).toBe(200);
        expect(updated.headers.get('ETag')).toBe('"2"');

        const deleted = await backend.fetch(`/panneau/api/resources/pages/${data.id}`, {
            method: 'DELETE',
        });
        expect(deleted.status).toBe(204);
        expect((await backend.fetch(`/panneau/api/resources/pages/${data.id}`)).status).toBe(404);
    });

    it('runs the delete action on a query selection', async () => {
        const backend = createBackend();
        const response = await backend.fetch(
            '/panneau/api/resources/pages/actions/delete',
            json(
                { selection: { query: { filter: { status: 'draft' } }, except: ['3'] } },
                { method: 'POST' },
            ),
        );
        expect(await response.json()).toMatchObject({
            summary: { succeeded: 1, failed: 0, skipped: 0 },
        });
        expect(backend.items('pages').map((item) => item.id)).toEqual(['1', '3']);
    });

    it('answers unknown routes with a 404 problem', async () => {
        const response = await createBackend().fetch('/panneau/api/resources/unknown');
        expect(response.status).toBe(404);
        expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    });
});

describe('createExampleDefinition', () => {
    it('is a valid definition', async () => {
        const { validateDefinition } = await import('../validate');
        const { createExampleDefinition } = await import('.');
        expect(validateDefinition(createExampleDefinition()).success).toBe(true);
    });
});
