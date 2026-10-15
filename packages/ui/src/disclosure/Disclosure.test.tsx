import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
    it('expands and collapses its content', async () => {
        const onExpandedChange = vi.fn();
        render(
            <Disclosure title="Sharing" onExpandedChange={onExpandedChange}>
                <p>Content</p>
            </Disclosure>,
        );
        const trigger = screen.getByRole('button', { name: 'Sharing' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledWith(true);
        expect(screen.getByText('Content')).toBeVisible();
    });

    it('starts expanded with defaultExpanded', () => {
        render(
            <Disclosure title="Sharing" defaultExpanded headingLevel={2}>
                Content
            </Disclosure>,
        );
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });
});
