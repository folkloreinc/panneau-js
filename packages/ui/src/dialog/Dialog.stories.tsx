import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { TextInput } from '../text-input/TextInput';
import { Dialog, DialogTrigger } from './Dialog';

const meta = {
    title: 'UI/Dialog',
    component: Dialog,
    args: { title: 'Rename the page' },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTrigger: Story = {
    render: (args) => (
        <DialogTrigger>
            <Button>Rename</Button>
            <Dialog
                {...args}
                footer={(close) => (
                    <>
                        <Button onPress={close}>Cancel</Button>
                        <Button variant="primary" onPress={close}>
                            Rename
                        </Button>
                    </>
                )}
            >
                <TextInput label="Title" defaultValue="About us" autoFocus />
            </Dialog>
        </DialogTrigger>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Rename' }));
        const dialog = await canvas.findByRole('dialog', { name: 'Rename the page' });
        await expect(within(dialog).getByRole('textbox', { name: 'Title' })).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    },
};

export const AlertDialog: Story = {
    args: {
        title: 'Delete the page?',
        role: 'alertdialog',
        isDismissable: false,
        isOpen: true,
        size: 'sm',
        children: 'The page and its blocks will be deleted. This can’t be undone.',
        footer: (
            <>
                <Button>Cancel</Button>
                <Button variant="danger">Delete</Button>
            </>
        ),
    },
};
