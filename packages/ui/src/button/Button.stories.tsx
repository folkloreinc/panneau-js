import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus, Trash } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';

const meta = {
    title: 'UI/Button',
    component: Button,
    args: { children: 'Save', onPress: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {
    play: async ({ args, canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));
        await expect(args.onPress).toHaveBeenCalled();
    },
};

/** The deprecated `variant` aliases, kept during the alpha: see the Tones stories for tone × appearance. */
export const Variants: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button {...args} variant="primary" icon={Plus}>
                Create
            </Button>
            <Button {...args} variant="secondary">
                Cancel
            </Button>
            <Button {...args} variant="ghost" iconEnd={ArrowRight}>
                Next
            </Button>
            <Button {...args} variant="danger" icon={Trash}>
                Delete
            </Button>
            <Button {...args} variant="primary" isDisabled>
                Disabled
            </Button>
            <Button {...args} variant="primary" size="sm">
                Small
            </Button>
        </div>
    ),
};

export const TonesAndAppearances: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Button {...args} tone="accent" icon={Plus}>
                Create
            </Button>
            <Button {...args}>Cancel</Button>
            <Button {...args} appearance="ghost" iconEnd={ArrowRight}>
                Next
            </Button>
            <Button {...args} tone="danger" icon={Trash}>
                Delete
            </Button>
            <Button {...args} tone="danger" appearance="outline">
                Remove
            </Button>
            <Button {...args} tone="success" appearance="subtle">
                Approve
            </Button>
        </div>
    ),
};

export const Pending: Story = {
    args: { variant: 'primary', isPending: true },
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole('button');
        await userEvent.click(button);
        await expect(args.onPress).not.toHaveBeenCalled();
    },
};

export const FullWidth: Story = {
    args: { variant: 'primary', fullWidth: true },
};
