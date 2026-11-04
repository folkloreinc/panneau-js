import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TelField, type TelFieldProps } from './TelField';

/** A phone field with its value shown under it. */
function Phone({ initial, ...props }: Omit<TelFieldProps, 'value'> & { initial: string | null }) {
    const [value, setValue] = useState(initial);
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <TelField {...props} value={value} onChange={setValue} />
            <output aria-label="Value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {JSON.stringify(value)}
            </output>
        </div>
    );
}

const meta = {
    title: 'Fields/Tel',
    component: Phone,
    args: { label: 'Phone', country: 'CA', extension: true, initial: null },
} satisfies Meta<typeof Phone>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * An extension, after the number, is kept with it after `;ext=`. Clearing the extension gives back
 * the number alone.
 */
export const Extension: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const value = canvas.getByRole('status', { name: 'Value' });
        await userEvent.type(canvas.getByRole('textbox', { name: 'Phone' }), '5145550199');
        const extension = canvas.getByRole('textbox', { name: 'Extension' });
        await userEvent.type(extension, '123');
        await waitFor(() => expect(value).toHaveTextContent('"+15145550199;ext=123"'));
        await userEvent.clear(extension);
        await waitFor(() => expect(value).toHaveTextContent('"+15145550199"'));
    },
};

/** A number with an extension shows the number in its format, and the extension in its input. */
export const WithExtension: Story = {
    args: { initial: '+15145550199;ext=123' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'Phone' })).toHaveValue('(514) 555-0199');
        await expect(canvas.getByRole('textbox', { name: 'Extension' })).toHaveValue('123');
    },
};

/**
 * A number kept as typed, with its extension, shows as it is. Leaving the field gives E.164, and
 * moves the extension to its input.
 */
export const ExtensionAsTyped: Story = {
    args: { initial: '514 555-0199 ext. 123' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const phone = canvas.getByRole('textbox', { name: 'Phone' });
        await expect(phone).toHaveValue('514 555-0199 ext. 123');
        await userEvent.click(phone);
        await userEvent.tab();
        await expect(phone).toHaveValue('(514) 555-0199');
        await expect(canvas.getByRole('textbox', { name: 'Extension' })).toHaveValue('123');
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent(
                '"+15145550199;ext=123"',
            ),
        );
    },
};

/** Without the setting, the field has no extension. */
export const WithoutExtension: Story = {
    args: { extension: false, initial: '+15145550199' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('textbox', { name: 'Extension' })).toBeNull();
    },
};

export const ReadOnly: Story = {
    args: { initial: '+15145550199;ext=123', readOnly: true },
};

export const WithErrors: Story = {
    args: {
        initial: '514 555;ext=123',
        errors: ['This value must be a complete phone number.'],
    },
};
