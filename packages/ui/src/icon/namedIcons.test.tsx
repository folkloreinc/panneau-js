import { render, screen, waitFor } from '@testing-library/react';
import { Send as SendIcon } from 'lucide-react';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Icon, type IconComponent } from './Icon';
import { lucideIconLoader } from './lucideIconLoader';
import { type NamedIconLoader, getNamedIcon, loadNamedIcon } from './namedIcons';

function WithLucide({ children }: { children: ReactNode }) {
    return <PanneauRoot iconLoader={lucideIconLoader}>{children}</PanneauRoot>;
}

describe('named icons', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads a Lucide icon by its name', async () => {
        const Send = await loadNamedIcon('send', lucideIconLoader);
        expect(Send).not.toBeNull();
        const { container } = render(<Icon icon={Send as IconComponent} />);
        expect(container.querySelector('svg')).toHaveClass('lucide-send');
        await expect(loadNamedIcon('calendar-days', lucideIconLoader)).resolves.not.toBeNull();
    });

    it('resolves with null for a name Lucide does not have, with a warning', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        await expect(loadNamedIcon('not-an-icon', lucideIconLoader)).resolves.toBeNull();
        await expect(loadNamedIcon('toString', lucideIconLoader)).resolves.toBeNull();
        expect(warn).toHaveBeenCalledWith('[panneau] No icon named "not-an-icon".');
    });

    it('is the same component for the same name', () => {
        expect(getNamedIcon('pencil')).toBe(getNamedIcon('pencil'));
        expect(getNamedIcon('pencil')).not.toBe(getNamedIcon('trash'));
    });

    it('renders an empty space of the same size, then the icon', async () => {
        const { container } = render(<Icon icon={getNamedIcon('archive')} size="lg" />, {
            wrapper: WithLucide,
        });
        const placeholder = container.querySelector('svg');
        expect(placeholder).toHaveAttribute('data-loading');
        expect(placeholder).toHaveAttribute('width', '20');
        expect(placeholder).toHaveAttribute('aria-hidden', 'true');
        await waitFor(() => expect(container.querySelector('svg')).toHaveClass('lucide-archive'));
        expect(container.querySelector('svg')).toHaveAttribute('width', '20');
        expect(container.querySelector('svg')).not.toHaveAttribute('data-loading');
    });

    it('keeps the label of a labelled icon while it loads', async () => {
        render(<Icon icon={getNamedIcon('bell')} label="Notifications" />, { wrapper: WithLucide });
        expect(screen.getByRole('img', { name: 'Notifications' })).toHaveAttribute('data-loading');
        await waitFor(() =>
            expect(screen.getByRole('img', { name: 'Notifications' })).toHaveClass('lucide-bell'),
        );
    });

    it('renders an icon that is already loaded at once', async () => {
        await loadNamedIcon('star', lucideIconLoader);
        const { container } = render(<Icon icon={getNamedIcon('star')} />, { wrapper: WithLucide });
        expect(container.querySelector('svg')).toHaveClass('lucide-star');
    });

    it('renders nothing for a name the loader does not know', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(<Button icon={getNamedIcon('missing-icon')}>Send</Button>, { wrapper: WithLucide });
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Send' }).querySelector('svg')).toBeNull(),
        );
    });

    it("loads with the app's own loader", async () => {
        const loader: NamedIconLoader = vi.fn((name: string) =>
            Promise.resolve(name === 'send' ? SendIcon : null),
        );
        render(
            <PanneauRoot iconLoader={loader}>
                <Button icon={getNamedIcon('send')}>Send</Button>
            </PanneauRoot>,
        );
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Send' }).querySelector('svg')).toHaveClass(
                'lucide-send',
            ),
        );
        expect(loader).toHaveBeenCalledWith('send');
    });

    it('renders an empty space without a loader, with one warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(
            <PanneauRoot>
                <Button icon={getNamedIcon('send')}>Send</Button>
                <Button icon={getNamedIcon('trash')}>Delete</Button>
            </PanneauRoot>,
        );
        expect(screen.getByRole('button', { name: 'Send' }).querySelector('svg')).toHaveAttribute(
            'data-loading',
        );
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]?.[0]).toContain('has no iconLoader');
    });
});

describe('@panneau/ui', () => {
    it("doesn't import the list of every Lucide icon, which only @panneau/ui/named-icons does", () => {
        const seen = new Set<string>();
        const visit = (file: string) => {
            if (seen.has(file)) {
                return;
            }
            seen.add(file);
            const source = readFileSync(file, 'utf8');
            expect(source, file).not.toContain('dynamicIconImports');
            [...source.matchAll(/^(?:import|export)[^'"]*from '(\.[^']+)'/gm)].forEach((match) => {
                const target = resolve(dirname(file), match[1] ?? '');
                if (target.endsWith('.css')) {
                    return;
                }
                const candidates = [`${target}.ts`, `${target}.tsx`, join(target, 'index.ts')];
                const found = candidates.find((path) => {
                    try {
                        readFileSync(path);
                        return true;
                    } catch {
                        return false;
                    }
                });
                if (found !== undefined) {
                    visit(found);
                }
            });
        };
        visit(join(import.meta.dirname, '../index.ts'));
        expect(seen.size).toBeGreaterThan(50);
    });
});
