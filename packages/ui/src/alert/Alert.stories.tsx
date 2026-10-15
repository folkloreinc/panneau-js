import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/Button';
import { Alert } from './Alert';

const meta = {
    title: 'UI/Alert',
    component: Alert,
    args: { title: 'The page has 2 errors', children: 'Fix them before saving.' },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
    render: (args) => (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Alert {...args} tone="neutral" />
            <Alert {...args} tone="info" title="Drafts are saved every minute" />
            <Alert {...args} tone="success" title="Saved" children={undefined} />
            <Alert {...args} tone="warning" title="Someone else is editing this page" />
            <Alert
                {...args}
                tone="danger"
                role="alert"
                actions={<Button size="sm">Show the first error</Button>}
                onDismiss={() => undefined}
            />
        </div>
    ),
};
