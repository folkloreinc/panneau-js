import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Action, Resource } from '@panneau/protocol';

import {
    CurrentPageProvider,
    useCurrentPage,
    usePublishItemActions,
    usePublishPage,
} from './currentPage';

const resource = { id: 'pages' } as Resource;
const archive = { id: 'archive', label: 'Archive' } as Action;

function Publisher({ onRun }: { onRun: (count: number) => void }) {
    const [count, setCount] = useState(0);
    // New objects on each render, with the same values
    usePublishPage({ resource, item: undefined });
    usePublishItemActions([{ action: archive, href: null, run: () => onRun(count) }]);
    return <button onClick={() => setCount(count + 1)}>Render</button>;
}

function Palette({ onRender }: { onRender: () => void }) {
    const current = useCurrentPage();
    onRender();
    return (
        <button onClick={() => current?.actions[0]?.run()}>
            {current?.page.resource?.id} {current?.actions.map(({ action }) => action.id).join()}
        </button>
    );
}

describe('the current page (decision 0116)', () => {
    it("doesn't tell the palette when a render publishes the same page and actions", async () => {
        const user = userEvent.setup();
        const onRender = vi.fn();
        const onRun = vi.fn();
        render(
            <CurrentPageProvider route="resource.edit">
                <Publisher onRun={onRun} />
                <Palette onRender={onRender} />
            </CurrentPageProvider>,
        );
        const palette = screen.getByRole('button', { name: 'pages archive' });
        const renders = onRender.mock.calls.length;
        await user.click(screen.getByRole('button', { name: 'Render' }));
        await user.click(screen.getByRole('button', { name: 'Render' }));
        expect(onRender).toHaveBeenCalledTimes(renders);
        // It runs the latest function of the button
        await user.click(palette);
        expect(onRun).toHaveBeenCalledWith(2);
    });
});
