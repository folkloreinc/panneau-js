import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type DefinitionInput, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';
import type * as Location from './location';
import { loadPage } from './location';

vi.mock('./location', async (original) => ({
    ...(await original<typeof Location>()),
    loadPage: vi.fn(),
}));

const SITES = [
    { value: 'main', label: 'Main site' },
    { value: 'kids', label: 'Kids' },
];

function renderApp(
    context: NonNullable<DefinitionInput['context']>,
    { inline = true, chosen }: { inline?: boolean; chosen?: Record<string, string> } = {},
) {
    const definition = createDefinition({ context });
    const backend = createMockBackend({
        definition,
        items: {
            pages: [
                { id: '1', title: 'Main page', site: 'main' },
                { id: '2', title: 'Kids page', site: 'kids' },
            ],
        },
        context: {
            options: (name, before) =>
                name === 'section' && before.site !== undefined
                    ? [{ value: `${before.site}-news`, label: 'News' }]
                    : [],
            scope: (_resource, item, values) =>
                values.site === undefined || item.site === values.site,
        },
    });
    const requests: Request[] = [];
    // A backend that chooses values when the header has none
    const fetch = (input: string | URL | Request, init?: RequestInit) => {
        const request = new Request(new URL(String(input), 'http://panneau.test'), init);
        requests.push(request);
        if (chosen !== undefined && !request.headers.has('Panneau-Context')) {
            request.headers.set('Panneau-Context', new URLSearchParams(chosen).toString());
        }
        return backend.fetch(request);
    };
    const result = validateBootConfig(
        createBootConfig(inline ? { definition: createDefinition({ context }) } : {}),
    );
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            onUnauthorized={vi.fn()}
        />,
    );
    return { requests };
}

const navigation = () => within(screen.getByRole('navigation', { name: 'Main navigation' }));

describe('the current context (decision 0043)', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        window.localStorage.clear();
        vi.mocked(loadPage).mockClear();
    });

    it('reads its values in the path, sends them, and keeps them in every link', async () => {
        window.history.replaceState(null, '', '/panneau/site/kids/resources/pages');
        const { requests } = renderApp({
            params: [{ name: 'site', label: 'Site', options: SITES }],
        });
        expect(await screen.findByRole('link', { name: 'Kids page' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Main page' })).not.toBeInTheDocument();
        expect(
            requests.every((request) => request.headers.get('Panneau-Context') === 'site=kids'),
        ).toBe(true);
        expect(navigation().getByRole('link', { name: 'Authors' })).toHaveAttribute(
            'href',
            '/panneau/site/kids/resources/authors',
        );
        expect(screen.getByRole('combobox', { name: 'Site' })).toHaveValue('Kids');
    });

    it('asks for a required param without a value, then loads the app for the one picked', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp({ params: [{ name: 'site', label: 'Site', required: true, options: SITES }] });
        expect(screen.getByRole('heading', { name: 'Choose where to work' })).toBeInTheDocument();
        const main = within(screen.getByRole('main'));
        await user.click(main.getByRole('combobox', { name: /Site/ }));
        await user.click(await screen.findByRole('option', { name: 'Main site' }));
        expect(loadPage).toHaveBeenCalledWith('/panneau/site/main/resources/pages');
    });

    it('searches the choices of a param with the values before it, and drops those after', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/site/main/resources/pages/1/edit');
        const { requests } = renderApp({
            params: [
                { name: 'site', label: 'Site', options: SITES },
                { name: 'section', label: 'Section', allLabel: 'All sections' },
            ],
        });
        const sidebar = within(await screen.findByRole('complementary'));
        await user.click(sidebar.getByRole('combobox', { name: 'Section' }));
        await user.click(await screen.findByRole('option', { name: /News/ }));
        const search = requests.find((request) => request.url.includes('/context/section/options'));
        expect(search?.headers.get('Panneau-Context')).toBe('site=main');
        // Another context: the list of the resource, not the item
        expect(loadPage).toHaveBeenLastCalledWith(
            '/panneau/site/main/section/main-news/resources/pages',
        );
    });

    it('drops the values after a param that changes', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/site/main/section/main-news');
        renderApp({
            params: [
                { name: 'site', label: 'Site', options: SITES },
                { name: 'section', label: 'Section', allLabel: 'All sections' },
            ],
        });
        const sidebar = within(await screen.findByRole('complementary'));
        await user.click(sidebar.getByRole('combobox', { name: 'Site' }));
        await user.click(await screen.findByRole('option', { name: 'Kids' }));
        expect(loadPage).toHaveBeenLastCalledWith('/panneau/site/kids');
    });

    it('puts the values the backend chose in the path, in place', async () => {
        window.history.replaceState(null, '', '/panneau/resources/pages?page=1');
        renderApp(
            { params: [{ name: 'site', label: 'Site', required: true, options: SITES }] },
            { inline: false, chosen: { site: 'kids' } },
        );
        expect(await screen.findByRole('link', { name: 'Kids page' })).toBeInTheDocument();
        await waitFor(() =>
            expect(`${window.location.pathname}${window.location.search}`).toBe(
                '/panneau/site/kids/resources/pages?page=1',
            ),
        );
        expect(loadPage).not.toHaveBeenCalled();
    });

    it('leaves a value the user can’t use, and the values after it', async () => {
        window.history.replaceState(null, '', '/panneau/site/gone/resources/pages');
        renderApp({ params: [{ name: 'site', label: 'Site', options: SITES }] });
        await waitFor(() => expect(loadPage).toHaveBeenCalledWith('/panneau', { replace: true }));
    });
});
