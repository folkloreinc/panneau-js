import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
    it('shows its content', () => {
        render(<Badge tone="success">Published</Badge>);
        expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('replaces its content for assistive technologies with a label', () => {
        render(
            <button>
                SEO <Badge label="2 errors">2</Badge>
            </button>,
        );
        expect(screen.getByRole('button')).toHaveAccessibleName('SEO 2 errors');
    });
});
