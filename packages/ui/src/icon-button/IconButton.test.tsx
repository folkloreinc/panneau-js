import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { IconButton } from './IconButton';

describe('IconButton', () => {
    it('is labelled, and presses', async () => {
        const onPress = vi.fn();
        render(<IconButton icon={Trash} label="Delete" onPress={onPress} />);
        await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(onPress).toHaveBeenCalled();
    });

    it('shows its label as a tooltip on keyboard focus', async () => {
        render(
            <PanneauRoot>
                <IconButton icon={Trash} label="Delete" />
            </PanneauRoot>,
        );
        await act(async () => {
            await userEvent.tab();
        });
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Delete');
    });
});
