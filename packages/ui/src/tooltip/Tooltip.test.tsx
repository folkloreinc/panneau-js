import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
    it('describes its trigger on focus, inside the root', async () => {
        render(
            <PanneauRoot data-testid="root">
                <Tooltip content="Saves the page" className="custom">
                    <Button>Save</Button>
                </Tooltip>
            </PanneauRoot>,
        );
        await act(async () => {
            await userEvent.tab();
        });
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent('Saves the page');
        expect(tooltip).toHaveClass('custom');
        expect(screen.getByTestId('root')).toContainElement(tooltip);
        expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', tooltip.id);
    });
});
