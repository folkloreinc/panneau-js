import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
    it('turns on and off', async () => {
        const onChange = vi.fn();
        render(
            <Switch isSelected onChange={onChange} description="Sends an email">
                Notify
            </Switch>,
        );
        const toggle = screen.getByRole('switch', { name: 'Notify' });
        expect(toggle).toBeChecked();
        expect(toggle).toHaveAccessibleDescription('Sends an email');
        await userEvent.click(toggle);
        expect(onChange).toHaveBeenCalledWith(false);
    });
});
