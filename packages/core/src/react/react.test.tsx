import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createDefinition, getResource } from '../__fixtures__/definition';
import { resolveForm } from '../definition/form';
import { resolveList } from '../definition/list';
import type { Form } from '../form/form';
import { createForm } from '../form/form';
import { createMemoryRouter } from '../list/router';
import { definePlugin } from '../plugins';
import { PanneauProvider, usePanneau, usePlugins, useResource } from './provider';
import { useForm, useFormField, useFormSelector } from './useForm';
import { useList } from './useList';

const TextField = () => null;
const ProjectTextField = () => null;

describe('PanneauProvider', () => {
    it('merges the plugins of nested providers', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <PanneauProvider
                plugins={[
                    definePlugin({ id: 'base', fields: { text: TextField, date: TextField } }),
                ]}
            >
                <PanneauProvider
                    plugins={[definePlugin({ id: 'project', fields: { text: ProjectTextField } })]}
                >
                    {children}
                </PanneauProvider>
            </PanneauProvider>
        );
        const { result } = renderHook(() => usePlugins(), { wrapper });
        expect(result.current.fields.get('text')).toBe(ProjectTextField);
        expect(result.current.fields.get('date')).toBe(TextField);
    });

    it('works without a provider', () => {
        const { result } = renderHook(() => usePanneau());
        expect(result.current).toMatchObject({ definition: null, router: null });
        expect(result.current.plugins.fields.size).toBe(0);
    });

    it('resolves the resources of its definition', () => {
        const definition = createDefinition();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <PanneauProvider definition={definition}>
                <PanneauProvider>{children}</PanneauProvider>
            </PanneauProvider>
        );
        const { result } = renderHook(() => useResource('pages', { mode: 'update' }), { wrapper });
        expect(result.current.form.fieldsByName.get('slug')?.readOnly).toBe(true);
        expect(result.current.list.perPage).toBe(10);

        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => renderHook(() => useResource('unknown'), { wrapper })).toThrow(/unknown/);
        expect(() => renderHook(() => useResource('pages'))).toThrow(/definition/);
        vi.restoreAllMocks();
    });
});

function TextInput({ form, path, label }: { form: Form; path: string; label: string }) {
    const field = useFormField(form, path);
    return (
        <label>
            {label}
            <input
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
            />
            {field.errors.map((error) => (
                <span key={error} role="alert">
                    {error}
                </span>
            ))}
        </label>
    );
}

function TitleForm({ onSubmit }: { onSubmit: (values: Record<string, unknown>) => unknown }) {
    const { fields } = resolveForm(getResource('pages'), { mode: 'update' });
    const { form, dirty, status } = useForm({
        fields,
        values: { title: { en: 'Home', fr: 'Accueil' }, status: 'draft' },
        version: '1',
        locales: ['en', 'fr'],
        onSubmit,
    });
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void form.submit();
            }}
        >
            <TextInput form={form} path="title.en" label="Title (en)" />
            <TextInput form={form} path="title.fr" label="Title (fr)" />
            <p>{dirty ? 'Unsaved changes' : 'Saved'}</p>
            <p>Status: {status}</p>
            <button type="submit">Save</button>
        </form>
    );
}

describe('useForm', () => {
    it('drives controlled fields, validation and submit', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(async (values: Record<string, unknown>) => ({
            id: '1',
            version: '2',
            abilities: {},
            ...values,
        }));
        render(<TitleForm onSubmit={onSubmit} />);
        expect(screen.getByText('Saved')).toBeInTheDocument();

        const french = screen.getByLabelText('Title (fr)');
        await user.clear(french);
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        await user.tab();
        expect(screen.getByRole('alert')).toHaveTextContent('This field is required.');

        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByText('Status: invalid')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();

        await user.type(french, 'Bienvenue');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(await screen.findByText('Status: submitted')).toBeInTheDocument();
        expect(screen.getByText('Saved')).toBeInTheDocument();
        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ title: { en: 'Home', fr: 'Bienvenue' } }),
            expect.objectContaining({ version: '1' }),
        );
    });

    it('calls the latest onSubmit', async () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(<TitleForm onSubmit={first} />);
        rerender(<TitleForm onSubmit={second} />);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});

describe('useFormSelector', () => {
    it('renders again when its slice of the state changes only', () => {
        const form = createForm({
            fields: [
                { name: 'title', type: 'text' },
                { name: 'body', type: 'text', rules: [{ rule: 'required' }] },
            ],
        });
        let titleRenders = 0;
        let bodyRenders = 0;
        const title = renderHook(() => {
            titleRenders += 1;
            return useFormField(form, 'title');
        });
        const dirty = renderHook(() => useFormSelector(form, (state) => state.dirty));
        renderHook(() => {
            bodyRenders += 1;
            return useFormField(form, 'body');
        });
        act(() => form.setValue('title', 'Home'));
        act(() => form.setValue('title', 'Homepage'));
        expect(title.result.current.value).toBe('Homepage');
        expect(dirty.result.current).toBe(true);
        expect(titleRenders).toBe(3);
        expect(bodyRenders).toBe(1);
        // Its errors show
        act(() => form.blur('body'));
        expect(bodyRenders).toBe(2);
        expect(titleRenders).toBe(3);
    });
});

describe('useList', () => {
    it('keeps its query in the router of the provider', () => {
        const router = createMemoryRouter('page=2');
        const wrapper = ({ children }: { children: ReactNode }) => (
            <PanneauProvider router={router}>{children}</PanneauProvider>
        );
        const { result } = renderHook(() => useList({ list: resolveList(getResource('pages')) }), {
            wrapper,
        });
        expect(result.current.query.page).toBe(2);

        act(() => result.current.list.setFilter('status', 'draft'));
        expect(result.current.query).toMatchObject({ page: 1, filter: { status: 'draft' } });
        expect(router.getSearch()).toBe('filter%5Bstatus%5D=draft');

        act(() => router.back());
        expect(result.current.query).toMatchObject({ page: 2 });
        expect(result.current.query.filter).toBeUndefined();
    });

    it('keeps its query in memory with router: null', () => {
        const router = createMemoryRouter();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <PanneauProvider router={router}>{children}</PanneauProvider>
        );
        const { result } = renderHook(() => useList({ router: null }), { wrapper });
        act(() => result.current.list.select(['1']));
        act(() => result.current.list.setPage(3));
        expect(result.current).toMatchObject({
            query: { page: 3 },
            selection: { mode: 'ids', ids: ['1'] },
        });
        expect(router.history).toEqual(['']);
    });
});
