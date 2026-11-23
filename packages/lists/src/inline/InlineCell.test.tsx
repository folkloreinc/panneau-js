import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createList } from '@panneau/core';
import type { Field } from '@panneau/protocol';

import { ListView } from '../ListView';
import { statusField } from '../__fixtures__/pages';
import { renderList } from '../__fixtures__/render';
import type { ListColumn, ListInlineEditHandler, ListItem } from '../types';

const nameField: Field = {
    name: 'name',
    type: 'text',
    label: 'Name',
    rules: [{ rule: 'required' }],
};
const activeField: Field = { name: 'active', type: 'boolean', label: 'Active' };
const columns: ListColumn[] = [
    { id: 'name', label: 'Name', field: nameField, display: 'text' },
    { id: 'status', label: 'Status', field: statusField, display: 'select' },
    { id: 'active', label: 'Active', field: activeField, display: 'boolean' },
];
const ada: ListItem = {
    id: '1',
    version: '3',
    name: 'Ada',
    status: 'draft',
    active: false,
    abilities: { update: true },
};

/** A save that the test answers when it wants. */
function deferred() {
    let resolve: (item: ListItem) => void = () => undefined;
    let reject: (error: unknown) => void = () => undefined;
    const promise = new Promise<ListItem>((onResolve, onReject) => {
        resolve = onResolve;
        reject = onReject;
    });
    return { promise, resolve, reject };
}

function renderCells(onEdit: ListInlineEditHandler) {
    renderList(
        <ListView
            list={createList()}
            columns={columns}
            items={[ada]}
            inline={{ fields: ['name', 'status', 'active'], onEdit }}
        />,
    );
    const row = () => screen.getAllByRole('row')[1] as HTMLElement;
    const checkbox = () => within(row()).getByRole('checkbox', { name: 'Active' });
    return { row, checkbox };
}

describe('InlineCell', () => {
    it('shows a new text at once, and stays usable while it saves', async () => {
        const user = userEvent.setup();
        const save = deferred();
        const onEdit = vi.fn<ListInlineEditHandler>(() => save.promise);
        const { row } = renderCells(onEdit);
        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        await user.type(screen.getByRole('textbox', { name: 'Name' }), ' L{Enter}');

        // Before the answer: the value, a spinner, and the edit button, which has the focus
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('textbox')).toBeNull();
        expect(row()).toHaveTextContent('Ada L');
        expect(within(row()).getByRole('progressbar', { name: 'Saving…' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit Name of Ada L' })).toHaveFocus();
        // The other cells of the row can be edited meanwhile
        expect(screen.getByRole('button', { name: 'Edit Status of Ada L' })).toBeEnabled();

        await act(async () => save.resolve({ ...ada, name: 'Ada L', version: '4' }));
        await waitFor(() => expect(within(row()).queryByRole('progressbar')).toBeNull());
        expect(row()).toHaveTextContent('Ada L');
        expect(await screen.findByText('“Ada L”: Name saved.')).toBeInTheDocument();
    });

    it('shows a boolean at once, and keeps its checkbox usable while it saves', async () => {
        const user = userEvent.setup();
        const save = deferred();
        const { checkbox } = renderCells(() => save.promise);
        await user.click(checkbox());
        expect(checkbox()).toBeChecked();
        expect(checkbox()).toBeEnabled();
        await act(async () => save.resolve({ ...ada, active: true, version: '4' }));
        expect(checkbox()).toBeChecked();
    });

    it('saves two quick edits of a cell one after the other, the second with the first’s version', async () => {
        const user = userEvent.setup();
        const first = deferred();
        const second = deferred();
        const onEdit = vi
            .fn<ListInlineEditHandler>()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const { checkbox } = renderCells(onEdit);
        await user.click(checkbox());
        await user.click(checkbox());
        // The second waits for the first, and shows meanwhile
        expect(checkbox()).not.toBeChecked();
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenLastCalledWith({ item: ada, field: activeField, value: true });

        const saved = { ...ada, active: true, version: '4' };
        await act(async () => first.resolve(saved));
        expect(onEdit).toHaveBeenCalledTimes(2);
        expect(onEdit).toHaveBeenLastCalledWith({ item: saved, field: activeField, value: false });
        expect(checkbox()).not.toBeChecked();

        await act(async () => second.resolve({ ...saved, active: false, version: '5' }));
        expect(checkbox()).not.toBeChecked();
        // One toast, whose "Undo" puts back the value from before both
        const toast = await screen.findByText('“Ada”: Active saved.');
        expect(toast).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(1);
    });

    it('doesn’t send a value picked back while the first is saving', async () => {
        const user = userEvent.setup();
        const save = deferred();
        const onEdit = vi.fn<ListInlineEditHandler>(() => save.promise);
        const { checkbox } = renderCells(onEdit);
        await user.click(checkbox());
        await user.click(checkbox());
        await user.click(checkbox());
        expect(checkbox()).toBeChecked();
        await act(async () => save.resolve({ ...ada, active: true, version: '4' }));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(checkbox()).toBeChecked();
    });

    it('puts the value back when the save fails, and says why on the cell', async () => {
        const user = userEvent.setup();
        const save = deferred();
        const { checkbox, row } = renderCells(() => save.promise);
        await user.click(checkbox());
        expect(checkbox()).toBeChecked();
        await act(async () => save.reject(new Error('The network is down.')));
        expect(checkbox()).not.toBeChecked();
        expect(within(row()).getByText('The network is down.')).toBeInTheDocument();
    });

    it('puts a text back in the row when the save fails, and keeps it in the control', async () => {
        const user = userEvent.setup();
        const save = deferred();
        renderCells(() => save.promise);
        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        await user.type(screen.getByRole('textbox', { name: 'Name' }), ' L{Enter}');
        expect(screen.getByRole('button', { name: 'Edit Status of Ada L' })).toBeInTheDocument();
        await act(async () =>
            save.reject({
                problem: {
                    type: 'urn:panneau:problem:validation',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { name: ['This name is taken.'] },
                },
            }),
        );
        // The row has the saved value again; the control keeps the typed one, with the message
        expect(screen.getByRole('button', { name: 'Edit Status of Ada' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada L');
        expect(screen.getByText('This name is taken.')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    });

    it('drops an edit picked after one that fails', async () => {
        const user = userEvent.setup();
        const save = deferred();
        const onEdit = vi.fn<ListInlineEditHandler>(() => save.promise);
        const { checkbox, row } = renderCells(onEdit);
        await user.click(checkbox());
        await user.click(checkbox());
        await act(async () => save.reject(new Error('The network is down.')));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(checkbox()).not.toBeChecked();
        expect(within(row()).getByText('The network is down.')).toBeInTheDocument();
    });

    it('undoes a save from its toast, with the version the save got', async () => {
        const user = userEvent.setup();
        const saved = { ...ada, active: true, version: '4' };
        const onEdit = vi
            .fn<ListInlineEditHandler>()
            .mockResolvedValueOnce(saved)
            .mockResolvedValueOnce({ ...saved, active: false, version: '5' });
        const { checkbox } = renderCells(onEdit);
        await user.click(checkbox());
        await user.click(await screen.findByRole('button', { name: 'Undo' }));
        expect(onEdit).toHaveBeenLastCalledWith({ item: saved, field: activeField, value: false });
        expect(checkbox()).not.toBeChecked();
        expect(await screen.findByText('“Ada”: Active put back.')).toBeInTheDocument();
    });

    it('keeps the flow of a conflict: the current value, and "Save mine"', async () => {
        const user = userEvent.setup();
        const current = { ...ada, version: '4', name: 'Ada L.' };
        const onEdit = vi.fn<ListInlineEditHandler>().mockRejectedValueOnce({
            problem: {
                type: 'urn:panneau:problem:version-conflict',
                title: 'The item was changed by someone else.',
                status: 412,
                current,
            },
        });
        const { checkbox, row } = renderCells(onEdit);
        await user.click(checkbox());
        const alert = await within(row()).findByRole('alert');
        expect(alert).toHaveTextContent('Someone else changed it to:');
        expect(checkbox()).not.toBeChecked();
        expect(row()).toHaveTextContent('Ada L.');
        onEdit.mockResolvedValueOnce({ ...current, active: true, version: '5' });
        await user.click(within(alert).getByRole('button', { name: 'Save mine' }));
        expect(onEdit).toHaveBeenLastCalledWith({ item: current, field: activeField, value: true });
        expect(checkbox()).toBeChecked();
        await waitFor(() => expect(within(row()).queryByRole('alert')).toBeNull());
    });
});
