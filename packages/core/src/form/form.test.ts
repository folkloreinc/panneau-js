import { describe, expect, it, vi } from 'vitest';

import type { Item } from '@panneau/protocol';

import { getResource } from '../__fixtures__/definition';
import { resolveForm } from '../definition/form';
import { type FormOptions, createForm, getDefaultValues } from './form';
import { getItemValues, getProblem, isItem } from './problem';
import { createLocalStore } from './store';

const pages = getResource('pages');
const fields = resolveForm(pages, { mode: 'update' }).fields;

const item: Item = {
    id: '1',
    version: '3',
    abilities: { update: true },
    slug: 'home',
    title: { en: 'Home', fr: 'Accueil' },
    status: 'draft',
    seo: { description: 'Short' },
};

function setup(options: Partial<FormOptions> = {}) {
    return createForm({
        fields,
        values: getItemValues(
            item,
            fields.map((field) => field.name),
        ),
        version: item.version,
        locales: ['en', 'fr'],
        ...options,
    });
}

/** An error like those of `@panneau/data`: an `Error` that carries problem details. */
function problemError(problem: Record<string, unknown>) {
    return Object.assign(new Error(String(problem.title)), {
        problem: { type: 'about:blank', title: 'Error.', ...problem },
    });
}

describe('createForm', () => {
    it('tracks values, nested and localized, and whether they changed', () => {
        const form = setup();
        expect(form.getState()).toMatchObject({ dirty: false, status: 'idle', version: '3' });

        form.setValue('title.en', 'Welcome');
        form.setValue('seo.description', 'Longer');
        expect(form.getValue('title')).toEqual({ en: 'Welcome', fr: 'Accueil' });
        expect(form.getState().dirty).toBe(true);

        form.setValue('title.en', 'Home');
        form.setValue('seo.description', 'Short');
        expect(form.getState().dirty).toBe(false);
    });

    it('starts a new item from the field defaults', () => {
        const form = createForm({ fields: resolveForm(pages).fields, values: { slug: 'new' } });
        expect(form.getState().values).toEqual({ slug: 'new', status: 'draft' });
        expect(getDefaultValues(fields, { status: 'published' })).toEqual({ status: 'published' });
    });

    it('shows client errors of touched fields, then of every field after a submit', async () => {
        const onSubmit = vi.fn();
        const form = setup({ onSubmit });
        form.setValue('title.fr', '');
        form.setValue('seo.description', 'Much too long');
        expect(form.getState().errors).toEqual({});

        form.blur('title');
        expect(form.getState().errors).toEqual({ 'title.fr': ['This field is required.'] });
        expect(form.getErrors('title')).toEqual([]);
        expect(form.getErrors('title', { nested: true })).toEqual(['This field is required.']);

        expect(await form.submit()).toEqual({
            status: 'invalid',
            errors: {
                'title.fr': ['This field is required.'],
                'seo.description': ['This value must be at most 10.'],
            },
        });
        expect(onSubmit).not.toHaveBeenCalled();
        expect(form.getState().status).toBe('invalid');
        expect(form.countErrors(['title', 'status'])).toBe(1);

        form.setValue('title.fr', 'Accueil');
        expect(Object.keys(form.getState().errors)).toEqual(['seo.description']);
    });

    it('formats errors with formatError', () => {
        const form = setup({ formatError: (failure, path) => `${path}: ${failure.rule}` });
        form.setValue('title.en', '');
        form.validate();
        expect(form.getState().errors).toEqual({ 'title.en': ['title.en: required'] });
    });

    it('skips hidden fields and evaluates visibility', () => {
        const form = setup();
        const publishedAt = fields.find((field) => field.name === 'published_at');
        expect(publishedAt).toBeDefined();
        expect(form.isVisible(publishedAt ?? {})).toBe(false);
        expect(form.validate()).toBe(true);

        form.setValue('status', 'published');
        expect(form.isVisible(publishedAt ?? {})).toBe(true);
        expect(form.validate()).toBe(false);
        expect(form.getState().errors).toEqual({ published_at: ['This field is required.'] });

        expect(form.isVisible({ visibleWhen: { field: 'description', filled: true } }, 'seo')).toBe(
            true,
        );
    });

    it('submits the values with the version and the changes, then continues from the saved item', async () => {
        const onSubmit = vi.fn(async (values: Record<string, unknown>) => ({
            ...item,
            ...values,
            version: '4',
            title: { en: 'Saved', fr: 'Enregistré' },
        }));
        const form = setup({ onSubmit });
        form.setValue('status', 'published');
        form.setValue('published_at', '2026-10-15T12:00:00Z');

        const result = await form.submit();
        expect(result.status).toBe('submitted');
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }), {
            mode: 'update',
            version: '3',
            changes: { status: 'published', published_at: '2026-10-15T12:00:00Z' },
        });
        expect(form.getState()).toMatchObject({
            status: 'submitted',
            version: '4',
            dirty: false,
            values: { title: { en: 'Saved', fr: 'Enregistré' } },
        });
        expect(form.getState().values).not.toHaveProperty('abilities');
    });

    it('keeps the values when onSubmit returns something else than an item', async () => {
        const form = setup({ onSubmit: async () => 'ok' });
        form.setValue('status', 'published');
        form.setValue('published_at', '2026-10-15T12:00:00Z');
        expect(await form.submit()).toEqual({ status: 'submitted', result: 'ok' });
        expect(form.getState()).toMatchObject({ dirty: false, version: '3' });
    });

    it('shows server validation errors until their value changes', async () => {
        const form = setup({
            onSubmit: () => {
                throw problemError({
                    status: 422,
                    errors: { slug: ['This slug is taken.'], 'title.en': ['Too common.'] },
                });
            },
        });
        expect(await form.submit()).toMatchObject({ status: 'invalid' });
        expect(form.getState().errors).toEqual({
            slug: ['This slug is taken.'],
            'title.en': ['Too common.'],
        });
        form.setValue('title.en', 'Unique');
        expect(form.getState().errors).toEqual({ slug: ['This slug is taken.'] });
        form.setServerErrors({});
        expect(form.getState().errors).toEqual({});
    });

    it('goes into the conflict status on a 412, then reloads the current item', async () => {
        const current = {
            ...item,
            version: '5',
            status: 'published',
            title: { en: 'Theirs', fr: 'Les leurs' },
        };
        const form = setup({
            onSubmit: () => {
                throw problemError({ status: 412, current });
            },
        });
        form.setValue('title.en', 'Mine');
        expect(await form.submit()).toEqual({ status: 'conflict', current });
        expect(form.getState()).toMatchObject({
            status: 'conflict',
            conflict: { current },
            dirty: true,
        });

        expect(await form.resolveConflict('reload')).toBeNull();
        expect(form.getState()).toMatchObject({
            status: 'idle',
            conflict: null,
            version: '5',
            dirty: false,
            values: { title: { en: 'Theirs', fr: 'Les leurs' } },
        });
        expect(await form.resolveConflict('reload')).toBeNull();
    });

    it('overwrites the current version with the local changes', async () => {
        const current = { ...item, version: '5' };
        const onSubmit = vi
            .fn<(values: Record<string, unknown>, context: { version: string | null }) => unknown>()
            .mockImplementationOnce(() => {
                throw problemError({ status: 412, current });
            })
            .mockImplementationOnce((values) => ({ ...current, ...values, version: '6' }));
        const form = setup({ onSubmit });
        form.setValue('title.en', 'Mine');
        await form.submit();

        const result = await form.resolveConflict('overwrite');
        expect(result?.status).toBe('submitted');
        expect(onSubmit.mock.calls[1]?.[1].version).toBe('5');
        expect(form.getState()).toMatchObject({
            status: 'submitted',
            version: '6',
            values: { title: { en: 'Mine', fr: 'Accueil' } },
        });
    });

    it('keeps other errors for the caller', async () => {
        const failure = new Error('Network down');
        const form = setup({
            onSubmit: () => {
                throw failure;
            },
        });
        expect(await form.submit()).toEqual({ status: 'error', error: failure });
        expect(form.getState()).toMatchObject({ status: 'error', error: failure });
        form.reset();
        expect(form.getState()).toMatchObject({ status: 'idle', error: null });
    });

    it('submits once at a time', async () => {
        let resolve: (value: unknown) => void = () => undefined;
        const onSubmit = vi.fn(() => new Promise((done) => (resolve = done)));
        const form = setup({ onSubmit });
        const first = form.submit();
        const second = form.submit();
        expect(form.getState().status).toBe('submitting');
        resolve(null);
        expect(await first).toBe(await second);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('keeps values typed while saving', async () => {
        let resolve: (value: unknown) => void = () => undefined;
        const form = setup({ onSubmit: () => new Promise((done) => (resolve = done)) });
        const submitting = form.submit();
        form.setValue('title.en', 'Typed meanwhile');
        resolve({ ...item, version: '4' });
        await submitting;
        expect(form.getState()).toMatchObject({
            version: '4',
            dirty: true,
            values: { title: { en: 'Typed meanwhile' } },
        });
    });

    it('reads and writes values through its store, and follows its changes', () => {
        const store = createLocalStore({ title: { en: 'Shared' } });
        const form = createForm({ fields, store, version: '1' });
        const listener = vi.fn();
        const unsubscribe = form.subscribe(listener);

        store.setValue('title.fr', 'Partagé');
        expect(listener).toHaveBeenCalled();
        expect(form.getState().values).toEqual({ title: { en: 'Shared', fr: 'Partagé' } });
        form.setValue('status', 'draft');
        expect(store.getValues()).toMatchObject({ status: 'draft' });
        unsubscribe();

        store.setValue('status', 'published');
        expect(form.getState().values.status).toBe('published');
    });

    it('takes new fields and locales', () => {
        const form = setup();
        const listener = vi.fn();
        form.subscribe(listener);
        form.setValue('title.fr', '');
        form.validate();
        expect(Object.keys(form.getState().errors)).toEqual(['title.fr']);
        listener.mockClear();
        form.setOptions({ locales: ['en'] });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(form.getState().errors).toEqual({});
        form.setOptions({ locales: ['en'], fields: [...fields], onSubmit: () => undefined });
        expect(listener).toHaveBeenCalledTimes(1);
    });
});

describe('problem helpers', () => {
    it('find the problem of an error', () => {
        const problem = { type: 'about:blank', title: 'Nope.', status: 403 };
        expect(getProblem(problem)).toBe(problem);
        expect(getProblem(Object.assign(new Error(), { problem }))).toBe(problem);
        expect(getProblem(Object.assign(new Error(), { problem: 'nope' }))).toBeNull();
        expect(getProblem(new Error())).toBeNull();
        expect(getProblem(null)).toBeNull();
    });

    it('recognize items and read their values', () => {
        expect(isItem(item)).toBe(true);
        expect(isItem({ id: '1', version: null, abilities: {} })).toBe(true);
        expect(isItem({ id: 1, version: '1', abilities: {} })).toBe(false);
        expect(isItem('item')).toBe(false);
        expect(getItemValues(item, ['slug'])).toEqual({ slug: 'home' });
        expect(getItemValues(item)).not.toHaveProperty('id');
    });
});
