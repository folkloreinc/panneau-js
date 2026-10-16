import { describe, expect, it } from 'vitest';

import { type FormState, createForm } from './form';
import { selectErrorCount, selectErrors, selectValue, selectVisible } from './selectors';

function createState(overrides: Partial<FormState> = {}): FormState {
    return {
        ...createForm({ fields: [] }).getState(),
        values: { title: { en: 'Home', fr: '' }, seo: { description: 'Text' }, status: 'draft' },
        errors: {
            'title.fr': ['This field is required.'],
            title: ['Too short.'],
            'seo.description': ['Too long.'],
        },
        ...overrides,
    };
}

describe('form selectors', () => {
    it('reads values by dot path', () => {
        const state = createState();
        expect(selectValue(state, 'title.en')).toBe('Home');
        expect(selectValue(state, 'seo')).toEqual({ description: 'Text' });
        expect(selectValue(state, 'missing.path')).toBeUndefined();
    });

    it('reads the errors at a path, and with nested ones', () => {
        const state = createState();
        expect(selectErrors(state, 'title')).toEqual(['Too short.']);
        expect(selectErrors(state, 'title', { nested: true })).toEqual([
            'This field is required.',
            'Too short.',
        ]);
        expect(selectErrors(state, 'titles', { nested: true })).toEqual([]);
        expect(selectErrors(state, 'status')).toEqual([]);
    });

    it('counts the paths with errors within some paths', () => {
        const state = createState();
        expect(selectErrorCount(state, ['title'])).toBe(2);
        expect(selectErrorCount(state, ['title', 'seo'])).toBe(3);
        expect(selectErrorCount(state, ['status'])).toBe(0);
        expect(selectErrorCount(state, [''])).toBe(3);
    });

    it('evaluates visibility on the values, relative to a parent path', () => {
        const state = createState();
        expect(selectVisible(state, {})).toBe(true);
        expect(selectVisible(state, { visibleWhen: { field: 'status', equals: 'draft' } })).toBe(
            true,
        );
        expect(
            selectVisible(state, { visibleWhen: { field: 'status', equals: 'published' } }),
        ).toBe(false);
        expect(
            selectVisible(state, { visibleWhen: { field: 'description', filled: true } }, 'seo'),
        ).toBe(true);
    });

    it('reads the same results as the methods of the form', () => {
        const form = createForm({
            fields: [{ name: 'title', type: 'text', rules: [{ rule: 'required' }] }],
            values: { title: '' },
        });
        form.blur('title');
        const state = form.getState();
        expect(selectErrors(state, 'title')).toEqual(form.getErrors('title'));
        expect(selectErrorCount(state, ['title'])).toBe(form.countErrors(['title']));
        expect(selectValue(state, 'title')).toBe(form.getValue('title'));
    });
});
