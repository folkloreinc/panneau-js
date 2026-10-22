import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutGrid, List, Rows3 } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SegmentedControl } from './SegmentedControl';

const meta = {
    title: 'UI/SegmentedControl',
    component: SegmentedControl,
    args: {
        'aria-label': 'Library',
        options: [
            { value: 'images', label: 'Images' },
            { value: 'documents', label: 'Documents' },
            { value: 'brand', label: 'Brand assets' },
        ],
        defaultValue: 'images',
        onChange: fn(),
    },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A few choices, one always selected: clicks and the arrow keys move the selection. */
export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Documents' }));
        await expect(args.onChange).toHaveBeenCalledWith('documents');
        await expect(canvas.getByRole('radio', { name: 'Documents' })).toBeChecked();
        await userEvent.keyboard('{ArrowRight}');
        await expect(canvas.getByRole('radio', { name: 'Brand assets' })).toHaveFocus();
    },
};

export const Small: Story = { args: { size: 'sm' } };

/** Segments of equal width, across the container: on phones, or above a full-width panel. */
export const FullWidth: Story = { args: { fullWidth: true } };

/** Icons, with or without a label. An icon-only segment is named by its `textValue`. */
export const WithIcons: Story = {
    args: {
        'aria-label': 'View',
        defaultValue: 'grid',
        options: [
            { value: 'grid', label: null, icon: LayoutGrid, textValue: 'Grid' },
            { value: 'list', label: null, icon: List, textValue: 'List' },
            { value: 'rows', label: 'Rows', icon: Rows3 },
        ],
    },
};

export const DisabledOption: Story = {
    args: {
        options: [
            { value: 'images', label: 'Images' },
            { value: 'documents', label: 'Documents' },
            { value: 'archive', label: 'Archive', isDisabled: true },
        ],
    },
};
