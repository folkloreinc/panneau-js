import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { UploadList } from './UploadList';
import type { UploadItem } from './types';

const item = (overrides: Partial<UploadItem> & Pick<UploadItem, 'id' | 'name'>): UploadItem => ({
    size: 2_400_000,
    mime: 'video/mp4',
    progress: 0.4,
    status: 'uploading',
    error: null,
    canPause: false,
    ...overrides,
});

const meta = {
    title: 'Fields/Uploads/UploadList',
    component: UploadList,
    args: {
        items: [
            item({ id: '1', name: 'interview.mp4', size: 2_147_483_648, canPause: true }),
            item({ id: '2', name: 'b-roll.mp4', status: 'paused', progress: 0.7, canPause: true }),
            item({ id: '3', name: 'terms.pdf', mime: 'application/pdf', status: 'completing' }),
            item({ id: '4', name: 'notes.csv', mime: 'text/csv', progress: null }),
            item({
                id: '5',
                name: 'photo.jpg',
                mime: 'image/jpeg',
                status: 'failed',
                error: 'Network error',
            }),
        ],
        onPause: fn(),
        onResume: fn(),
        onCancel: fn(),
        onRetry: fn(),
    },
} satisfies Meta<typeof UploadList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every status: uploading, paused, finishing with the backend, without progress yet, failed. */
export const Statuses: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('list', { name: 'Uploads' })).toBeVisible();
        await expect(canvas.getByRole('alert')).toHaveTextContent('Failed: Network error');

        await userEvent.click(canvas.getByRole('button', { name: 'Pause interview.mp4' }));
        await expect(args.onPause).toHaveBeenCalledWith('1');
        await userEvent.click(canvas.getByRole('button', { name: 'Resume b-roll.mp4' }));
        await expect(args.onResume).toHaveBeenCalledWith('2');
        await userEvent.click(canvas.getByRole('button', { name: 'Retry photo.jpg' }));
        await expect(args.onRetry).toHaveBeenCalledWith('5');
        await userEvent.click(canvas.getByRole('button', { name: 'Cancel notes.csv' }));
        await expect(args.onCancel).toHaveBeenCalledWith('4');
        // A file being completed with the backend can't be cancelled any more.
        await expect(
            canvas.queryByRole('button', { name: 'Cancel terms.pdf' }),
        ).not.toBeInTheDocument();
    },
};

/** Nothing is rendered without files. */
export const Empty: Story = {
    args: { items: [] },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole('list')).not.toBeInTheDocument();
    },
};
