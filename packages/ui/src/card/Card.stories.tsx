import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';

import { Button } from '../button/Button';
import { TextInput } from '../text-input/TextInput';
import { Card } from './Card';

const meta = {
    title: 'UI/Card',
    component: Card,
    args: { title: 'Profile' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHeaderAndFooter: Story = {
    args: {
        actions: (
            <Button size="sm" icon={Plus}>
                Add a link
            </Button>
        ),
        footer: <Button variant="primary">Save</Button>,
        children: (
            <>
                <TextInput label="Name" defaultValue="Ada Lovelace" />
                <TextInput label="Email" type="email" />
            </>
        ),
    },
};
