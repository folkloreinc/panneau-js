import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { EXAMPLE_FIELDS, EXAMPLE_VALUES, exampleRelationSource } from './__fixtures__/fields';
import { DefinitionField } from './shared/DefinitionField';
import { builtInFields } from './shared/builtIn';
import { FieldsProvider } from './shared/context';

interface AllFieldsProps {
    errors?: Record<string, string[]>;
    readOnly?: boolean;
}

/** Every built-in type, rendered from field definitions, without a form. */
function AllFields({ errors = {}, readOnly = false }: AllFieldsProps) {
    const [values, setValues] = useState<Record<string, unknown>>(EXAMPLE_VALUES);
    return (
        <FieldsProvider
            components={builtInFields}
            locales={['fr', 'en']}
            relationSource={exampleRelationSource}
        >
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '40rem' }}>
                {EXAMPLE_FIELDS.map((field) => (
                    <DefinitionField
                        key={field.name}
                        field={field}
                        path={field.name}
                        value={values[field.name]}
                        onChange={(value) => setValues({ ...values, [field.name]: value })}
                        parentValue={values}
                        errors={errors[field.name] ?? []}
                        readOnly={readOnly}
                    />
                ))}
                <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }} aria-label="Values">
                    {JSON.stringify(values, null, 2)}
                </pre>
            </div>
        </FieldsProvider>
    );
}

const meta = {
    title: 'Fields/All types',
    component: AllFields,
} satisfies Meta<typeof AllFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const english = canvas.getByRole('textbox', { name: /English/ });
        await userEvent.clear(english);
        await userEvent.type(english, 'Fall');
        await expect(canvas.getByLabelText('Values')).toHaveTextContent('"en": "Fall"');
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Custom image' }));
        await expect(canvas.getByRole('textbox', { name: 'Image note' })).toBeVisible();
    },
};

export const WithErrors: Story = {
    args: {
        errors: {
            status: ['This field is required.'],
            duration: ['This value must be at least 0.'],
            website: ['This value must be a URL.'],
            blocks: ['Add at least one block.'],
        },
    },
};

export const ReadOnly: Story = { args: { readOnly: true } };
