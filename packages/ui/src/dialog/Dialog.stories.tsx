import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { SegmentedControl } from '../segmented-control/SegmentedControl';
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

/**
 * A picker: the extra large size, a segmented control in the header, and the whole screen on
 * phones instead of a sheet.
 */
export const Picker: Story = {
    args: {
        title: 'Choose media',
        isOpen: true,
        size: 'xl',
        fullScreenOnPhone: true,
        headerContent: (
            <SegmentedControl
                aria-label="Library"
                size="sm"
                options={[
                    { value: 'images', label: 'Images' },
                    { value: 'documents', label: 'Documents' },
                ]}
            />
        ),
        children: 'The grid of media.',
        footer: (
            <>
                <Button>Cancel</Button>
                <Button variant="primary">Select</Button>
            </>
        ),
    },
    play: async ({ canvasElement }) => {
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
            name: 'Choose media',
        });
        await userEvent.click(within(dialog).getByRole('radio', { name: 'Documents' }));
        await expect(within(dialog).getByRole('radio', { name: 'Documents' })).toBeChecked();
    },
};

const submitPage = fn();
const submitKey = fn();

/**
 * A dialog opened from a form, with a form of its own: submitting it doesn't submit the form of the
 * page, although React bubbles events through the dialog's portal.
 */
export const InsideAForm: Story = {
    args: { title: 'New API key' },
    render: (args) => (
        <form
            aria-label="Project"
            onSubmit={(event) => {
                event.preventDefault();
                submitPage();
            }}
        >
            <TextInput label="Project name" defaultValue="Northwind" />
            <DialogTrigger>
                <Button>New API key</Button>
                <Dialog {...args}>
                    {(close) => (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitKey();
                                close();
                            }}
                        >
                            <TextInput label="Name of the key" autoFocus />
                            <Button type="submit" variant="primary">
                                Create the key
                            </Button>
                        </form>
                    )}
                </Dialog>
            </DialogTrigger>
        </form>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        submitPage.mockClear();
        submitKey.mockClear();
        await userEvent.click(canvas.getByRole('button', { name: 'New API key' }));
        const dialog = within(await within(document.body).findByRole('dialog'));
        await userEvent.type(dialog.getByLabelText('Name of the key'), 'Encoder{Enter}');
        await expect(submitKey).toHaveBeenCalledTimes(1);
        await expect(submitPage).not.toHaveBeenCalled();
    },
};
