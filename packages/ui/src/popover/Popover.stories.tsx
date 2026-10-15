import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Popover, PopoverTrigger } from './Popover';

const meta = {
    title: 'UI/Popover',
    component: Popover,
    args: { 'aria-label': 'Columns' },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <PopoverTrigger>
            <Button>Columns</Button>
            <Popover {...args}>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <Checkbox defaultSelected>Title</Checkbox>
                    <Checkbox defaultSelected>Status</Checkbox>
                    <Checkbox>Author</Checkbox>
                </div>
            </Popover>
        </PopoverTrigger>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
        const dialog = await canvas.findByRole('dialog', { name: 'Columns' });
        await waitFor(() => expect(dialog).toBeVisible());
    },
};
