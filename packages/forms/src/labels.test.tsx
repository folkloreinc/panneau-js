import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { ConflictDialog } from './ConflictDialog';
import { Form } from './Form';
import { renderForm } from './__fixtures__/render';
import { describePath } from './describe';

// Fields without a label show their name made readable (issue 408).
const FIELDS: Field[] = [
    { name: 'author_id', type: 'text', rules: [{ rule: 'required' }] },
    { name: 'published_at', type: 'text' },
    { name: 'slug', type: 'text', label: '' },
];

describe('the labels of fields without one', () => {
    it('name the fields and the errors of the summary', async () => {
        renderForm(<Form fields={FIELDS} onSubmit={vi.fn()} />);
        expect(screen.getByRole('textbox', { name: /^Published at/ })).toBeInTheDocument();
        expect(screen.queryByText('published_at')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const summary = await screen.findByRole('alert');
        expect(
            within(summary)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Author: This field is required.']);
    });

    it('describe the path of an error, and keep an empty label', () => {
        expect(describePath(FIELDS, 'published_at')).toBe('Published at');
        expect(describePath(FIELDS, 'slug')).toBe('');
    });

    it('name the changes of a version conflict', async () => {
        renderForm(
            <ConflictDialog
                isOpen
                fields={FIELDS}
                values={{ published_at: 'Monday' }}
                current={{ id: '1', version: '2', abilities: {}, published_at: 'Tuesday' }}
                onReload={() => undefined}
                onOverwrite={() => undefined}
            />,
        );
        const dialog = await screen.findByRole('alertdialog');
        expect(within(dialog).getByText('Published at')).toBeInTheDocument();
    });
});
