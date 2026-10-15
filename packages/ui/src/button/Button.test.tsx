import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
    it('calls onPress when clicked', async () => {
        const onPress = vi.fn();
        render(<Button onPress={onPress}>Save</Button>);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders its icon as decorative', () => {
        const { container } = render(<Button icon={Plus}>Add</Button>);
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('ignores presses while pending, and shows a spinner', async () => {
        const onPress = vi.fn();
        render(
            <Button isPending onPress={onPress}>
                Save
            </Button>,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onPress).not.toHaveBeenCalled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not press when disabled', async () => {
        const onPress = vi.fn();
        render(
            <Button isDisabled onPress={onPress}>
                Save
            </Button>,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onPress).not.toHaveBeenCalled();
    });

    it('adds its class names', () => {
        render(<Button className="custom">Save</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom');
    });
});
