import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from '../Panneau';
import { createBootConfig, createDefinition } from '../__fixtures__/definition';

/** Longer than the delay of the links of items (100 ms). */
const AFTER_DELAY = 200;

const wait = (ms: number) =>
    act(() => new Promise<void>((resolve) => void setTimeout(resolve, ms)));

/** The app on the list of authors, which open in their form, and the requests of Ada's item. */
async function renderList() {
    window.history.replaceState(null, '', '/panneau/resources/authors');
    const definition = createDefinition({
        resources: [
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                itemTitle: 'name',
                fields: [{ name: 'name', type: 'text', label: 'Name' }],
            },
        ],
    });
    const backend = createMockBackend({
        definition,
        items: { authors: [{ id: '1', name: 'Ada' }] },
    });
    const requests: string[] = [];
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({
                baseUrl: '/panneau/api',
                fetch: (input, init) => {
                    const url = new URL(String(input), 'http://localhost');
                    if (url.pathname.endsWith('/resources/authors/1')) {
                        requests.push(url.pathname);
                    }
                    return backend.fetch(input, init);
                },
            })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            iconLoader={null}
            onUnauthorized={vi.fn()}
        />,
    );
    const table = await screen.findByRole('table', { name: 'Authors' });
    const link = await within(table).findByRole('link', { name: 'Ada' });
    return { link, requests };
}

describe('the links of items in a list', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('load the item while hovered, so its form opens without a skeleton', async () => {
        const user = userEvent.setup();
        const { link, requests } = await renderList();
        await user.hover(link);
        await wait(AFTER_DELAY);
        expect(requests).toHaveLength(1);

        await user.click(link);
        expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit');
        // From the cache: the form is there at once, without its skeleton
        expect(document.querySelector('[aria-busy="true"]')).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
        expect(requests).toHaveLength(1);
    });

    it('load nothing when the pointer leaves before the delay', async () => {
        const user = userEvent.setup();
        const { link, requests } = await renderList();
        await user.hover(link);
        await user.unhover(link);
        await wait(AFTER_DELAY);
        expect(requests).toHaveLength(0);
    });

    it('load the item when focused, and not again while it is fresh', async () => {
        const user = userEvent.setup();
        const { link, requests } = await renderList();
        act(() => link.focus());
        await wait(0);
        expect(requests).toHaveLength(1);

        act(() => link.blur());
        await user.hover(link);
        await wait(AFTER_DELAY);
        act(() => link.focus());
        await wait(0);
        expect(requests).toHaveLength(1);
    });
});
