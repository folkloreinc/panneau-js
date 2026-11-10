import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect } from 'storybook/test';

import { Button } from '../button/Button';
import { Grid } from '../grid/Grid';
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

/** Side by side in a `Grid`, cards have the same height and their footers line up at the bottom. */
export const SideBySide: Story = {
    render: () => (
        <Grid columns={3}>
            <Card title="Offers" footer={<Button size="sm">Manage offers</Button>}>
                <p>2 offers</p>
            </Card>
            <Card title="Payments" footer={<Button size="sm">Manage payments</Button>}>
                <p>Stripe is connected.</p>
                <p>Payouts every Monday.</p>
                <p>Last payout: 1,240 $</p>
            </Card>
            <Card title="Channels" footer={<Button size="sm">Manage channels</Button>}>
                <p>Newsletter and website</p>
            </Card>
        </Grid>
    ),
    play: async ({ canvasElement }) => {
        const footers = Array.from(canvasElement.querySelectorAll('footer'));
        await expect(footers).toHaveLength(3);
        const bottoms = footers.map((footer) => Math.round(footer.getBoundingClientRect().bottom));
        const tops = footers.map((footer) => Math.round(footer.getBoundingClientRect().top));
        await expect(new Set(bottoms).size).toBe(1);
        await expect(new Set(tops).size).toBe(1);
    },
};
