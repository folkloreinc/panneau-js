import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Button } from '@panneau/ui';

import { dragFiles, pasteFiles } from '../__fixtures__/dataTransfer';
import { exampleFile } from '../__fixtures__/uploads';
import { FileDropZone } from './FileDropZone';
import { FilePicker } from './FilePicker';

const meta = {
    title: 'Fields/Uploads/FileDropZone',
    component: FileDropZone,
    args: {
        onSelect: fn(),
        children: (
            <div style={{ display: 'grid', gap: 8, padding: 8 }}>
                <p style={{ margin: 0 }}>report.pdf</p>
                <Button size="sm">Remove report.pdf</Button>
                <FilePicker onSelect={() => undefined} isDroppable={false} />
            </div>
        ),
    },
} satisfies Meta<typeof FileDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Files dropped anywhere on the zone, while it shows and announces where they go. */
export const Drop: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const target = canvas.getByText('report.pdf');
        const dropped = exampleFile('terms.pdf', 'application/pdf');

        dragFiles(target, [dropped], { drop: false });
        await expect(await canvas.findByRole('status')).toHaveTextContent('Drop to upload');
        await expect(canvas.getByText('Drop to upload')).toBeVisible();

        dragFiles(target, [dropped]);
        await expect(await canvas.findByRole('status')).toBeEmptyDOMElement();
        await waitFor(() => expect(args.onSelect).toHaveBeenCalledWith([dropped]));
    },
};

/** Files pasted while the focus is inside the zone. */
export const Paste: Story = {
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole('button', { name: 'Remove report.pdf' });
        button.focus();
        const pasted = exampleFile('screenshot.png', 'image/png');

        await expect(pasteFiles(button, [pasted])).toBe(false);
        await expect(args.onSelect).toHaveBeenCalledWith([pasted]);
    },
};

/** Disabled: drops and pastes are ignored. */
export const Disabled: Story = {
    args: { isDisabled: true },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button', { name: 'Remove report.pdf' });
        pasteFiles(button, [exampleFile('a.png', 'image/png')]);
        dragFiles(canvas.getByText('report.pdf'), [exampleFile('b.png', 'image/png')]);
        await expect(args.onSelect).not.toHaveBeenCalled();
    },
};
