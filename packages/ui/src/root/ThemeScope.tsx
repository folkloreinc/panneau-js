import { type HTMLAttributes, type ReactNode, use, useState } from 'react';

import type { ColorScheme, Density, Theme } from '../theme/theme';
import { cx } from '../utils/cx';
import { PortalProvider, ScopeContext, useThemeStyles } from './PanneauRoot';
import styles from './PanneauRoot.module.css';

export interface ThemeScopeProps extends HTMLAttributes<HTMLElement> {
    /** Element to render. Defaults to `div`. */
    as?: 'div' | 'section' | 'aside' | 'nav' | 'header' | 'footer' | 'main' | 'article';
    /** A theme for the subtree, over the theme of the root. */
    theme?: Theme | null;
    /** A color scheme for the subtree. Inherited by default. */
    colorScheme?: ColorScheme;
    /** A density for the subtree. Inherited by default. */
    density?: Density;
    children?: ReactNode;
}

/**
 * Applies a theme, a color scheme or a density to a subtree, like `data-bs-theme` on any element:
 * a dark sidebar in a light app, a compact table, a preview in another brand's colors. Overlays
 * opened inside it render in its own container, so that they keep its tokens. It must be inside a
 * `PanneauRoot`.
 *
 * What it doesn't set comes from its parent: a scope with only a density keeps the colors of the
 * theme around it.
 */
export function ThemeScope({
    as: Element = 'div',
    theme = null,
    colorScheme,
    density,
    className,
    children,
    ...props
}: ThemeScopeProps) {
    const parent = use(ScopeContext);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const { scope, styles: themeStyles } = useThemeStyles(theme, parent.nonce);
    // The effective values are always written, so that the dark and density rules of a theme apply.
    // Only those set here take the default tokens back (`.scheme`, `.density`).
    const effective = {
        colorScheme: colorScheme ?? parent.colorScheme,
        density: density ?? parent.density,
        nonce: parent.nonce,
    };
    return (
        <Element
            {...props}
            className={cx(
                'panneau-theme-scope',
                styles.scope,
                colorScheme !== undefined && styles.scheme,
                density !== undefined && styles.density,
                className,
            )}
            data-color-scheme={effective.colorScheme}
            data-density={effective.density}
            data-panneau-theme={scope}
        >
            {themeStyles}
            <ScopeContext value={effective}>
                <PortalProvider value={container}>{children}</PortalProvider>
            </ScopeContext>
            <div ref={setContainer} className={styles.portal} />
        </Element>
    );
}
