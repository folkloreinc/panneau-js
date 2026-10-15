import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { type ToastContent, useToast } from './Toast';

function ToastButtons() {
    const toasts = useToast();
    const examples: [string, ToastContent][] = [
        ['Success', { title: 'Page saved', tone: 'success' }],
        [
            'Error with retry',
            {
                title: 'The page could not be saved',
                description: 'Check your connection.',
                tone: 'danger',
                action: { label: 'Retry', onAction: () => undefined },
            },
        ],
        ['Warning', { title: 'Someone else is editing this page', tone: 'warning' }],
        ['Neutral', { title: 'Link copied' }],
    ];
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {examples.map(([label, content]) => (
                <Button key={label} onPress={() => toasts.show(content)}>
                    {label}
                </Button>
            ))}
        </div>
    );
}

const meta = { title: 'UI/Toast', component: ToastButtons } satisfies Meta<typeof ToastButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Error with retry' }));
        await expect(await body.findByText('The page could not be saved')).toBeVisible();
        await userEvent.click(await body.findByRole('button', { name: 'Retry' }));
    },
};
