import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Slider } from './Slider';

function Controlled(props: Parameters<typeof Slider>[0]) {
    const [value, setValue] = useState<number | null>(props.value ?? null);
    return <Slider {...props} value={value} onChange={setValue} />;
}

const meta = {
    title: 'UI/Slider',
    component: Controlled,
    args: { label: 'Rating', minValue: 0, maxValue: 10, step: 0.5, suffix: '/ 10' },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty until moved: the value shows a dash. Arrow keys move it by its step. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const slider = canvas.getByRole('slider', { name: 'Rating' });
        await expect(canvas.getByText('—')).toBeInTheDocument();
        slider.focus();
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        await expect(canvas.getByText(/\/ 10/)).toHaveTextContent('1 / 10');
    },
};

export const WithValue: Story = { args: { value: 7.5 } };

/** At its ends, the thumb lines up with the edges of the field, as the other fields do. */
export const AtTheEnds: Story = {
    args: { value: 0 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('.panneau-slider');
        const thumb = canvasElement.querySelector('.panneau-slider-thumb');
        await expect(field).not.toBeNull();
        await expect(thumb).not.toBeNull();
        const edges = () => ({
            field: field?.getBoundingClientRect() ?? new DOMRect(),
            thumb: thumb?.getBoundingClientRect() ?? new DOMRect(),
        });
        await expect(Math.abs(edges().thumb.left - edges().field.left)).toBeLessThan(1);
        canvas.getByRole('slider', { name: 'Rating' }).focus();
        await userEvent.keyboard('{End}');
        await expect(Math.abs(edges().thumb.right - edges().field.right)).toBeLessThan(1);
    },
};

export const WithErrors: Story = { args: { value: 2, errors: ['Rate it at least 5.'] } };
