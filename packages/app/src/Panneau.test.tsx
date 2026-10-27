import { QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type DataAdapter, UnauthorizedError } from '@panneau/data';
import { queryKeys } from '@panneau/data/query';
import { type BootConfigInput, type DefinitionInput, validateBootConfig } from '@panneau/protocol';

import { Panneau, type PanneauProps } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';

function parse(input: BootConfigInput) {
    const result = validateBootConfig(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return result.data;
}

const unauthorized = () =>
    new UnauthorizedError({ type: 'about:blank', title: 'Unauthenticated.', status: 401 });

function createAdapter(getDefinition: () => Promise<unknown>) {
    return { getDefinition: vi.fn(getDefinition) } as Partial<DataAdapter> as DataAdapter & {
        getDefinition: ReturnType<typeof vi.fn>;
    };
}

const navigation = () => within(screen.getByRole('navigation', { name: 'Main navigation' }));

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPanneau(
    props: Omit<Partial<PanneauProps>, 'config'> & { config?: BootConfigInput } = {},
) {
    const { config = createBootConfig(), ...rest } = props;
    return render(<Panneau onUnauthorized={vi.fn()} {...rest} config={parse(config)} />);
}

describe('Panneau', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
    });

    it('fetches the definition, then renders the shell', async () => {
        const adapter = createAdapter(() =>
            Promise.resolve(parse(createBootConfig({ definition: createDefinition() })).definition),
        );
        renderPanneau({ adapter });
        // The shell's skeleton, until the definition is there.
        expect(screen.getByRole('status')).toHaveTextContent('Loading…');
        expect(document.querySelector('[aria-busy="true"] .panneau-skeleton')).not.toBeNull();
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(navigation().getByRole('link', { name: 'Pages' })).toHaveAttribute(
            'href',
            '/panneau/resources/pages',
        );
        expect(adapter.getDefinition).toHaveBeenCalledTimes(1);
    });

    it('uses the inlined definition without fetching it', () => {
        const adapter = createAdapter(() => Promise.reject(new Error('Not called.')));
        renderPanneau({ adapter, config: createBootConfig({ definition: createDefinition() }) });
        expect(screen.getByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(adapter.getDefinition).not.toHaveBeenCalled();
    });

    it('navigates between routes under the base path, in history mode', async () => {
        const user = userEvent.setup();
        renderPanneau({
            adapter: createAdapter(() => Promise.reject(new Error('Not called.'))),
            config: createBootConfig({ definition: createDefinition() }),
        });
        await user.click(navigation().getByRole('link', { name: 'Authors' }));
        expect(window.location.pathname).toBe('/panneau/resources/authors');
        expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
        expect(navigation().getByRole('link', { name: 'Authors' })).toHaveAttribute(
            'aria-current',
            'page',
        );

        await act(async () => {
            window.history.back();
            await new Promise((resolve) =>
                window.addEventListener('popstate', resolve, { once: true }),
            );
        });
        expect(screen.getByRole('heading', { name: 'Test site' })).toBeInTheDocument();
    });

    it('shows the route of the page it was loaded on', () => {
        window.history.replaceState(null, '', '/panneau/resources/pages/12/edit');
        renderPanneau({
            adapter: createAdapter(() => Promise.reject(new Error('Not called.'))),
            config: createBootConfig({ definition: createDefinition() }),
        });
        expect(screen.getByRole('heading', { name: 'Edit the page' })).toBeInTheDocument();
        expect(
            within(screen.getByRole('main')).getByRole('link', { name: 'Pages' }),
        ).toHaveAttribute('href', '/panneau/resources/pages');
    });

    it('shows an error with a retry when the definition fails to load', async () => {
        const user = userEvent.setup();
        let calls = 0;
        const adapter = createAdapter(() => {
            calls += 1;
            return calls === 1
                ? Promise.reject(new Error('Network error'))
                : Promise.resolve(
                      parse(createBootConfig({ definition: createDefinition() })).definition,
                  );
        });
        renderPanneau({
            adapter,
            queryClient: createQueryClient(),
        });
        expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
        await user.click(screen.getByRole('button', { name: 'Try again' }));
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
    });

    describe('when the API answers that the user is not authenticated', () => {
        it('sends the user to the boot config’s login URL before the definition is loaded', async () => {
            const onUnauthorized = vi.fn();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ loginUrl: '/login' }),
                onUnauthorized,
            });
            expect(await screen.findByRole('alert')).toHaveTextContent('Your session has ended.');
            expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ loginUrl: '/login' });
        });

        it('uses auth.loginUrl of the definition in external mode', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition: createDefinition(), loginUrl: '/login' }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(screen.getByRole('alert')).toHaveTextContent('Your session has ended.');
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({
                loginUrl: '/login?from=definition',
            });
        });

        it('has no login URL in panneau mode, whose login page is in the app', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            const definition: DefinitionInput = createDefinition({ auth: { mode: 'panneau' } });
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition, loginUrl: '/login' }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ loginUrl: null });
        });

        it('calls onUnauthorized once for several failed calls', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition: createDefinition() }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(onUnauthorized).toHaveBeenCalledTimes(1);
        });
    });
});
