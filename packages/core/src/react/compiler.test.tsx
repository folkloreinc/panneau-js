/*
 * The components of this file are compiled with the React Compiler, like those of the packages
 * (see `config/vite.package.ts`) and of projects that turn it on.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSyncExternalStore } from 'react';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { type Form, createForm } from '../form/form';
import { selectErrorCount, selectErrors, selectValue, selectVisible } from '../form/selectors';

const fields: Field[] = [
    { name: 'title', type: 'text', rules: [{ rule: 'required' }] },
    { name: 'summary', type: 'text', visibleWhen: { field: 'title', filled: true } },
];

function createTitleForm(): Form {
    return createForm({ fields, values: { title: '' }, version: '1' });
}

/** A field written the recommended way: it reads the state it subscribed to. */
function TitleWithSelectors({ form }: { form: Form }) {
    const state = useSyncExternalStore(form.subscribe, form.getState, form.getState);
    const value = selectValue(state, 'title');
    return (
        <div>
            <label>
                Title
                <input
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => form.setValue('title', event.target.value)}
                    onBlur={() => form.blur('title')}
                />
            </label>
            {selectErrors(state, 'title').map((error) => (
                <p key={error} role="alert">
                    {error}
                </p>
            ))}
            <p>Errors: {selectErrorCount(state, ['title'])}</p>
            {selectVisible(state, fields[1] ?? {}) ? <p>Summary</p> : null}
        </div>
    );
}

/** The same field reading the form's methods, which the compiler memoizes by their arguments. */
function TitleWithMethods({ form }: { form: Form }) {
    useSyncExternalStore(form.subscribe, form.getState, form.getState);
    const value = form.getValue('title');
    return (
        <div>
            <label>
                Title
                <input
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => form.setValue('title', event.target.value)}
                    onBlur={() => form.blur('title')}
                />
            </label>
            {form.getErrors('title').map((error) => (
                <p key={error} role="alert">
                    {error}
                </p>
            ))}
            <p>Errors: {form.countErrors(['title'])}</p>
            {form.isVisible(fields[1] ?? {}) ? <p>Summary</p> : null}
        </div>
    );
}

describe('form state with the React Compiler', () => {
    it('shows the errors of a field after a blur, read with the selectors', async () => {
        const user = userEvent.setup();
        render(<TitleWithSelectors form={createTitleForm()} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Title'));
        await user.tab();
        expect(screen.getByRole('alert')).toHaveTextContent('This field is required.');
        expect(screen.getByText('Errors: 1')).toBeInTheDocument();
        expect(screen.queryByText('Summary')).not.toBeInTheDocument();

        await user.type(screen.getByLabelText('Title'), 'Home');
        expect(screen.getByLabelText('Title')).toHaveValue('Home');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Errors: 0')).toBeInTheDocument();
        expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    // Why the selectors exist. If this starts failing, the compiler no longer memoizes these
    // calls (or this file is no longer compiled): check the test above still runs compiled.
    it('keeps stale results when the methods are read in a component', async () => {
        const user = userEvent.setup();
        const form = createTitleForm();
        render(<TitleWithMethods form={form} />);

        await user.click(screen.getByLabelText('Title'));
        await user.tab();
        expect(form.getErrors('title')).toEqual(['This field is required.']);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Errors: 0')).toBeInTheDocument();
    });
});
