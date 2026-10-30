import { act, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataAdapter } from '@panneau/data';

import { createBootConfig, createDefinition } from './__fixtures__/definition';
import { type PanneauApp, createPanneauApp } from './createPanneauApp';

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('createPanneauApp', () => {
    let element: HTMLElement;
    let app: PanneauApp | undefined;

    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        element = document.createElement('div');
        element.id = 'panneau';
        document.body.append(element);
    });

    afterEach(() => {
        act(() => app?.unmount());
        app = undefined;
        document.body.innerHTML = '';
        document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        vi.unstubAllGlobals();
    });

    it('reads the boot config of the page, and fetches the definition with the Laravel adapter', async () => {
        const boot = document.createElement('script');
        boot.type = 'application/json';
        boot.id = 'panneau-boot';
        boot.textContent = JSON.stringify(createBootConfig());
        document.body.append(boot);
        document.cookie = 'XSRF-TOKEN=token%3D';
        const fetch = vi.fn((_url: string, _init: RequestInit) =>
            Promise.resolve(json(createDefinition())),
        );
        vi.stubGlobal('fetch', fetch);

        act(() => {
            app = createPanneauApp({ element });
        });

        expect(app?.config.basePath).toBe('/panneau');
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        const [url, init] = fetch.mock.calls[0] ?? [];
        expect(url).toBe('/panneau/api/definition');
        expect(init?.credentials).toBe('include');
        const headers = new Headers(init?.headers);
        expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
        expect(headers.get('X-XSRF-TOKEN')).toBe('token=');
    });

    it('treats 419 from Laravel as unauthenticated', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(json({ message: 'CSRF token mismatch.' }, 419))),
        );
        const onUnauthorized = vi.fn();

        act(() => {
            app = createPanneauApp({
                element,
                config: createBootConfig({ loginUrl: '/login' }),
                onUnauthorized,
            });
        });

        expect(await screen.findByRole('alert')).toHaveTextContent('Your session has ended.');
        expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ loginUrl: '/login' });
    });

    it('uses the adapter, plugins and config it is given', () => {
        const adapter = { getDefinition: vi.fn() } as Partial<DataAdapter> as DataAdapter;

        act(() => {
            app = createPanneauApp({
                element,
                adapter,
                plugins: [{ id: 'test' }],
                config: createBootConfig({ basePath: '/', definition: createDefinition() }),
            });
        });

        const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
        expect(within(navigation).getByRole('link', { name: 'Pages' })).toHaveAttribute(
            'href',
            '/resources/pages',
        );
        expect(adapter.getDefinition).not.toHaveBeenCalled();
    });

    it('loads the icons that the definition names from Lucide, unless it is given a loader', async () => {
        const definition = createDefinition({
            resources: [
                {
                    id: 'authors',
                    label: { singular: 'author', plural: 'authors' },
                    icon: 'users',
                    fields: [],
                },
            ],
        });
        act(() => {
            app = createPanneauApp({ element, config: createBootConfig({ definition }) });
        });
        const card = within(screen.getByRole('main')).getByRole('link', { name: 'Authors' });
        await waitFor(() => expect(card.querySelector('svg.lucide-users')).not.toBeNull());
        act(() => app?.unmount());

        const iconLoader = vi.fn(() => Promise.resolve(null));
        act(() => {
            app = createPanneauApp({
                element,
                config: createBootConfig({ definition }),
                iconLoader,
            });
        });
        await waitFor(() => expect(iconLoader).toHaveBeenCalledWith('users'));
    });

    it('throws when the boot config is missing or invalid', () => {
        expect(() => createPanneauApp({ element })).toThrow(/no Panneau boot config/);
        expect(() =>
            createPanneauApp({ element, config: { ...createBootConfig(), protocol: 2 } as never }),
        ).toThrow(/- protocol: /);
    });

    it('unmounts', () => {
        act(() => {
            app = createPanneauApp({
                element,
                config: createBootConfig({ definition: createDefinition() }),
            });
        });
        expect(element).not.toBeEmptyDOMElement();
        act(() => app?.unmount());
        app = undefined;
        expect(element).toBeEmptyDOMElement();
    });
});
