import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './Spinner';

describe('Spinner', () => {
    it('is an indeterminate progress bar labelled "Loading…"', () => {
        render(<Spinner />);
        const bar = screen.getByRole('progressbar', { name: 'Loading…' });
        expect(bar).not.toHaveAttribute('aria-valuenow');
    });

    it('can show a custom label', () => {
        render(<Spinner label="Saving" showLabel />);
        expect(screen.getByRole('progressbar', { name: 'Saving' })).toHaveTextContent('Saving');
    });
});
