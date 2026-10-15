import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Tooltip } from './Tooltip';

const meta = {
    title: 'UI/Tooltip',
    component: Tooltip,
    args: { content: 'Saves without publishing', children: <Button>Save draft</Button> },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnFocus: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.tab();
        const body = within(canvasElement.ownerDocument.body);
        await expect(await body.findByRole('tooltip')).toHaveTextContent(
            'Saves without publishing',
        );
    },
};
