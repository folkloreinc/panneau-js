import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useForm } from '@panneau/core';
import type { Field } from '@panneau/protocol';

import { FormView } from './FormView';
import { renderForm } from './__fixtures__/render';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
];

describe('FormView', () => {
    it('renders a form created elsewhere', async () => {
        const onSubmit = vi.fn();
        function Editor() {
            const { form, dirty } = useForm({ fields: FIELDS, onSubmit });
            return (
                <>
                    <p>{dirty ? 'dirty' : 'clean'}</p>
                    <FormView form={form} fields={FIELDS} aria-label="Editor" />
                </>
            );
        }
        renderForm(<Editor />);
        expect(screen.getByRole('form', { name: 'Editor' })).toBeInTheDocument();
        await userEvent.type(screen.getByRole('textbox', { name: /Title/ }), 'Hi');
        expect(screen.getByText('dirty')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });
});
