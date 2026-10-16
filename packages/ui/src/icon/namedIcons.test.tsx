import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { Icon, type IconComponent } from './Icon';
import { getNamedIcon, loadNamedIcon } from './namedIcons';

describe('named icons', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads a Lucide icon by its name', async () => {
        const Send = await loadNamedIcon('send');
        expect(Send).not.toBeNull();
        const { container } = render(<Icon icon={Send as IconComponent} />);
        expect(container.querySelector('svg')).toHaveClass('lucide-send');
        await expect(loadNamedIcon('calendar-days')).resolves.not.toBeNull();
    });

    it('resolves with null for a name Lucide does not have, with a warning', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        await expect(loadNamedIcon('not-an-icon')).resolves.toBeNull();
        await expect(loadNamedIcon('toString')).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith('[panneau] Lucide has no icon named "not-an-icon".');
    });

    it('is the same component for the same name', () => {
        expect(getNamedIcon('pencil')).toBe(getNamedIcon('pencil'));
        expect(getNamedIcon('pencil')).not.toBe(getNamedIcon('trash'));
    });

    it('renders an empty space of the same size, then the icon', async () => {
        const { container } = render(<Icon icon={getNamedIcon('archive')} size="lg" />);
        const placeholder = container.querySelector('svg');
        expect(placeholder).toHaveAttribute('data-loading');
        expect(placeholder).toHaveAttribute('width', '20');
        expect(placeholder).toHaveAttribute('aria-hidden', 'true');
        await waitFor(() => expect(container.querySelector('svg')).toHaveClass('lucide-archive'));
        expect(container.querySelector('svg')).toHaveAttribute('width', '20');
        expect(container.querySelector('svg')).not.toHaveAttribute('data-loading');
    });

    it('keeps the label of a labelled icon while it loads', async () => {
        render(<Icon icon={getNamedIcon('bell')} label="Notifications" />);
        expect(screen.getByRole('img', { name: 'Notifications' })).toHaveAttribute('data-loading');
        await waitFor(() =>
            expect(screen.getByRole('img', { name: 'Notifications' })).toHaveClass('lucide-bell'),
        );
    });

    it('renders an icon that is already loaded at once', async () => {
        await loadNamedIcon('star');
        const { container } = render(<Icon icon={getNamedIcon('star')} />);
        expect(container.querySelector('svg')).toHaveClass('lucide-star');
    });

    it('renders nothing for a name Lucide does not have', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(<Button icon={getNamedIcon('missing-icon')}>Send</Button>);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Send' }).querySelector('svg')).toBeNull(),
        );
    });

    it('goes where an icon component goes', async () => {
        render(<Button icon={getNamedIcon('send')}>Send</Button>);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Send' }).querySelector('svg')).toHaveClass(
                'lucide-send',
            ),
        );
    });
});
