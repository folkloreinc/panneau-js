import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { EMAIL_UNVERIFIED_PROBLEM_TYPE, TWO_FACTOR_REQUIRED_PROBLEM_TYPE } from '../constants';
import { ListResponse } from '../schemas';
import { type MockMail, type MockUser, createExampleDefinition, createMockBackend } from './index';

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

describe('the context of the mock backend', () => {
    function createContextBackend() {
        const definition = createDefinition();
        definition.context = {
            params: [
                { name: 'site', label: 'Site', options: [{ value: 'main', label: 'Main' }] },
                { name: 'section', label: 'Section' },
            ],
        };
        return createMockBackend({
            definition,
            items: {
                pages: [
                    { title: { fr: 'Accueil' }, site: 'main' },
                    { title: { fr: 'Ailleurs' }, site: 'other' },
                ],
            },
            context: {
                options: (name, before) =>
                    name === 'section' && before.site === 'main'
                        ? [
                              { value: 'news', label: 'News' },
                              { value: 'sports', label: 'Sports' },
                          ]
                        : [],
                scope: (_resource, item, values) =>
                    values.site === undefined || item.site === values.site,
            },
        });
    }
    const headers = (value: string) => ({ headers: { 'Panneau-Context': value } });

    it('builds the definition for the values of the header, with their labels', async () => {
        const response = await createContextBackend().fetch(
            '/panneau/api/definition',
            headers('site=main&section=news'),
        );
        expect(response.headers.get('Vary')).toBe('Panneau-Context');
        const definition = (await response.json()) as {
            context: { params: { value: string | null; valueLabel: string | null }[] };
        };
        expect(definition.context.params).toMatchObject([
            { value: 'main', valueLabel: 'Main' },
            { value: 'news', valueLabel: 'News' },
        ]);
    });

    it('refuses a value that is not a choice with a 403 context problem', async () => {
        const response = await createContextBackend().fetch(
            '/panneau/api/resources/pages',
            headers('site=main&section=weather'),
        );
        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({
            type: 'urn:panneau:problem:context',
            param: 'section',
        });
    });

    it('searches the choices of a param, for the values before it', async () => {
        const backend = createContextBackend();
        const choices = await backend.fetch(
            '/panneau/api/context/section/options?q=spo',
            headers('site=main'),
        );
        expect(await choices.json()).toEqual({ data: [{ value: 'sports', label: 'Sports' }] });
        const unknown = await backend.fetch('/panneau/api/context/season/options');
        expect(unknown.status).toBe(404);
    });

    it('keeps a fixed param to its value, and refuses another one', async () => {
        const definition = createDefinition();
        definition.context = {
            params: [
                { name: 'client', label: 'Client', fixed: true, value: '4', valueLabel: 'Acme' },
                { name: 'contest', label: 'Contest', options: [{ value: '12', label: 'Summer' }] },
            ],
        };
        const backend = createMockBackend({ definition });
        const built = await backend.fetch('/panneau/api/definition', headers('contest=12'));
        expect(await built.json()).toMatchObject({
            context: {
                params: [
                    { name: 'client', value: '4', valueLabel: 'Acme' },
                    { name: 'contest', value: '12' },
                ],
            },
        });
        const same = await backend.fetch('/panneau/api/definition', headers('client=4'));
        expect(same.status).toBe(200);
        const other = await backend.fetch('/panneau/api/definition', headers('client=7'));
        expect(other.status).toBe(403);
        expect(await other.json()).toMatchObject({ param: 'client' });
    });

    it('keeps lists to the items of the context', async () => {
        const response = await createContextBackend().fetch(
            '/panneau/api/resources/pages',
            headers('site=main'),
        );
        const list = ListResponse.parse(await response.json());
        expect(list.data.map((item) => item.site)).toEqual(['main']);
    });
});

describe('createMockBackend', () => {
    it('serves the definition', async () => {
        const response = await createBackend().fetch('/panneau/api/definition');
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ protocol: 1, name: 'Test site' });
    });

    it('duplicates an item under a new id, with every built-in item action allowed', async () => {
        const backend = createBackend();
        const response = await backend.fetch('/panneau/api/resources/pages/2/duplicate', {
            method: 'POST',
        });
        expect(response.status).toBe(201);
        const { data } = (await response.json()) as { data: Record<string, unknown> };
        expect(data).toMatchObject({
            id: '4',
            title: { fr: 'À propos' },
            abilities: { view: true, update: true, duplicate: true, delete: true },
        });
        expect(backend.items('pages').map((item) => item.id)).toEqual(['1', '2', '3', '4']);
        expect(
            (await backend.fetch('/panneau/api/resources/pages/9/duplicate', { method: 'POST' }))
                .status,
        ).toBe(404);
    });

    it('refuses to delete or duplicate items that don’t allow it, as clients read abilities', async () => {
        const backend = createBackend();
        const [first, second] = backend.items('pages');
        if (first === undefined || second === undefined) {
            throw new Error('No pages.');
        }
        // A missing ability doesn't allow, as `false` doesn't
        first.abilities = { view: true };
        second.abilities = { ...second.abilities, delete: false };
        const remove = (body: unknown) =>
            backend.fetch(
                '/panneau/api/resources/pages/actions/delete',
                json(body, { method: 'POST' }),
            );
        const dryRun = await remove({ selection: { ids: ['1', '2', '3'] }, dryRun: true });
        expect(await dryRun.json()).toMatchObject({
            summary: { succeeded: 1, skipped: 2 },
        });
        expect((await remove({ selection: { ids: ['1'] } })).status).toBe(403);
        const response = await remove({ selection: { ids: ['1', '2', '3'] } });
        expect(await response.json()).toMatchObject({
            summary: { succeeded: 1, failed: 0, skipped: 2 },
            results: [
                { id: '1', status: 'skipped', reason: 'forbidden' },
                { id: '2', status: 'skipped', reason: 'forbidden' },
            ],
        });
        expect(backend.items('pages').map((item) => item.id)).toEqual(['1', '2']);
        expect(
            (await backend.fetch('/panneau/api/resources/pages/1/duplicate', { method: 'POST' }))
                .status,
        ).toBe(403);
    });

    it('answers dry runs of the built-in delete', async () => {
        const response = await createBackend().fetch(
            '/panneau/api/resources/authors/actions/delete',
            json({ selection: { ids: ['ada'] }, dryRun: true }, { method: 'POST' }),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ summary: { succeeded: 1, skipped: 0 } });
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

    it('pages a list with cursors when its pagination is cursor', async () => {
        const definition = createDefinition();
        const backend = createMockBackend({
            definition: {
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.id === 'pages'
                        ? { ...resource, list: { ...resource.list, pagination: 'cursor' } }
                        : resource,
                ),
            },
            items: {
                pages: [{ title: { fr: 'A' } }, { title: { fr: 'B' } }, { title: { fr: 'C' } }],
            },
        });
        const list = async (query: string) => {
            const response = await backend.fetch(`/panneau/api/resources/pages?${query}`);
            return { status: response.status, body: (await response.json()) as ListResponse };
        };
        const first = await list('perPage=2');
        expect(first.body.meta).toEqual({ perPage: 2, nextCursor: 'o2', previousCursor: null });
        expect(ListResponse.safeParse(first.body).success).toBe(true);
        const second = await list('perPage=2&cursor=o2');
        expect(second.body.data.map((item) => item.id)).toEqual(['3']);
        expect(second.body.meta).toEqual({ perPage: 2, nextCursor: null, previousCursor: null });
        expect((await list('cursor=nope')).status).toBe(422);
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
        // An action without `dryRun` (the built-in `delete` answers them)
        const unsupported = await backend.fetch(
            '/panneau/api/resources/pages/actions/archive',
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

    it('reads the abilities of resources, items and fields (decision 0046)', async () => {
        const definition = createDefinition();
        const [pages, authors] = definition.resources;
        if (pages === undefined || authors === undefined) {
            throw new Error('No resources.');
        }
        pages.fields.push(
            { name: 'notes', type: 'textarea', abilities: { view: false } },
            { name: 'code', type: 'text', abilities: { update: false } },
        );
        authors.abilities = { viewAny: false, create: false };
        const backend = createMockBackend({
            definition,
            items: {
                pages: [
                    { title: { fr: 'Accueil' }, notes: 'Internal', code: 'a' },
                    {
                        title: { fr: 'Contact' },
                        abilities: { view: false, update: false, delete: false },
                    },
                ],
                authors: [{ id: 'ada', name: 'Ada' }],
            },
        });
        const api = (path: string, init?: RequestInit) =>
            backend.fetch(`/panneau/api/resources/${path}`, init);

        expect((await api('authors')).status).toBe(403);
        expect((await api('authors', json({ name: 'Grace' }, { method: 'POST' }))).status).toBe(
            403,
        );
        // Items leave out the values of hidden fields
        const list = (await (await api('pages')).json()) as { data: Record<string, unknown>[] };
        expect(list.data[0]).not.toHaveProperty('notes');
        expect(list.data[0]).toMatchObject({ code: 'a' });
        // Values of fields the user can't see or update are ignored
        const updated = await api(
            'pages/1',
            json({ status: 'draft', notes: 'Changed', code: 'b' }, { method: 'PATCH' }),
        );
        expect(updated.status).toBe(200);
        expect(backend.items('pages')[0]).toMatchObject({
            status: 'draft',
            notes: 'Internal',
            code: 'a',
        });
        // An item without `view`, `update` or `delete`
        expect((await api('pages/2')).status).toBe(403);
        expect((await api('pages/2', json({}, { method: 'PATCH' }))).status).toBe(403);
        expect((await api('pages/2', { method: 'DELETE' })).status).toBe(403);
    });

    it('answers unknown routes with a 404 problem', async () => {
        const response = await createBackend().fetch('/panneau/api/resources/unknown');
        expect(response.status).toBe(404);
        expect(response.headers.get('Content-Type')).toBe('application/problem+json');
    });
});

describe('the auth of the mock backend', () => {
    function createAuthBackend(onMail: (mail: MockMail) => void = () => undefined) {
        const definition = createDefinition();
        definition.auth = { mode: 'panneau', passwordReset: true, emailVerification: true };
        return createMockBackend({
            definition,
            auth: {
                users: [
                    { email: 'ada@example.com', password: 'secret', name: 'Ada' },
                    { email: 'eve@example.com', password: 'secret', emailVerified: false },
                ],
                loggedIn: null,
                onMail,
            },
        });
    }

    it('refuses guests, and logs in and out', async () => {
        const backend = createAuthBackend();
        const api = (path: string, init?: RequestInit) =>
            backend.fetch(`/panneau/api/${path}`, init);

        expect((await api('definition')).status).toBe(401);
        expect((await api('auth/session')).status).toBe(401);
        const wrong = await api(
            'auth/login',
            json({ email: 'ada@example.com', password: 'wrong' }, { method: 'POST' }),
        );
        expect(wrong.status).toBe(422);

        const login = await api(
            'auth/login',
            json({ email: 'ada@example.com', password: 'secret' }, { method: 'POST' }),
        );
        expect(await login.json()).toEqual({
            user: { id: '1', name: 'Ada', email: 'ada@example.com', abilities: {} },
        });
        const definition = (await (await api('definition')).json()) as { user: { id: string } };
        expect(definition.user.id).toBe('1');

        expect((await api('auth/logout', { method: 'POST' })).status).toBe(204);
        expect((await api('definition')).status).toBe(401);
    });

    it('resets a password through the link of its email', async () => {
        const mails: MockMail[] = [];
        const backend = createAuthBackend((mail) => mails.push(mail));
        const post = (path: string, body: unknown) =>
            backend.fetch(`/panneau/api/${path}`, json(body, { method: 'POST' }));

        expect((await post('auth/password/forgot', { email: 'nobody@example.com' })).status).toBe(
            204,
        );
        expect(mails).toEqual([]);
        expect((await post('auth/password/forgot', { email: 'not an email' })).status).toBe(422);
        expect((await post('auth/password/forgot', { email: 'ada@example.com' })).status).toBe(204);
        const [mail] = mails;
        expect(mail).toMatchObject({ kind: 'password-reset', to: 'ada@example.com' });
        expect(mail?.path).toBe(
            `auth/reset-password?token=${mail?.token ?? ''}&email=ada%40example.com`,
        );

        const reset = { token: mail?.token, email: 'ada@example.com', password: 'new password' };
        expect((await post('auth/password/reset', { ...reset, token: 'wrong' })).status).toBe(422);
        expect((await post('auth/password/reset', { ...reset, password: 'short' })).status).toBe(
            422,
        );
        expect((await post('auth/password/reset', reset)).status).toBe(204);
        // The token is used, and the reset doesn't log in
        expect((await post('auth/password/reset', reset)).status).toBe(422);
        expect((await backend.fetch('/panneau/api/definition')).status).toBe(401);
        const login = await post('auth/login', {
            email: 'ada@example.com',
            password: 'new password',
        });
        expect(login.status).toBe(200);
    });

    it('refuses users whose address is not verified until they verify it', async () => {
        const mails: MockMail[] = [];
        const backend = createAuthBackend((mail) => mails.push(mail));
        const post = (path: string, body?: unknown) =>
            backend.fetch(`/panneau/api/${path}`, json(body ?? {}, { method: 'POST' }));

        expect((await post('auth/email/verification')).status).toBe(401);
        await post('auth/login', { email: 'eve@example.com', password: 'secret' });
        const refused = await backend.fetch('/panneau/api/definition');
        expect(refused.status).toBe(403);
        expect(await refused.json()).toMatchObject({ type: EMAIL_UNVERIFIED_PROBLEM_TYPE });

        expect((await post('auth/email/verification')).status).toBe(204);
        const [mail] = mails;
        expect(mail).toMatchObject({ kind: 'email-verification', to: 'eve@example.com' });
        expect(mail?.path).toBe(`auth/verify-email?token=${mail?.token ?? ''}`);

        expect((await post('auth/email/verify', { token: 'wrong' })).status).toBe(422);
        expect((await post('auth/email/verify', { token: mail?.token })).status).toBe(204);
        expect((await backend.fetch('/panneau/api/definition')).status).toBe(200);
    });
});

describe('two-factor authentication in the mock backend', () => {
    function createTwoFactorBackend(users: MockUser[]) {
        const definition = createDefinition();
        definition.auth = { mode: 'panneau', twoFactor: true };
        return createMockBackend({ definition, auth: { users, loggedIn: null } });
    }
    const post = (backend: ReturnType<typeof createMockBackend>, path: string, body?: unknown) =>
        backend.fetch(`/panneau/api/${path}`, json(body ?? {}, { method: 'POST' }));

    it('asks for a code or a recovery code after the password', async () => {
        const backend = createTwoFactorBackend([
            {
                email: 'ada@example.com',
                password: 'secret',
                twoFactor: true,
                recoveryCodes: ['r1'],
            },
        ]);
        const credentials = { email: 'ada@example.com', password: 'secret' };

        expect((await post(backend, 'auth/two-factor/challenge', { code: '123456' })).status).toBe(
            422,
        );
        const login = await post(backend, 'auth/login', credentials);
        expect(login.status).toBe(202);
        expect(await login.json()).toEqual({ twoFactor: true });
        expect((await backend.fetch('/panneau/api/definition')).status).toBe(401);
        expect((await post(backend, 'auth/two-factor/challenge', { code: '000000' })).status).toBe(
            422,
        );
        expect((await post(backend, 'auth/two-factor/challenge', { code: '123456' })).status).toBe(
            200,
        );
        expect((await backend.fetch('/panneau/api/definition')).status).toBe(200);

        await post(backend, 'auth/logout');
        await post(backend, 'auth/login', credentials);
        const recovery = { recoveryCode: 'r1' };
        expect((await post(backend, 'auth/two-factor/challenge', recovery)).status).toBe(200);
        await post(backend, 'auth/logout');
        await post(backend, 'auth/login', credentials);
        // A recovery code logs in once
        expect((await post(backend, 'auth/two-factor/challenge', recovery)).status).toBe(422);
    });

    it('sets it up, and refuses a user who must have it until then', async () => {
        const backend = createTwoFactorBackend([
            { email: 'ada@example.com', password: 'secret', twoFactorRequired: true },
        ]);
        const account = (init?: RequestInit, path = '') =>
            backend.fetch(`/panneau/api/account/two-factor${path}`, init);

        expect((await account()).status).toBe(401);
        await post(backend, 'auth/login', { email: 'ada@example.com', password: 'secret' });
        const refused = await backend.fetch('/panneau/api/definition');
        expect(refused.status).toBe(403);
        expect(await refused.json()).toMatchObject({ type: TWO_FACTOR_REQUIRED_PROBLEM_TYPE });
        expect(await (await account()).json()).toEqual({ status: 'disabled', required: true });

        expect((await account(undefined, '/recovery-codes')).status).toBe(404);
        expect((await post(backend, 'account/two-factor/recovery-codes')).status).toBe(409);
        const setup = await post(backend, 'account/two-factor');
        expect(await setup.json()).toMatchObject({ secret: expect.any(String) });
        expect(await (await account()).json()).toMatchObject({ status: 'pending' });
        expect((await post(backend, 'account/two-factor/confirm', { code: '1' })).status).toBe(422);
        const confirmed = await post(backend, 'account/two-factor/confirm', { code: '123456' });
        const { recoveryCodes } = (await confirmed.json()) as { recoveryCodes: string[] };
        expect(recoveryCodes).toHaveLength(8);
        expect((await backend.fetch('/panneau/api/definition')).status).toBe(200);
        // Required: it can't be turned off
        expect((await account({ method: 'DELETE' })).status).toBe(409);
    });

    it('confirms the password of the user', async () => {
        const backend = createTwoFactorBackend([{ email: 'ada@example.com', password: 'secret' }]);

        expect((await post(backend, 'auth/password/confirm', { password: 'secret' })).status).toBe(
            401,
        );
        await post(backend, 'auth/login', { email: 'ada@example.com', password: 'secret' });
        expect((await post(backend, 'auth/password/confirm', { password: 'wrong' })).status).toBe(
            422,
        );
        expect((await post(backend, 'auth/password/confirm', { password: 'secret' })).status).toBe(
            204,
        );
    });
});

describe('the account in the mock backend', () => {
    it('saves the name and the email, and changes the password', async () => {
        const mails: MockMail[] = [];
        const definition = createDefinition();
        definition.auth = { mode: 'panneau', account: true, emailVerification: true };
        const backend = createMockBackend({
            definition,
            auth: {
                users: [
                    { email: 'ada@example.com', password: 'secret', name: 'Ada' },
                    { email: 'eve@example.com', password: 'secret' },
                ],
                onMail: (mail) => mails.push(mail),
            },
        });
        const api = (path: string, init?: RequestInit) =>
            backend.fetch(`/panneau/api/${path}`, init);

        expect(await (await api('account')).json()).toMatchObject({
            data: { name: 'Ada', email: 'ada@example.com' },
        });
        const taken = await api(
            'account',
            json({ name: 'Ada', email: 'eve@example.com' }, { method: 'PATCH' }),
        );
        expect(taken.status).toBe(422);
        const saved = await api(
            'account',
            json({ name: 'Ada L.', email: 'ada@example.org' }, { method: 'PATCH' }),
        );
        expect(await saved.json()).toMatchObject({
            data: { name: 'Ada L.', email: 'ada@example.org' },
        });
        // A new address is verified again
        expect(mails).toMatchObject([{ kind: 'email-verification', to: 'ada@example.org' }]);
        expect((await api('definition')).status).toBe(403);
        expect((await api('account')).status).toBe(403);
        await api('auth/email/verify', json({ token: mails[0]?.token }, { method: 'POST' }));

        const change = (body: unknown) => api('account/password', json(body, { method: 'PUT' }));
        expect((await change({ currentPassword: 'wrong', password: 'new password' })).status).toBe(
            422,
        );
        expect((await change({ currentPassword: 'secret', password: 'new password' })).status).toBe(
            204,
        );
    });
});

describe('passkeys in the mock backend', () => {
    it('adds a passkey, logs in with it, and removes it', async () => {
        const definition = createDefinition();
        definition.auth = { mode: 'panneau', account: true, passkeys: true };
        const backend = createMockBackend({
            definition,
            auth: { users: [{ email: 'ada@example.com', password: 'secret' }] },
        });
        const api = (path: string, init?: RequestInit) =>
            backend.fetch(`/panneau/api/${path}`, init);
        const post = (path: string, body?: unknown) =>
            api(path, json(body ?? {}, { method: 'POST' }));

        const creation = (await (await post('account/passkeys/options')).json()) as {
            options: { challenge: string; user: { id: string } };
        };
        expect(creation.options.user.id).toBe('MQ');
        expect((await post('account/passkeys', { name: 'Laptop' })).status).toBe(422);
        const added = await post('account/passkeys', {
            name: 'Laptop',
            credential: { id: 'cred-1', type: 'public-key', response: {} },
        });
        expect(added.status).toBe(201);
        expect(await (await api('account/passkeys')).json()).toMatchObject({
            data: [{ id: '1', name: 'Laptop', lastUsedAt: null }],
        });

        await post('auth/logout');
        const request = (await (await post('auth/passkeys/options')).json()) as {
            options: { challenge: string };
        };
        expect(request.options.challenge).toEqual(expect.any(String));
        expect((await post('auth/passkeys/login', { credential: { id: 'other' } })).status).toBe(
            422,
        );
        expect((await post('auth/passkeys/login', { credential: { id: 'cred-1' } })).status).toBe(
            200,
        );
        expect((await api('account/passkeys/1', { method: 'DELETE' })).status).toBe(204);
        expect(await (await api('account/passkeys')).json()).toEqual({ data: [] });
    });
});

describe('createExampleDefinition', () => {
    it('is a valid definition', async () => {
        const { validateDefinition } = await import('../validate');
        const { createExampleDefinition } = await import('.');
        expect(validateDefinition(createExampleDefinition()).success).toBe(true);
    });
});
