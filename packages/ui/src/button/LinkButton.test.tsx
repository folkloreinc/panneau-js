import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
    it('renders a link with the class names of a button', () => {
        render(
            <>
                <LinkButton href="/pages/new" tone="accent" size="sm" className="custom">
                    Create
                </LinkButton>
                <Button tone="accent" size="sm" className="custom">
                    Create
                </Button>
            </>,
        );
        const link = screen.getByRole('link', { name: 'Create' });
        expect(link).toHaveAttribute('href', '/pages/new');
        expect(link.className).toBe(screen.getByRole('button', { name: 'Create' }).className);
    });

    it('renders its icon as decorative', () => {
        const { container } = render(
            <LinkButton href="/pages/new" icon={Plus}>
                Create
            </LinkButton>,
        );
        expect(screen.getByRole('link', { name: 'Create' })).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it("goes through the app's router", async () => {
        const navigate = vi.fn();
        render(
            <RouterProvider navigate={navigate}>
                <LinkButton href="/pages/new">Create</LinkButton>
            </RouterProvider>,
        );
        await userEvent.click(screen.getByRole('link', { name: 'Create' }));
        expect(navigate).toHaveBeenCalledWith('/pages/new', undefined);
    });
});
