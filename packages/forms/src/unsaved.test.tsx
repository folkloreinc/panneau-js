import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { LeaveGuardsProvider, createLeaveGuards } from '@panneau/core';
import type { Field } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

import { Form } from './Form';
import { renderForm } from './__fixtures__/render';
import { useLeaveConfirmation } from './unsaved';

const FIELDS: Field[] = [{ name: 'title', type: 'text', label: 'Title' }];

function unloadPrevented(): boolean {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
}

describe('unsaved changes', () => {
    it('guards the page while the form is dirty', async () => {
        renderForm(<Form fields={FIELDS} />);
        expect(unloadPrevented()).toBe(false);
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(unloadPrevented()).toBe(true);
    });

    it("guards the app's router while the form is dirty", async () => {
        const guards = createLeaveGuards();
        renderForm(
            <LeaveGuardsProvider guards={guards}>
                <Form fields={FIELDS} />
            </LeaveGuardsProvider>,
        );
        expect(guards.isBlocking()).toBe(false);
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(guards.isBlocking()).toBe(true);

        let leave: Promise<boolean> = Promise.resolve(true);
        act(() => {
            leave = guards.confirmLeave();
        });
        const dialog = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        await userEvent.click(within(dialog).getByRole('button', { name: 'Stay' }));
        await expect(leave).resolves.toBe(false);
    });

    it('can leave the page alone', async () => {
        renderForm(<Form fields={FIELDS} guardUnsavedChanges={false} />);
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(unloadPrevented()).toBe(false);
    });

    it('confirms in-app navigation with a dialog', async () => {
        const answers: boolean[] = [];
        function Page() {
            const [dirty, setDirty] = useState(false);
            const { confirmLeave, dialog } = useLeaveConfirmation(dirty);
            return (
                <>
                    <button onClick={() => setDirty(true)}>Edit</button>
                    <button
                        onClick={() => void confirmLeave().then((leave) => answers.push(leave))}
                    >
                        Go
                    </button>
                    {dialog}
                </>
            );
        }
        render(
            <PanneauRoot>
                <Page />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Go' }));
        await waitFor(() => expect(answers).toEqual([true]));
        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
        await userEvent.click(screen.getByRole('button', { name: 'Go' }));
        const dialog = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
        await waitFor(() => expect(answers).toEqual([true, false]));
        expect(dialog).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Go' }));
        await userEvent.click(await screen.findByRole('button', { name: 'Leave' }));
        await waitFor(() => expect(answers).toEqual([true, false, true]));
        act(() => {
            fireEvent.keyDown(document.body, { key: 'Escape' });
        });
    });
});
