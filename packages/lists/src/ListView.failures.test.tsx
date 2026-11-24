import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createList } from '@panneau/core';
import type * as Ui from '@panneau/ui';

import { ListView } from './ListView';
import { columns, exportAction, pages } from './__fixtures__/pages';
import { renderList } from './__fixtures__/render';

// Toasts that fail to show, which only a test does on purpose.
vi.mock('@panneau/ui', async (importOriginal) => {
    const ui = await importOriginal<typeof Ui>();
    return {
        ...ui,
        useToast: () => ({
            ...ui.useToast(),
            show: () => {
                throw new Error('No room for toasts.');
            },
        }),
    };
});

describe('ListView, when the toast of a failed action throws', () => {
    // The error of the toast is thrown again, as a `finally` block lets it through: catch it here,
    // so that only this test sees it.
    let listeners: NodeJS.UnhandledRejectionListener[] = [];
    const rejections: unknown[] = [];
    const record = (reason: unknown) => {
        rejections.push(reason);
    };
    beforeEach(() => {
        listeners = process.listeners('unhandledRejection');
        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', record);
    });
    afterEach(() => {
        process.off('unhandledRejection', record);
        listeners.forEach((listener) => process.on('unhandledRejection', listener));
    });

    it('is no longer pending', async () => {
        const user = userEvent.setup();
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                total={3}
                actions={{
                    available: [exportAction],
                    onRun: () => Promise.reject(new Error('The export failed.')),
                }}
            />,
        );
        const button = screen.getByRole('button', { name: 'Export' });
        await user.click(button);
        await waitFor(() =>
            expect(rejections).toEqual([
                expect.objectContaining({ message: 'No room for toasts.' }),
            ]),
        );
        await waitFor(() => expect(button).not.toHaveAttribute('aria-disabled'));
        expect(button).not.toHaveAttribute('data-pending');
    });
});
