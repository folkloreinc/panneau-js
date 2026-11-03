import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { withPanneauMessages } from '@panneau/intl';
import type { Field } from '@panneau/protocol';
import { Dialog } from '@panneau/ui';

import { Form } from './Form';
import { problemError, renderForm } from './__fixtures__/render';

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

    it('shows the locale of the first error, and marks the locales in error', async () => {
        renderForm(
            <Form
                fields={[
                    {
                        name: 'title',
                        type: 'text',
                        label: 'Title',
                        localized: true,
                        rules: [{ rule: 'required' }],
                    },
                ]}
                locales={['en', 'fr']}
                values={{ title: { en: 'Summer' } }}
                onSubmit={vi.fn()}
            />,
        );
        const title = screen.getByRole('group', { name: 'Title' });
        expect(within(title).queryByRole('textbox', { name: 'French' })).toBeNull();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const french = await within(title).findByRole('textbox', { name: 'French' });
        await waitFor(() => expect(french).toHaveFocus());
        expect(within(title).getByRole('radio', { name: 'French, has errors' })).toBeChecked();
        expect(within(title).queryByRole('textbox', { name: 'English' })).toBeNull();
    });

    it('lists the errors of a localized field in the order of the locales', async () => {
        renderForm(
            <Form
                fields={[
                    {
                        name: 'title',
                        type: 'text',
                        label: 'Title',
                        localized: true,
                        rules: [{ rule: 'required' }],
                    },
                ]}
                locales={['fr', 'en']}
                onSubmit={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const summary = await screen.findByRole('alert');
        expect(
            within(summary)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Title (fr): This field is required.', 'Title (en): This field is required.']);
        await waitFor(() => expect(screen.getByRole('textbox', { name: 'French' })).toHaveFocus());
    });

    it('lays out short fields that no layout places side by side', () => {
        renderForm(<Form fields={FIELDS} layout={[{ type: 'field', name: 'bio' }]} />);
        // The layout places the bio; the others flow after it.
        const bio = screen.getByRole('textbox', { name: 'Bio' });
        const name = screen.getByRole('textbox', { name: /Name/ });
        expect(bio.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(name.closest('[data-panneau-path]')?.parentElement?.parentElement).toBe(
            screen.getByRole('textbox', { name: 'Email' }).closest('[data-panneau-path]')
                ?.parentElement?.parentElement,
        );
    });

    it('saves a required file chosen without direct uploads', async () => {
        const onSubmit = vi.fn();
        const onSubmitted = vi.fn();
        const { container } = renderForm(
            <Form
                fields={[
                    { name: 'file', type: 'file', label: 'File', rules: [{ rule: 'required' }] },
                ]}
                onSubmit={onSubmit}
                onSubmitted={onSubmitted}
            />,
        );
        const chosen = new File(['png'], 'photo.png', { type: 'image/png' });
        const input = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (input === null) {
            throw new Error('No file input.');
        }
        await userEvent.upload(input, chosen);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
        expect(screen.queryByText('This field is required.')).not.toBeInTheDocument();
        expect(onSubmit).toHaveBeenCalledWith(
            { file: chosen },
            expect.objectContaining({ mode: 'create' }),
        );
    });

    it('marks a field required in the mode of its rule only, inferred from the version', async () => {
        const fields: Field[] = [
            {
                name: 'password',
                type: 'text',
                label: 'Password',
                settings: { secret: true },
                rules: [{ rule: 'required', mode: 'create' }],
            },
        ];
        const onSubmit = vi.fn();
        // Without a mode or a version, the form creates an item
        const { unmount } = renderForm(<Form fields={fields} onSubmit={onSubmit} />);
        expect(screen.getByLabelText(/Password/)).toBeRequired();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Password: This field is required.',
        );
        unmount();

        const onSubmitted = vi.fn();
        renderForm(
            <Form
                fields={fields}
                version="1"
                values={{ password: null }}
                onSubmit={onSubmit}
                onSubmitted={onSubmitted}
            />,
        );
        expect(screen.getByLabelText(/Password/)).not.toBeRequired();
        await userEvent.type(screen.getByLabelText(/Password/), 'x');
        await userEvent.clear(screen.getByLabelText(/Password/));
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
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
            messages: withPanneauMessages('fr'),
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

    it('submits only itself when it is in a dialog of another form', async () => {
        const outer = vi.fn();
        const inner = vi.fn();
        // The dialog renders in a portal: React still bubbles its events through it (#146).
        renderForm(
            <Form
                fields={[{ name: 'name', type: 'text', label: 'Name' }]}
                onSubmit={outer}
                aria-label="Project"
                actions={
                    <Dialog title="New key" isOpen>
                        <Form
                            fields={[{ name: 'key', type: 'text', label: 'Key' }]}
                            onSubmit={inner}
                            submitLabel="Create the key"
                        />
                    </Dialog>
                }
            />,
        );
        await userEvent.click(await screen.findByRole('button', { name: 'Create the key' }));
        await waitFor(() => expect(inner).toHaveBeenCalledTimes(1));
        expect(outer).not.toHaveBeenCalled();
    });
});
