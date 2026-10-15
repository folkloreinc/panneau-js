import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../badge/Badge';
import { TextInput } from '../text-input/TextInput';
import { Disclosure } from './Disclosure';

const meta = {
    title: 'UI/Disclosure',
    component: Disclosure,
    args: {
        title: 'Sharing',
        children: <TextInput label="Share title" />,
    },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Sharing' }));
        await expect(canvas.getByRole('textbox', { name: 'Share title' })).toBeVisible();
    },
};

export const WithErrorCount: Story = {
    args: {
        titleEnd: (
            <Badge tone="danger" label="1 error">
                1
            </Badge>
        ),
    },
};
