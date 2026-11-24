import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { TextInput } from '../text-input/TextInput';
import { useShortcut, useShortcutHelp } from './useShortcut';

/**
 * A page with a few shortcuts: one of the page, and one of a form, scoped to it. `?` opens the
 * help, and so does the button, as the user's menu and "Go to…" do in the app.
 */
function Page() {
    const [saved, setSaved] = useState(0);
    const [sidebar, setSidebar] = useState(true);
    const form = useRef<HTMLFormElement>(null);
    const openHelp = useShortcutHelp();
    useShortcut({
        id: 'sidebar',
        keys: 'Mod+\\',
        label: 'Collapse or expand the sidebar',
        inInputs: false,
        perform: () => setSidebar((shown) => !shown),
    });
    useShortcut({
        id: 'save',
        keys: ['Mod+S', 'Mod+Enter'],
        label: 'Save',
        group: 'Forms',
        scope: form,
        perform: () => setSaved((count) => count + 1),
    });
    return (
        <div style={{ display: 'grid', gap: 16, padding: 24 }}>
            <p>{`Sidebar: ${sidebar ? 'shown' : 'collapsed'}. Saved ${saved} times.`}</p>
            <form ref={form} onSubmit={(event) => event.preventDefault()}>
                <TextInput label="Title" />
            </form>
            {openHelp !== null ? <Button onPress={openHelp}>Keyboard shortcuts</Button> : null}
        </div>
    );
}

const meta = {
    title: 'UI/Shortcut help',
    component: Page,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `?` opens the help, which lists the shortcuts registered now, by group. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.keyboard('?');
        const help = await body.findByRole('dialog', { name: 'Keyboard shortcuts' });
        const dialog = within(help);
        await expect(dialog.getByRole('heading', { name: 'General' })).toBeInTheDocument();
        await expect(dialog.getByRole('heading', { name: 'Forms' })).toBeInTheDocument();
        await expect(dialog.getByText('Collapse or expand the sidebar')).toBeInTheDocument();
        await expect(dialog.getByText('Save')).toBeInTheDocument();
        await expect(dialog.getByText('Show keyboard shortcuts')).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    },
};

/**
 * Single keys are ignored while the user types, and the help turns them off. The choice is kept
 * in the browser, so the story turns them back on.
 */
export const SingleKeys: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Title' }), 'Why?');
        await expect(canvas.getByRole('textbox', { name: 'Title' })).toHaveValue('Why?');
        await expect(body.queryByRole('dialog')).toBeNull();
        await userEvent.click(canvas.getByRole('button', { name: 'Keyboard shortcuts' }));
        const help = await body.findByRole('dialog', { name: 'Keyboard shortcuts' });
        const singleKeys = within(help).getByRole('switch', { name: 'Single-key shortcuts' });
        await expect(singleKeys).toBeChecked();
        await userEvent.click(singleKeys);
        await expect(singleKeys).not.toBeChecked();
        await userEvent.click(singleKeys);
        await expect(singleKeys).toBeChecked();
    },
};
