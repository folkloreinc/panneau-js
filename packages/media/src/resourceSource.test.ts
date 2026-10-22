// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { createExampleDefinition, createMockBackend } from '@panneau/protocol/mock';

import { createResourceMediaSource } from './resourceSource';

function setup() {
    const definition = createExampleDefinition();
    const backend = createMockBackend({ definition });
    const fetch = (input: string, init: RequestInit = {}) =>
        backend.fetch(new Request(new URL(input, 'http://panneau.test'), init));
    const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch });
    const library = definition.resources.find((resource) => resource.id === 'media');
    if (library === undefined) {
        throw new Error('The example has no media library.');
    }
    const upload = async (name: string) => {
        const post = (path: string, body: unknown) =>
            fetch(`/panneau/api${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        const signed = (await (
            await post('/uploads/sign', { method: 'PUT', key: name })
        ).json()) as {
            upload: string;
        };
        await post(`/uploads/${signed.upload}/complete`, { name });
        return { upload: signed.upload, name, mime: 'image/jpeg', size: 2048 };
    };
    return { source: createResourceMediaSource(adapter, library), upload };
}

describe('createResourceMediaSource', () => {
    it('describes the library: its label, what it accepts and the fields the details edit', () => {
        const { source } = setup();
        expect(source).toMatchObject({
            id: 'media',
            label: 'médias',
            accept: ['image/*', 'video/*', 'application/pdf'],
            maxSize: null,
            canCreate: true,
            // The type filter is the picker's own.
            filters: [],
            sorts: [],
        });
        expect(source.fields?.map((field) => field.name)).toEqual(['name', 'alt']);
    });

    it('makes media of uploads, lists them by type, and saves the fields of the details', async () => {
        const { source, upload } = setup();

        const created = await source.create(await upload('portrait.jpg'));
        expect(created).toMatchObject({
            label: 'portrait.jpg',
            fileName: 'portrait.jpg',
            media: { type: 'image', status: 'ready' },
        });

        const images = await source.list({ filter: { type: 'image' } });
        expect(images).toEqual({ items: [created], nextCursor: null, total: 1 });
        expect((await source.list({ filter: { type: 'video' } })).items).toEqual([]);

        const saved = await source.update?.(created.id, { name: 'Portrait' });
        expect(saved).toMatchObject({ id: created.id, label: 'Portrait' });
        expect(await source.get(created.id)).toMatchObject({ label: 'Portrait' });
    });

    it('gives the total, and no next page when every media fits in one', async () => {
        const { source, upload } = setup();
        for (const name of ['a.jpg', 'b.jpg', 'c.jpg']) {
            await source.create(await upload(name));
        }
        const page = await source.list({});
        expect(page.items).toHaveLength(3);
        expect(page.total).toBe(3);
        expect(page.nextCursor).toBeNull();
    });
});
