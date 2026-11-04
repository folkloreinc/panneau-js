import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ColorField } from './ColorField';
import type { ColorPaletteEntry } from './palette';

const PALETTE: ColorPaletteEntry[] = [
    { value: 'white', label: 'White', color: '#ffffff' },
    { value: 'purple', label: 'Purple', color: '#6b21a8' },
    { value: 'sand', label: 'Sand', color: '#e7d8b8' },
    { value: '#0f766e', label: 'Teal' },
];

function PaletteField({
    initial,
    required = false,
    readOnly = false,
}: {
    initial: string | null;
    required?: boolean;
    readOnly?: boolean;
}) {
    const [value, setValue] = useState(initial);
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <ColorField
                label="Background"
                description="The background of the block."
                palette={PALETTE}
                value={value}
                onChange={setValue}
                required={required}
                readOnly={readOnly}
            />
            <output aria-label="Value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {JSON.stringify(value)}
            </output>
        </div>
    );
}

const meta = {
    title: 'Fields/Color palette',
    component: PaletteField,
    args: { initial: null },
} satisfies Meta<typeof PaletteField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The field only offers the colors of its palette, with their swatches, and stores their values. */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Background/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Purple' }));
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent('"purple"'),
        );
        await userEvent.click(canvas.getByRole('button', { name: /Background/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Pick a color' }));
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent('null'),
        );
    },
};

/** A required field can't be emptied. */
export const Required: Story = {
    args: { initial: 'sand', required: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Background/ }));
        await expect(await body.findByRole('option', { name: 'Teal' })).toBeInTheDocument();
        await expect(body.queryByRole('option', { name: 'Pick a color' })).not.toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
    },
};

/** A value outside the palette, kept from before, shows as it is. */
export const OutsideThePalette: Story = {
    args: { initial: '#ff6600' },
};

export const ReadOnly: Story = {
    args: { initial: 'purple', readOnly: true },
};
