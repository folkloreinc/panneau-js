import type { DefinitionInput } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

export const BASE_URL = '/panneau/api';

/** A small definition, served by the mock backend. */
export function createDefinition(): DefinitionInput {
    return {
        protocol: 1,
        name: 'Test site',
        locale: 'en',
        locales: ['en', 'fr'],
        api: { baseUrl: BASE_URL },
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                fields: [
                    {
                        name: 'title',
                        type: 'text',
                        localized: true,
                        rules: [{ rule: 'required' }, { rule: 'max', value: 40 }],
                    },
                    {
                        name: 'status',
                        type: 'select',
                        options: [
                            { value: 'draft', label: 'Draft' },
                            { value: 'published', label: 'Published' },
                        ],
                        rules: [
                            { rule: 'required' },
                            { rule: 'in', value: ['draft', 'published'] },
                        ],
                    },
                ],
                list: {
                    columns: [{ field: 'title', sortable: true }, { field: 'status' }],
                    filters: [{ id: 'status', type: 'select' }],
                    sorts: ['title'],
                    defaultSort: 'title',
                    perPage: 2,
                },
                actions: [
                    {
                        id: 'delete',
                        label: 'Delete',
                        scope: ['item', 'selection'],
                        destructive: true,
                    },
                ],
                abilities: { viewAny: true, create: true },
            },
        ],
    };
}

/** A mock backend with three pages, and a `fetch` that records the requests it receives. */
export function createBackend() {
    const backend = createMockBackend({
        definition: createDefinition(),
        items: {
            pages: [
                { title: { en: 'Home', fr: 'Accueil' }, status: 'published' },
                { title: { en: 'About', fr: 'À propos' }, status: 'draft' },
                { title: { en: 'Contact', fr: 'Contact' }, status: 'draft' },
            ],
        },
    });
    const requests: Request[] = [];
    const fetch = (input: string, init: RequestInit = {}) => {
        const request = new Request(new URL(input, 'http://panneau.test'), init);
        requests.push(request.clone());
        return backend.fetch(request);
    };
    return { ...backend, fetch, requests };
}

/** A `fetch` that answers every request with the same response, and records the requests. */
export function createStubFetch(respond: (request: Request) => Response | Promise<Response>) {
    const requests: Request[] = [];
    const fetch = async (input: string, init: RequestInit = {}) => {
        const request = new Request(new URL(input, 'http://panneau.test'), init);
        requests.push(request.clone());
        return respond(request);
    };
    return { fetch, requests };
}

export function jsonResponse(status: number, body: unknown, contentType = 'application/json') {
    return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': contentType },
    });
}
