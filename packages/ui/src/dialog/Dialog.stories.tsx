import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createPortal } from 'react-dom';
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
                        <Button tone="accent" onPress={close}>
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
                <Button tone="danger">Delete</Button>
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
                <Button tone="accent">Select</Button>
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
                            <Button type="submit" tone="accent">
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

/**
 * Suspended while a window of another site, which a script adds to the page, picks a file: the
 * dialog hides, the page is no longer inert, and the dialog comes back as it was.
 */
function SuspendedDialog() {
    const [picking, setPicking] = useState(false);
    const [file, setFile] = useState<string | null>(null);
    return (
        <>
            <Dialog title="Import a list" isOpen isSuspended={picking}>
                <p>{file === null ? 'No file chosen.' : `Chosen: ${file}`}</p>
                <Button onPress={() => setPicking(true)}>Choose in the drive</Button>
            </Dialog>
            {picking
                ? createPortal(
                      <div role="dialog" aria-label="Drive">
                          <button
                              type="button"
                              onClick={() => {
                                  setFile('Guests.csv');
                                  setPicking(false);
                              }}
                          >
                              Guests.csv
                          </button>
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}

export const Suspended: Story = {
    args: { title: 'Import a list' },
    render: () => <SuspendedDialog />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('dialog', { name: 'Import a list' });
        await userEvent.click(within(dialog).getByRole('button', { name: 'Choose in the drive' }));
        const drive = await body.findByRole('dialog', { name: 'Drive' });
        await expect(body.queryByRole('dialog', { name: 'Import a list' })).not.toBeInTheDocument();
        await userEvent.click(within(drive).getByRole('button', { name: 'Guests.csv' }));
        const back = await body.findByRole('dialog', { name: 'Import a list' });
        await expect(back).toHaveTextContent('Chosen: Guests.csv');
    },
};
