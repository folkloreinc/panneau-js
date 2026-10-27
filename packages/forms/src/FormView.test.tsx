import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useForm } from '@panneau/core';
import { type UploadSource, useFieldsContext } from '@panneau/fields';
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

    it('draws a skeleton of its layout and fields while its values load', () => {
        const fields: Field[] = [
            { name: 'title', type: 'text', label: 'Title' },
            { name: 'body', type: 'textarea', label: 'Body' },
            { name: 'featured', type: 'boolean', label: 'Featured' },
            { name: 'published_at', type: 'date', label: 'Publication date' },
        ];
        function Editor() {
            const { form } = useForm({ fields, onSubmit: vi.fn() });
            return (
                <FormView
                    form={form}
                    fields={fields}
                    layout={[
                        {
                            type: 'row',
                            children: [
                                { type: 'field', name: 'title', width: 8 },
                                { type: 'field', name: 'published_at', width: 4 },
                            ],
                        },
                        { type: 'field', name: 'body' },
                        { type: 'sidebar', children: [{ type: 'field', name: 'featured' }] },
                    ]}
                    aria-label="Editor"
                    isLoading
                />
            );
        }
        const { container } = renderForm(<Editor />);
        expect(screen.getByRole('status')).toHaveTextContent('Loading the form…');
        expect(screen.queryByRole('form')).toBeNull();
        expect(screen.queryByRole('textbox')).toBeNull();
        const region = container.querySelector('[aria-busy="true"]');
        // A label and a block for each field, and the button of the footer.
        expect(region?.querySelectorAll('.panneau-skeleton')).toHaveLength(9);
        const blocks = [...(region?.querySelectorAll<HTMLElement>('.panneau-skeleton') ?? [])];
        expect(blocks.map((block) => block.style.height)).toContain('6rem');
    });

    it('gives its upload source to the fields', () => {
        const uploadSource: UploadSource = { createUploader: vi.fn() };
        const fields: Field[] = [{ name: 'attachment', type: 'probe' }];
        function Probe() {
            const context = useFieldsContext();
            return <p>{context.uploadSource === uploadSource ? 'source' : 'none'}</p>;
        }
        function Editor() {
            const { form } = useForm({ fields, onSubmit: vi.fn() });
            return (
                <FormView
                    form={form}
                    fields={fields}
                    components={{ probe: Probe }}
                    uploadSource={uploadSource}
                    aria-label="Editor"
                />
            );
        }
        renderForm(<Editor />);
        expect(screen.getByText('source')).toBeInTheDocument();
    });
});
