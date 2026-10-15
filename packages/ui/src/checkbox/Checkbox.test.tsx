import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
    it('toggles', async () => {
        const onChange = vi.fn();
        render(
            <Checkbox isSelected={false} onChange={onChange}>
                Published
            </Checkbox>,
        );
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('is described by its description and errors', () => {
        render(
            <Checkbox description="Visible on the site" errors={['Must be accepted.']}>
                Terms
            </Checkbox>,
        );
        const checkbox = screen.getByRole('checkbox', { name: 'Terms' });
        expect(checkbox).toHaveAccessibleDescription('Visible on the site Must be accepted.');
        expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('can be indeterminate', () => {
        render(<Checkbox isIndeterminate>All</Checkbox>);
        expect(screen.getByRole('checkbox')).toHaveProperty('indeterminate', true);
    });

    it('does not change when read-only', async () => {
        const onChange = vi.fn();
        render(
            <Checkbox isReadOnly onChange={onChange}>
                Published
            </Checkbox>,
        );
        await userEvent.click(screen.getByRole('checkbox'));
        expect(onChange).not.toHaveBeenCalled();
    });
});
