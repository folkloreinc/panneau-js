import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { exampleFile, fileInput } from '../__fixtures__/uploads';
import { FilePicker } from './FilePicker';

const meta = {
    title: 'Fields/Uploads/FilePicker',
    component: FilePicker,
    args: { onSelect: fn() },
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    args: { accept: ['application/pdf'] },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Choose a file' })).toBeVisible();
        await expect(fileInput(canvasElement)).toHaveAttribute('accept', 'application/pdf');

        const chosen = exampleFile('terms.pdf', 'application/pdf');
        await userEvent.upload(fileInput(canvasElement), chosen);
        await expect(args.onSelect).toHaveBeenCalledWith([chosen]);
    },
};

export const Multiple: Story = {
    args: { multiple: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Choose files' })).toBeVisible();
        await expect(fileInput(canvasElement)).toHaveAttribute('multiple');
    },
};

export const Disabled: Story = {
    args: { isDisabled: true },
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement).getByRole('button', { name: 'Choose a file' }),
        ).toBeDisabled();
    },
};
