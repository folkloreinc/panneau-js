import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from './Alert';

describe('Alert', () => {
    it('shows a title, a message and actions', () => {
        render(
            <Alert tone="danger" title="2 errors" role="alert" actions={<button>Fix</button>}>
                Check the fields below.
            </Alert>,
        );
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('2 errors');
        expect(alert).toHaveTextContent('Check the fields below.');
        expect(screen.getByRole('button', { name: 'Fix' })).toBeInTheDocument();
    });

    it('can be dismissed', async () => {
        const onDismiss = vi.fn();
        render(<Alert onDismiss={onDismiss}>Saved.</Alert>);
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onDismiss).toHaveBeenCalled();
    });

    it('can hide its icon', () => {
        const { container } = render(<Alert icon={null}>Saved.</Alert>);
        expect(container.querySelector('svg')).toBeNull();
    });
});
