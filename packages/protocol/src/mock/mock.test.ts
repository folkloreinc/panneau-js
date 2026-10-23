import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createExampleDefinition, createMockBackend } from './index';

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

    it('answers a dry run of an action with dryRun, without changing anything', async () => {
        const backend = createBackend();
        const before = backend.items('pages').map((item) => item.id);
        const response = await backend.fetch(
            '/panneau/api/resources/pages/actions/publish',
            json({ selection: { query: {} }, dryRun: true }, { method: 'POST' }),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
            summary: { succeeded: before.length, failed: 0, skipped: 0 },
        });
        expect(backend.items('pages').map((item) => item.id)).toEqual(before);
        const unsupported = await backend.fetch(
            '/panneau/api/resources/pages/actions/delete',
            json({ selection: { query: {} }, dryRun: true }, { method: 'POST' }),
        );
        expect(unsupported.status).toBe(400);
        expect(backend.items('pages').map((item) => item.id)).toEqual(before);
    });

    it('stores the upload a file value references, and refuses an unknown one', async () => {
        const backend = createMockBackend({ definition: createExampleDefinition() });
        const signed = (await (
            await backend.fetch(
                '/panneau/api/uploads/sign',
                json(
                    { method: 'PUT', key: 'terms.pdf', contentType: 'application/pdf' },
                    { method: 'POST' },
                ),
            )
        ).json()) as { upload: string };
        await backend.fetch(
            `/panneau/api/uploads/${signed.upload}/complete`,
            json({ name: 'terms.pdf' }, { method: 'POST' }),
        );
        const values = { title: { fr: 'Conditions', en: 'Terms' }, status: 'draft' };

        const created = await backend.fetch(
            '/panneau/api/resources/pages',
            json(
                { ...values, attachment: { upload: signed.upload, mime: 'application/pdf' } },
                { method: 'POST' },
            ),
        );
        expect(created.status).toBe(201);
        expect(
            ((await created.json()) as { data: Record<string, unknown> }).data.attachment,
        ).toEqual({
            name: 'terms.pdf',
            url: `https://storage.test/uploads/${signed.upload}`,
            mime: 'application/pdf',
            size: null,
        });

        const unknown = await backend.fetch(
            '/panneau/api/resources/pages',
            json({ ...values, attachment: { upload: 'upl_unknown' } }, { method: 'POST' }),
        );
        expect(unknown.status).toBe(422);
        expect(await unknown.json()).toMatchObject({
            errors: { attachment: ['This upload does not exist.'] },
        });
    });

    it('makes media from uploads, filters them by type, and references them', async () => {
        const backend = createMockBackend({ definition: createExampleDefinition() });
        const post = async (path: string, body: unknown) =>
            backend.fetch(`/panneau/api${path}`, json(body, { method: 'POST' }));
        const signed = (await (
            await post('/uploads/sign', { method: 'PUT', key: 'portrait.jpg' })
        ).json()) as { upload: string };
        await post(`/uploads/${signed.upload}/complete`, { name: 'portrait.jpg' });

        const created = await post('/resources/media', {
            file: { upload: signed.upload, mime: 'image/jpeg', size: 2048 },
            name: 'Portrait',
            media: { type: 'video' },
        });
        expect(created.status).toBe(201);
        const media = ((await created.json()) as { data: { id: string; media: unknown } }).data;
        expect(media.media).toEqual({
            type: 'image',
            mime: 'image/jpeg',
            size: 2048,
            url: `https://storage.test/uploads/${signed.upload}`,
            thumbnailUrl: `https://storage.test/uploads/${signed.upload}`,
            status: 'ready',
        });

        const images = await backend.fetch('/panneau/api/resources/media?filter[type]=image');
        expect(((await images.json()) as { data: unknown[] }).data).toHaveLength(1);
        const videos = await backend.fetch('/panneau/api/resources/media?filter[type]=video');
        expect(((await videos.json()) as { data: unknown[] }).data).toHaveLength(0);

        const author = await post('/resources/authors', {
            name: 'Ada',
            photo: { id: media.id, transform: { rotate: 90 } },
        });
        expect(((await author.json()) as { data: Record<string, unknown> }).data.photo).toEqual({
            id: media.id,
            label: 'Portrait',
            media: expect.objectContaining({ type: 'image' }),
            transform: { rotate: 90 },
        });
        const unknown = await post('/resources/authors', { name: 'Grace', photo: 'med_unknown' });
        expect(unknown.status).toBe(422);
        expect(await unknown.json()).toMatchObject({
            errors: { photo: ['This media does not exist.'] },
        });
    });

    it('references images, checks the crop rule, and gives the own transform of a media', async () => {
        const definition = createExampleDefinition();
        const library = definition.resources.find((resource) => resource.id === 'media');
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        if (library === undefined || authors === undefined) {
            throw new Error('The example has no media library or no authors.');
        }
        library.fields.push({ name: 'transform', type: 'transform' });
        authors.fields.push({
            name: 'cover',
            type: 'image',
            rules: [{ rule: 'crop', value: { ratios: ['16:9'], required: true } }],
        });
        const backend = createMockBackend({ definition });
        const post = async (path: string, body: unknown) =>
            backend.fetch(`/panneau/api${path}`, json(body, { method: 'POST' }));
        const signed = (await (
            await post('/uploads/sign', { method: 'PUT', key: 'hiker.jpg' })
        ).json()) as { upload: string };
        await post(`/uploads/${signed.upload}/complete`, { name: 'hiker.jpg' });

        // A photo stored sideways, which its library turns upright.
        const created = await post('/resources/media', {
            file: { upload: signed.upload, mime: 'image/jpeg', size: 2048 },
            name: 'Hiker',
            transform: { rotate: 90 },
        });
        const media = ((await created.json()) as { data: { id: string; media: unknown } }).data;
        expect(media.media).toEqual(expect.objectContaining({ transform: { rotate: 90 } }));

        const uncropped = await post('/resources/authors', { name: 'Ada', cover: media.id });
        expect(uncropped.status).toBe(422);
        expect(await uncropped.json()).toMatchObject({
            errors: { cover: ['Crop this image to 16:9.'] },
        });

        const transform = {
            base: 'media',
            baseTransform: { rotate: 90 },
            crop: { x: 0, y: 900, width: 3024, height: 1701 },
        };
        const author = await post('/resources/authors', {
            name: 'Ada',
            cover: { id: media.id, transform },
        });
        expect(author.status).toBe(201);
        const cover = ((await author.json()) as { data: Record<string, unknown> }).data.cover;
        expect(cover).toEqual({
            id: media.id,
            label: 'Hiker',
            media: expect.objectContaining({ transform: { rotate: 90 } }),
            transform,
        });

        // The media's own transform changes: its references give the new one.
        const updated = await backend.fetch(
            `/panneau/api/resources/media/${media.id}`,
            json({ transform: { rotate: 270 } }, { method: 'PATCH' }),
        );
        expect(((await updated.json()) as { data: { media: unknown } }).data.media).toEqual(
            expect.objectContaining({ transform: { rotate: 270 } }),
        );
    });

    it('needs the library of the media of a field that allows several', async () => {
        const definition = createExampleDefinition();
        const library = definition.resources.find((resource) => resource.id === 'media');
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        if (library === undefined || authors === undefined) {
            throw new Error('The example has no media library or no authors.');
        }
        definition.resources.push({ ...library, id: 'documents' });
        authors.fields.push({ name: 'files', type: 'media', multiple: true });
        const backend = createMockBackend({ definition });
        const post = async (path: string, body: unknown) =>
            backend.fetch(`/panneau/api${path}`, json(body, { method: 'POST' }));
        const make = async (resource: string, name: string) => {
            const signed = (await (
                await post('/uploads/sign', { method: 'PUT', key: `${name}.pdf` })
            ).json()) as { upload: string };
            await post(`/uploads/${signed.upload}/complete`, { name: `${name}.pdf` });
            const created = await post(`/resources/${resource}`, {
                file: { upload: signed.upload, mime: 'application/pdf', size: 1024 },
                name,
            });
            return ((await created.json()) as { data: { id: string } }).data.id;
        };
        const image = await make('media', 'Poster');
        const document = await make('documents', 'Contract');

        const author = await post('/resources/authors', {
            name: 'Ada',
            files: [
                { id: image, resource: 'media' },
                { id: document, resource: 'documents' },
            ],
        });
        expect(author.status).toBe(201);
        expect(((await author.json()) as { data: Record<string, unknown> }).data.files).toEqual([
            expect.objectContaining({ id: image, resource: 'media', label: 'Poster' }),
            expect.objectContaining({ id: document, resource: 'documents', label: 'Contract' }),
        ]);

        // Ids are unique only within their library: an id alone is ambiguous.
        const unnamed = await post('/resources/authors', { name: 'Grace', files: [image] });
        expect(unnamed.status).toBe(422);
        expect(await unnamed.json()).toMatchObject({
            errors: { 'files.0': ['This field allows several libraries: name the library.'] },
        });
        const elsewhere = await post('/resources/authors', {
            name: 'Grace',
            files: [{ id: image, resource: 'documents' }],
        });
        expect(await elsewhere.json()).toMatchObject({
            errors: { 'files.0': ['This media does not exist.'] },
        });
    });

    it('returns a preview URL of an item with the posted values', async () => {
        const backend = createBackend();
        const [first] = backend.items('pages');
        const response = await backend.fetch(
            `/panneau/api/resources/pages/${first?.id ?? ''}/preview`,
            json({ title: { fr: 'Accueil <modifié>' } }, { method: 'POST' }),
        );
        expect(response.status).toBe(200);
        const { url, expiresAt } = (await response.json()) as { url: string; expiresAt: string };
        expect(url.startsWith('data:text/html')).toBe(true);
        expect(decodeURIComponent(url)).toContain('Accueil &#60;modifié&#62;');
        expect(Number.isNaN(Date.parse(expiresAt))).toBe(false);

        const custom = createMockBackend({
            definition: createDefinition(),
            items: { pages: [{ id: '1', title: { fr: 'Accueil' } }] },
            previewUrl: ({ resource, item }) => `https://example.com/${resource}/${item.id}`,
        });
        const answer = await custom.fetch(
            '/panneau/api/resources/pages/1/preview',
            json({}, { method: 'POST' }),
        );
        expect(await answer.json()).toMatchObject({ url: 'https://example.com/pages/1' });
        expect(
            (await custom.fetch('/panneau/api/resources/pages/2/preview', { method: 'POST' }))
                .status,
        ).toBe(404);
    });

    it('searches the resources with a list search, from 2 characters', async () => {
        const backend = createBackend();
        const search = async (query: string) => {
            const response = await backend.fetch(`/panneau/api/search?${query}`);
            return {
                status: response.status,
                body: (await response.json()) as {
                    data: { resource: string; items: { title: unknown }[]; total: number }[];
                    errors?: Record<string, string[]>;
                },
            };
        };
        const { body } = await search('q=acc');
        expect(body.data.map(({ resource, total }) => [resource, total])).toEqual([['pages', 1]]);
        expect(body.data[0]?.items[0]?.title).toEqual({ fr: 'Accueil' });

        // "Accueil" and "Contact"
        const limited = await search('q=ac&limit=1&resources=pages');
        expect(limited.status).toBe(200);
        expect(limited.body.data.map(({ items, total }) => [items.length, total])).toEqual([
            [1, 2],
        ]);
    });

    it('refuses an invalid search with a 422 problem', async () => {
        const backend = createBackend();
        const errors = async (query: string) => {
            const response = await backend.fetch(`/panneau/api/search?${query}`);
            expect(response.status).toBe(422);
            expect(response.headers.get('Content-Type')).toBe('application/problem+json');
            return Object.keys(((await response.json()) as { errors: object }).errors);
        };
        expect(await errors('q=a')).toEqual(['q']);
        expect(await errors('q=acc&limit=0')).toEqual(['limit']);
        expect(await errors('q=acc&limit=21')).toEqual(['limit']);
        expect(await errors('q=acc&resources=unknown')).toEqual(['resources']);
    });

    it('checks a slug per locale, and suggests a free one', async () => {
        const backend = createMockBackend({
            definition: createExampleDefinition(),
            items: {
                pages: [
                    { id: '1', title: { fr: 'Été' }, slug: { fr: 'ete', en: 'summer' } },
                    { id: '2', title: { fr: 'Été 2' }, slug: { fr: 'ete-2' } },
                ],
            },
        });
        const check = async (body: unknown, field = 'slug') =>
            backend.fetch(
                `/panneau/api/resources/pages/fields/${field}/check`,
                json(body, { method: 'POST' }),
            );

        expect(await (await check({ value: 'ete', locale: 'fr', id: null })).json()).toEqual({
            available: false,
            suggestion: 'ete-3',
            prefix: 'https://example.com/',
            url: 'https://example.com/ete',
        });
        // The item's own slug, and another locale
        expect(await (await check({ value: 'ete', locale: 'fr', id: '1' })).json()).toMatchObject({
            available: true,
            suggestion: null,
        });
        expect(await (await check({ value: 'ete', locale: 'en', id: null })).json()).toMatchObject({
            available: true,
        });
        expect((await check({ value: 'x' }, 'title')).status).toBe(404);
        expect((await check({ locale: 'fr' })).status).toBe(422);
    });

    it('resolves embeds, and refuses URLs it can not embed', async () => {
        const backend = createBackend();
        const embed = async (url: string) =>
            backend.fetch(`/panneau/api/embeds?url=${encodeURIComponent(url)}`);
        const video = await embed('https://www.youtube.com/watch?v=abc');
        expect(await video.json()).toMatchObject({
            data: {
                url: 'https://www.youtube.com/watch?v=abc',
                type: 'video',
                provider: 'YouTube',
            },
        });
        expect(await (await embed('https://example.com/a')).json()).toMatchObject({
            data: { type: 'link', title: 'example.com' },
        });
        expect((await embed('not a url')).status).toBe(422);
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
