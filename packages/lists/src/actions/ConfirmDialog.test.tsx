import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fr } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

import { pages, publish, remove } from '../__fixtures__/pages';
import type { ListActionEvent } from '../types';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

/** The built-in `delete`, which the client labels. */
const builtInDelete: Action = { id: 'delete', kind: 'server', scope: ['item', 'selection'] };
const archive: Action = { id: 'archive', label: 'Archive', kind: 'server', scope: ['selection'] };
const labels = { singular: 'article', plural: 'articles' };

function event(action: Action, scope: 'item' | 'selection', count = 1): ListActionEvent {
    return {
        action,
        scope,
        ...(scope === 'item' ? { item: pages[1] } : { selection: { ids: ['1', '2', '3'] } }),
        count,
        skipped: [],
    };
}

function renderDialog(props: Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'>, locale = 'en') {
    return render(
        <PanneauRoot locale={locale} messages={locale === 'fr' ? fr : undefined}>
            <ConfirmDialog {...props} onConfirm={vi.fn()} onCancel={vi.fn()} />
        </PanneauRoot>,
    );
}

describe('ConfirmDialog names what an action applies to (#411)', async () => {
    it('names the item of the built-in delete in its title', async () => {
        renderDialog({ event: event(builtInDelete, 'item'), itemLabel: 'Spring contest' });
        const dialog = await screen.findByRole('alertdialog', { name: 'Delete “Spring contest”?' });
        // The title says it all: no message repeats it
        expect(dialog.querySelector('p')).toBeNull();
    });

    it('names the items of a selection by the labels of their resource', async () => {
        renderDialog({ event: event(builtInDelete, 'selection', 3), labels });
        expect(
            await screen.findByRole('alertdialog', { name: 'Delete 3 articles?' }),
        ).toBeInTheDocument();
        (await screen.findByRole('alertdialog')).remove();
        renderDialog({ event: event(builtInDelete, 'selection', 1), labels });
        expect(
            await screen.findByRole('alertdialog', { name: 'Delete 1 article?' }),
        ).toBeInTheDocument();
    });

    it('names the subject in the message of a declared action, under its own title', async () => {
        renderDialog({ event: event(archive, 'selection', 3), labels });
        const dialog = await screen.findByRole('alertdialog', { name: 'Archive?' });
        expect(dialog).toHaveTextContent('“Archive” will apply to 3 articles.');
    });

    it('keeps the declared confirmation of an action, and counts items without labels', async () => {
        renderDialog({ event: event(publish, 'selection', 2), labels });
        expect(await screen.findByRole('alertdialog')).toHaveTextContent('Publish 2 pages?');
        (await screen.findByRole('alertdialog')).remove();
        renderDialog({ event: event(remove, 'item') });
        expect(await screen.findByRole('alertdialog', { name: 'Delete?' })).toHaveTextContent(
            '“Delete” will apply to 1 item.',
        );
    });

    it('says it in French', async () => {
        renderDialog(
            { event: event(builtInDelete, 'item'), itemLabel: 'Concours du printemps' },
            'fr',
        );
        expect(
            await screen.findByRole('alertdialog', {
                name: 'Supprimer « Concours du printemps » ?',
            }),
        ).toBeInTheDocument();
        (await screen.findByRole('alertdialog')).remove();
        renderDialog(
            {
                event: event(archive, 'selection', 3),
                labels: { singular: 'page', plural: 'pages' },
            },
            'fr',
        );
        expect(await screen.findByRole('alertdialog')).toHaveTextContent(
            '« Archive » s’appliquera à 3 pages.',
        );
    });
});
