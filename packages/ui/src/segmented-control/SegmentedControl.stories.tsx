import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutGrid, List, Rows3 } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { contrastRatio } from '../theme/color';

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

/** A computed color as sRGB, whatever its syntax (`color(srgb …)` from `color-mix()`). */
function toRgb(color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context === null) {
        throw new Error('No canvas');
    }
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
    return { r, g, b };
}

/**
 * The highlight of the selected segment sits on it, inside the track's padding, and slides to the
 * segment selected next. In a dark scheme it stands 3:1 apart from the track.
 */
async function checkIndicator(canvasElement: HTMLElement, segment: HTMLElement) {
    const group = canvasElement.querySelector<HTMLElement>('.panneau-segmented-control');
    const indicator = group?.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
    if (group === null || group === undefined || indicator === null || indicator === undefined) {
        throw new Error('No indicator');
    }
    await waitFor(() => {
        const box = indicator.getBoundingClientRect();
        const target = segment.getBoundingClientRect();
        expect(Math.abs(box.left - target.left)).toBeLessThan(1);
        expect(Math.abs(box.width - target.width)).toBeLessThan(1);
    });
    const box = indicator.getBoundingClientRect();
    const track = group.getBoundingClientRect();
    // The padding of the track shows around the highlight, in every density
    await expect(box.top - track.top).toBeGreaterThan(1);
    await expect(track.bottom - box.bottom).toBeGreaterThan(1);
    if (getComputedStyle(group).colorScheme === 'dark') {
        const ratio = contrastRatio(
            toRgb(getComputedStyle(indicator).backgroundColor),
            toRgb(getComputedStyle(group).backgroundColor),
        );
        await expect(ratio).toBeGreaterThanOrEqual(3);
    }
}

/** A few choices, one always selected: clicks and the arrow keys move the selection. */
export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Documents' }));
        await expect(args.onChange).toHaveBeenCalledWith('documents');
        await expect(canvas.getByRole('radio', { name: 'Documents' })).toBeChecked();
        await userEvent.keyboard('{ArrowRight}');
        await expect(canvas.getByRole('radio', { name: 'Brand assets' })).toHaveFocus();
        await checkIndicator(canvasElement, canvas.getByRole('radio', { name: 'Documents' }));
    },
};

export const Small: Story = {
    args: { size: 'sm' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Brand assets' }));
        await checkIndicator(canvasElement, canvas.getByRole('radio', { name: 'Brand assets' }));
    },
};

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
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await checkIndicator(canvasElement, canvas.getByRole('radio', { name: 'Grid' }));
        await userEvent.click(canvas.getByRole('radio', { name: 'Rows' }));
        await checkIndicator(canvasElement, canvas.getByRole('radio', { name: 'Rows' }));
    },
};

/** Only the icons, in square segments: the labels are their names and their tooltips. */
export const HiddenLabels: Story = {
    args: {
        'aria-label': 'Layout',
        hideLabels: true,
        defaultValue: 'grid',
        options: [
            { value: 'grid', label: 'Grid', icon: LayoutGrid },
            { value: 'list', label: 'List', icon: List },
            { value: 'rows', label: 'Rows', icon: Rows3 },
        ],
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const list = canvas.getByRole('radio', { name: 'List' });
        await expect(list).not.toHaveTextContent('List');
        await userEvent.click(list);
        await expect(args.onChange).toHaveBeenCalledWith('list');
        await expect(list).toBeChecked();
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
