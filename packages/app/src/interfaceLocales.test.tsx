import { QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type DefinitionInput, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';
import { getInterfaceLocales, withNext } from './interfaceLocales';
import type * as Location from './location';
import { loadPage } from './location';

vi.mock('./location', async (original) => ({
    ...(await original<typeof Location>()),
    loadPage: vi.fn(),
}));

const LOCALES = [
    { locale: 'en', label: 'English', url: '/panneau/api/locale/en' },
    { locale: 'fr', label: 'Français', url: '/panneau/api/locale/fr?from=app' },
];

function renderApp(overrides: Partial<DefinitionInput> = {}) {
    const definition = createDefinition({ interfaceLocales: LOCALES, ...overrides });
    const backend = createMockBackend({ definition, items: { pages: [], authors: [] } });
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            iconLoader={null}
            onUnauthorized={vi.fn()}
        />,
    );
}

describe('getInterfaceLocales()', () => {
    it('gives none with fewer than two languages', () => {
        expect(getInterfaceLocales(createDefinition() as never)).toEqual([]);
        expect(
            getInterfaceLocales(
                createDefinition({ interfaceLocales: LOCALES.slice(0, 1) }) as never,
            ),
        ).toEqual([]);
        expect(
            getInterfaceLocales(createDefinition({ interfaceLocales: LOCALES }) as never),
        ).toEqual(LOCALES);
    });
});

describe('withNext()', () => {
    it('adds the path to come back to, after a query or without one', () => {
        expect(withNext('/locale/fr', '/panneau?q=a b')).toBe(
            '/locale/fr?next=%2Fpanneau%3Fq%3Da%20b',
        );
        expect(withNext('/locale/fr?x=1', '/panneau')).toBe('/locale/fr?x=1&next=%2Fpanneau');
        expect(withNext('/locale/fr', '')).toBe('/locale/fr');
    });
});

describe('the language switcher (decision 0083)', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau/resources/pages?q=news');
        window.localStorage.clear();
        vi.mocked(loadPage).mockClear();
    });

    it('switches the language from the footer of the sidebar, and comes back to the page', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(await screen.findByRole('button', { name: 'Language: English' }));
        // The menu is named after its button
        const menu = await screen.findByRole('menu', { name: 'Language: English' });
        expect(within(menu).getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        const french = within(menu).getByRole('menuitemradio', { name: 'Français' });
        expect(within(french).getByText('Français')).toHaveAttribute('lang', 'fr');

        await user.click(french);
        expect(loadPage).toHaveBeenCalledWith(
            '/panneau/api/locale/fr?from=app&next=%2Fpanneau%2Fresources%2Fpages%3Fq%3Dnews',
        );
    });

    it('does nothing for the current language', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(await screen.findByRole('button', { name: 'Language: English' }));
        // The menu is named after its button
        const menu = await screen.findByRole('menu', { name: 'Language: English' });
        await user.click(within(menu).getByRole('menuitemradio', { name: 'English' }));
        expect(loadPage).not.toHaveBeenCalled();
    });

    it('has no switcher with a single language, or without any', async () => {
        renderApp({ interfaceLocales: LOCALES.slice(0, 1) });
        expect(await screen.findByRole('button', { name: /Appearance/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Language/ })).not.toBeInTheDocument();
    });

    it('switches the language from "Go to…"', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(
            within(await screen.findByRole('complementary')).getByRole('button', {
                name: /Go to…/,
            }),
        );
        const palette = within(screen.getByRole('dialog', { name: 'Go to…' }));
        await user.type(palette.getByRole('searchbox'), 'language');
        // Only the other languages
        expect(palette.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
            'Language: Français',
        ]);
        await user.click(palette.getByRole('menuitem', { name: 'Language: Français' }));
        expect(loadPage).toHaveBeenCalledWith(
            '/panneau/api/locale/fr?from=app&next=%2Fpanneau%2Fresources%2Fpages%3Fq%3Dnews',
        );
    });

    it("switches the language from the user's menu of the dock", async () => {
        const user = userEvent.setup();
        renderApp({ theme: { navigation: 'dock' } });
        await user.click(await screen.findByRole('button', { name: 'Ada' }));
        const menu = await screen.findByRole('menu', { name: 'Ada' });
        const language = within(menu).getByRole('group', { name: 'Language' });
        expect(within(language).getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        await user.click(within(language).getByRole('menuitemradio', { name: 'Français' }));
        expect(loadPage).toHaveBeenCalledWith(
            '/panneau/api/locale/fr?from=app&next=%2Fpanneau%2Fresources%2Fpages%3Fq%3Dnews',
        );
    });
});
