import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { PanneauRoot } from '../root/PanneauRoot';
import { ToastProvider, useToast } from '../toast/Toast';

declare module './tones' {
    interface PanneauTones {
        signal: true;
    }
}

declare module '../badge/Badge' {
    interface BadgeVariants {
        tag: true;
    }
}

describe('tones and appearances', () => {
    it.each([
        [undefined, 'panneau-tone-neutral', 'outline'],
        ['primary', 'panneau-tone-accent', 'solid'],
        ['secondary', 'panneau-tone-neutral', 'outline'],
        ['ghost', 'panneau-tone-neutral', 'ghost'],
        ['danger', 'panneau-tone-danger', 'solid'],
    ] as const)(
        'maps the button variant %s to a tone and an appearance',
        (variant, tone, appearance) => {
            render(<Button variant={variant}>Save</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain(tone);
            expect(button.className).toMatch(new RegExp(`(^| )\\S*${appearance}\\S*( |$)`));
            expect(button.className).not.toContain('variant-');
        },
    );

    it('lets tone and appearance win over a variant alias', () => {
        render(
            <Button variant="primary" tone="signal" appearance="subtle">
                Save
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button.className).toContain('panneau-tone-signal');
        expect(button.className).toMatch(/subtle/);
    });

    it('defaults a colored tone to solid', () => {
        render(<Button tone="success">Publish</Button>);
        expect(screen.getByRole('button').className).toMatch(/solid/);
    });

    it('applies a named variant of the theme', () => {
        const { container } = render(<Badge variant="tag">New</Badge>);
        expect(container.firstChild).toHaveClass('panneau-badge', 'panneau-badge-variant-tag');
        expect((container.firstChild as Element).className).toContain('panneau-tone-neutral');
    });

    it('keeps icon buttons ghost by default', () => {
        render(<IconButton icon={() => null} label="Close" showTooltip={false} />);
        expect(screen.getByRole('button').className).toMatch(/ghost/);
    });

    it('gives alerts with a tone of the theme an icon', () => {
        const { container } = render(
            <PanneauRoot>
                <Alert tone="signal">Live</Alert>
            </PanneauRoot>,
        );
        expect(container.querySelector('.panneau-alert')?.className).toContain(
            'panneau-tone-signal',
        );
        expect(container.querySelector('.panneau-alert svg')).not.toBeNull();
    });

    it('colors the edge of toasts with a tone', async () => {
        function Show() {
            const toasts = useToast();
            return (
                <button
                    type="button"
                    onClick={() => toasts.show({ title: 'Saved', tone: 'signal' })}
                >
                    Show
                </button>
            );
        }
        render(
            <ToastProvider>
                <Show />
            </ToastProvider>,
        );
        screen.getByRole('button', { name: 'Show' }).click();
        const toast = await screen.findByText('Saved');
        expect(toast.closest('.panneau-toast')?.className).toMatch(
            /panneau-tone-signal.*toned|toned.*panneau-tone-signal/,
        );
    });
});
