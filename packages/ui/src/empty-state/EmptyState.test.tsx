import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
    it('shows a title, a description and actions', () => {
        const { container } = render(
            <EmptyState
                icon={Inbox}
                title="No items yet."
                description="Items you create show up here."
                actions={<button>Create an item</button>}
            />,
        );
        expect(screen.getByText('No items yet.').tagName).toBe('P');
        expect(screen.getByText('Items you create show up here.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create an item' })).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('makes its title a heading with a level', () => {
        render(<EmptyState title="Nothing here" headingLevel={2} />);
        expect(screen.getByRole('heading', { level: 2, name: 'Nothing here' })).toBeInTheDocument();
    });

    it('draws nothing it has not been given', () => {
        const { container } = render(<EmptyState size="sm" title="No data" />);
        expect(container.querySelector('svg')).toBeNull();
        expect(container.querySelectorAll('.panneau-empty-state > *')).toHaveLength(1);
    });
});
