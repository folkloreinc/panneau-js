import { describe, expect, it } from 'vitest';

import { Definition, getMediaLibraries } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { createPlaygroundDefinition, createPlaygroundItems } from './definition';

const definition = createPlaygroundDefinition();

/** Every `label` and `message` of a value, deeply. */
function labelsOf(node: unknown): string[] {
    if (Array.isArray(node)) {
        return node.flatMap(labelsOf);
    }
    if (node === null || typeof node !== 'object') {
        return [];
    }
    return Object.entries(node).flatMap(([key, value]) =>
        (key === 'label' || key === 'message') && typeof value === 'string'
            ? [value]
            : labelsOf(value),
    );
}

describe('the playground definition', () => {
    it('is a valid definition', () => {
        expect(Definition.safeParse(definition).error).toBeUndefined();
    });

    it('shows its pages in English, with a label on every field', () => {
        const pages = definition.resources.find((resource) => resource.id === 'pages');
        const labels = labelsOf(pages);
        expect(labels).toEqual(expect.arrayContaining(['Title', 'Content', 'Publish', 'Files']));
        expect(
            labels.filter((label) => /[éèàç]|Titre|Brouillon|Publier|Contenu/.test(label)),
        ).toEqual([]);
        const unlabeled = (pages?.fields ?? []).filter((field) => field.label === undefined);
        expect(unlabeled.map((field) => field.name)).toEqual([]);
        // The attachment's panel is not titled as its field
        expect(labels.filter((label) => label === 'Attachment')).toHaveLength(1);
    });

    it('has a media library for the Image blocks of pages and the photos of authors', () => {
        expect(getMediaLibraries(definition, {})).toEqual(['media']);
    });

    it('has a resource whose items open in the item panel', () => {
        expect(
            definition.resources
                .filter((resource) => resource.open === 'panel')
                .map(({ id }) => id),
        ).toEqual(['authors']);
    });

    it('lists the media of the library with the mock backend', async () => {
        const backend = createMockBackend({ definition, items: createPlaygroundItems() });
        const response = await backend.fetch(`${definition.api.baseUrl}/resources/media`);
        expect(response.status).toBe(200);
        const { data } = (await response.json()) as {
            data: { name: string; media: { type: string; url: string } }[];
        };
        expect(data.length).toBeGreaterThan(0);
        expect(
            data.every(({ media }) => media.type === 'image' && media.url.startsWith('data:')),
        ).toBe(true);
    });
});
