import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { fr as fieldsFr } from '@panneau/fields/locales';
import type { Field } from '@panneau/protocol';
import { fr as uiFr } from '@panneau/ui/locales';

import { Form } from './Form';
import { problemError, renderForm } from './__fixtures__/render';
import { fr } from './locales';

const FIELDS: Field[] = [
    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
    { name: 'email', type: 'email', label: 'Email', rules: [{ rule: 'email' }] },
    { name: 'bio', type: 'textarea', label: 'Bio', rules: [{ rule: 'max', value: 5 }] },
];

describe('Form without a definition', () => {
    it('renders fields in order and submits their values', async () => {
        const onSubmit = vi.fn();
        const onSubmitted = vi.fn();
        renderForm(<Form fields={FIELDS} onSubmit={onSubmit} onSubmitted={onSubmitted} />);
        const textboxes = screen.getAllByRole('textbox');
        expect(textboxes.map((input) => input.getAttribute('name'))).toEqual([
            'name',
            'email',
            'bio',
        ]);
        await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Ada');
        expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
        expect(onSubmit).toHaveBeenCalledWith(
            { name: 'Ada' },
            expect.objectContaining({ mode: 'create', version: null, changes: { name: 'Ada' } }),
        );
        expect(await screen.findByText('Saved')).toBeInTheDocument();
        expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    });

    it('shows client errors, a summary, and focuses the first invalid field', async () => {
        const onSubmit = vi.fn();
        renderForm(
            <Form
                fields={FIELDS}
                values={{ email: 'nope', bio: 'Too long' }}
                onSubmit={onSubmit}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(onSubmit).not.toHaveBeenCalled();
        const summary = await screen.findByRole('alert');
        expect(summary).toHaveTextContent('3 errors prevent saving');
        expect(
            within(summary)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual([
            'Name: This field is required.',
            'Email: This value must be an email address.',
            'Bio: At most 5 characters.',
        ]);
        const name = screen.getByRole('textbox', { name: /Name/ });
        await waitFor(() => expect(name).toHaveFocus());
        expect(name).toHaveAccessibleDescription('This field is required.');
        await userEvent.type(name, 'Ada');
        expect(name).not.toHaveAttribute('aria-invalid');
        expect(summary).toHaveTextContent('2 errors prevent saving');
        await userEvent.click(within(summary).getByRole('button', { name: 'Bio' }));
        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Bio' })).toHaveFocus());
    });

    it('shows client errors of a field once it lost focus', async () => {
        renderForm(<Form fields={FIELDS} />);
        const name = screen.getByRole('textbox', { name: /Name/ });
        await userEvent.click(name);
        expect(name).not.toHaveAttribute('aria-invalid');
        await userEvent.tab();
        expect(name).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows the errors of the server, by path', async () => {
        const onSubmit = vi.fn(async () => {
            throw problemError({
                status: 422,
                errors: { email: ['This email is already used.'] },
            });
        });
        renderForm(
            <Form
                fields={FIELDS}
                values={{ name: 'Ada', email: 'ada@example.com' }}
                onSubmit={onSubmit}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const email = screen.getByRole('textbox', { name: 'Email' });
        await waitFor(() =>
            expect(email).toHaveAccessibleDescription('This email is already used.'),
        );
        await userEvent.type(email, 'x');
        expect(email).not.toHaveAttribute('aria-invalid');
    });

    it('shows a network error with a retry', async () => {
        const onSubmit = vi
            .fn()
            .mockRejectedValueOnce(new Error('Failed to fetch'))
            .mockResolvedValueOnce(undefined);
        renderForm(<Form fields={FIELDS} values={{ name: 'Ada' }} onSubmit={onSubmit} />);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const alerts = await screen.findAllByText('The changes could not be saved.');
        expect(alerts.length).toBeGreaterThan(0);
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
        await userEvent.click(
            screen.getAllByRole('button', { name: 'Try again' })[0] as HTMLElement,
        );
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
        expect(await screen.findByText('Saved')).toBeInTheDocument();
    });

    it('translates rule messages and the UI', async () => {
        renderForm(<Form fields={FIELDS} />, {
            locale: 'fr',
            messages: { ...uiFr, ...fieldsFr, ...fr },
        });
        await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(
            '1 erreur empêche l’enregistrement',
        );
        expect(screen.getByRole('textbox', { name: /Name/ })).toHaveAccessibleDescription(
            'Ce champ est obligatoire.',
        );
    });

    it('can hide the submit button, and add actions', () => {
        renderForm(
            <Form
                fields={FIELDS}
                submitLabel={null}
                actions={<button type="button">Cancel</button>}
            />,
        );
        expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
});
