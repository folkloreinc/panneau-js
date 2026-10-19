import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { PanneauRoot, usePortalContainer } from './PanneauRoot';
import styles from './PanneauRoot.module.css';
import { ThemeScope } from './ThemeScope';

function Probe({ id }: { id: string }) {
    const container = usePortalContainer();
    return <span data-testid={id}>{container?.parentElement?.getAttribute('data-testid')}</span>;
}

describe('ThemeScope', () => {
    it('inherits the color scheme and density it does not set', () => {
        render(
            <PanneauRoot colorScheme="dark" density="compact">
                <ThemeScope data-testid="scope" as="aside" density="touch" />
            </PanneauRoot>,
        );
        const scope = screen.getByTestId('scope');
        expect(scope.nodeName).toBe('ASIDE');
        expect(scope).toHaveAttribute('data-color-scheme', 'dark');
        expect(scope).toHaveAttribute('data-density', 'touch');
        // Only what it sets takes the default tokens back.
        expect(scope).toHaveClass(
            'panneau-theme-scope',
            String(styles.scope),
            String(styles.density),
        );
        expect(scope).not.toHaveClass(String(styles.scheme));
    });

    it('passes its values to the scopes inside it', () => {
        render(
            <PanneauRoot>
                <ThemeScope colorScheme="dark">
                    <ThemeScope data-testid="inner" />
                </ThemeScope>
            </PanneauRoot>,
        );
        expect(screen.getByTestId('inner')).toHaveAttribute('data-color-scheme', 'dark');
        expect(screen.getByTestId('inner')).toHaveAttribute('data-density', 'auto');
    });

    it('applies a theme through a scoped style', () => {
        render(
            <PanneauRoot>
                <ThemeScope
                    data-testid="scope"
                    theme={{ tokens: { 'panneau-color-accent': '#f25c05' } }}
                />
            </PanneauRoot>,
        );
        const scope = screen.getByTestId('scope').getAttribute('data-panneau-theme');
        expect(scope).toMatch(/^[a-z0-9]+$/);
        const style = document.querySelector(`style[data-href="panneau-theme-${String(scope)}"]`);
        expect(style?.textContent).toContain('--panneau-color-accent:#f25c05;');
    });

    it('gives overlays inside it its own container', () => {
        render(
            <PanneauRoot data-testid="root">
                <Probe id="outside" />
                <ThemeScope data-testid="scope">
                    <Probe id="inside" />
                </ThemeScope>
            </PanneauRoot>,
        );
        expect(screen.getByTestId('outside')).toHaveTextContent('root');
        expect(screen.getByTestId('inside')).toHaveTextContent('scope');
    });
});

describe('default tokens of scopes', () => {
    const css = readFileSync(join(import.meta.dirname, 'PanneauRoot.module.css'), 'utf8');
    const declarations = (selector: string) => {
        const start = css.indexOf(`${selector} {`);
        const block = css.slice(start, css.indexOf('\n}', start));
        return Object.fromEntries(
            [...block.matchAll(/(--panneau-[a-z0-9-]+):\s*([^;]+);/g)].map((match) => [
                match[1],
                match[2]?.replace(/\s+/g, ' '),
            ]),
        );
    };
    const root = declarations(':where(.root)');

    it('take back the light value of every token the dark scheme changes', () => {
        const dark = declarations(
            ":where(.root[data-color-scheme='dark'], .scheme[data-color-scheme='dark'])",
        );
        const light = declarations(
            ":where(.scheme[data-color-scheme='light'], .scheme[data-color-scheme='auto'])",
        );
        expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
        Object.entries(light).forEach(([name, value]) => {
            expect(value, name).toBe(root[name]);
        });
    });

    it('take back the comfortable value of every token a density changes', () => {
        const compact = declarations(
            ":where(.root[data-density='compact'], .density[data-density='compact'])",
        );
        const comfortable = declarations(
            ":where(.density[data-density='comfortable'], .density[data-density='auto'])",
        );
        expect(Object.keys(comfortable).sort()).toEqual(Object.keys(compact).sort());
        Object.entries(comfortable).forEach(([name, value]) => {
            expect(value, name).toBe(root[name]);
        });
    });
});
