import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

describe('Card', () => {
    it('is a section with a heading, actions and a footer', () => {
        render(
            <Card
                title="Members"
                headingLevel={3}
                actions={<button>Add</button>}
                footer="3 members"
            >
                <p>List</p>
            </Card>,
        );
        expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Members' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
        expect(screen.getByText('3 members')).toBeInTheDocument();
    });

    it('is a plain block without a title', () => {
        const { container } = render(<Card className="custom">Content</Card>);
        expect(container.firstChild?.nodeName).toBe('DIV');
        expect(container.firstChild).toHaveClass('custom');
    });
});
