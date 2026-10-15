import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextArea } from './TextArea';

const meta = {
    title: 'UI/TextArea',
    component: TextArea,
    args: { label: 'Summary', description: 'One or two sentences.' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithErrors: Story = { args: { errors: ['This value must be at most 280.'] } };
