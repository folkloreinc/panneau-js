import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActionRunnerProvider } from '@panneau/actions';
import { PanneauProvider, selectItemActions } from '@panneau/core';
import { type Action, Definition, type Item } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

import { createDefinition } from '../__fixtures__/definition';
import { ItemActions } from './ItemActions';

const definition = Definition.parse(
    createDefinition({
        resources: [
            {
                id: 'contests',
                label: { singular: 'contest', plural: 'contests' },
                itemTitle: 'title',
                fields: [{ name: 'title', type: 'text', localized: true }],
            },
        ],
    }),
);

const contest: Item = {
    id: '7',
    version: null,
    title: { en: 'Spring contest', fr: 'Concours du printemps' },
    abilities: { delete: true, archive: true },
};

/** The built-in `delete`, as the definition gives it: no label, and a confirmation. */
const remove: Action = {
    id: 'delete',
    kind: 'server',
    scope: ['item'],
    destructive: true,
    confirm: true,
};
const archive: Action = { id: 'archive', label: 'Archive', kind: 'server', scope: ['item'] };

function renderActions(actions: Action[], runAction: () => Promise<never>) {
    return render(
        <PanneauRoot>
            <PanneauProvider definition={definition}>
                <ActionRunnerProvider
                    adapter={{
                        runAction,
                        getActionRun: () => Promise.reject(new Error('No runs.')),
                    }}
                >
                    <ItemActions
                        resource="contests"
                        actions={selectItemActions(actions, contest, 'form')}
                        item={contest}
                    />
                </ActionRunnerProvider>
            </PanneauProvider>
        </PanneauRoot>,
    );
}

describe('ItemActions names the item (#411)', () => {
    it('in the confirmation of a delete, by its title in the locale of the content', async () => {
        const user = userEvent.setup();
        renderActions([remove], () => Promise.reject(new Error('Gone.')));
        await user.click(screen.getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('alertdialog', {
            name: 'Delete “Spring contest”?',
        });
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        // And in the toast of a failure
        expect(
            await screen.findByText('“Delete” failed for “Spring contest”.'),
        ).toBeInTheDocument();
        expect(screen.getByText('Gone.')).toBeInTheDocument();
    });

    it('in the toast of an action that fails without a confirmation', async () => {
        const user = userEvent.setup();
        const runAction = vi.fn(() => Promise.reject(new Error('The server is down.')));
        renderActions([archive], runAction);
        await user.click(screen.getByRole('button', { name: 'Archive' }));
        expect(
            await screen.findByText('“Archive” failed for “Spring contest”.'),
        ).toBeInTheDocument();
        expect(runAction).toHaveBeenCalledOnce();
    });
});
