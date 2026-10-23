import { defineComponentTokens } from '@panneau/ui';

/**
 * Tokens of the frame of the app: the window's background and the panel of the page. The default
 * insets the page on a raised panel, as in recent browsers; a flat frame sets `inset` and
 * `panel-radius` to `0`.
 */
export const shellTokens = defineComponentTokens('shell', {
    /** Background of the window, behind the sidebar and the panel. */
    bg: 'var(--panneau-color-surface-sunken)',
    /** Space between the panel and the edges of the window. */
    inset: 'var(--panneau-space-2)',
    /** Background of the panel of the page. */
    'panel-bg': 'var(--panneau-color-surface)',
    /** Border of the panel. */
    'panel-border': 'var(--panneau-border-width) solid var(--panneau-color-border)',
    /** Corner radius of the panel. */
    'panel-radius': 'calc(var(--panneau-radius-lg) * 1.5)',
    /** Shadow of the panel. */
    'panel-shadow': 'var(--panneau-shadow-sm)',
    /** Horizontal padding of the page, from the `lg` width. */
    'panel-padding-x': 'var(--panneau-space-8)',
});

/** Tokens of the sidebar: its column, its links and the logo of the site. */
export const sidebarTokens = defineComponentTokens('sidebar', {
    /** Width, expanded. */
    width: '15rem',
    /** Width, collapsed to a rail of icons. */
    'width-collapsed': '3.5rem',
    /** Background. Transparent on the window's background by default. */
    bg: 'transparent',
    /** Border on the side of the page. */
    border: '0 none',
    /** Text and icons of the links. */
    'link-color': 'var(--panneau-color-text-muted)',
    /** Background of a hovered link. */
    'link-hover-bg': 'var(--panneau-color-hover)',
    /** Corner radius of the links. */
    'link-radius': 'var(--panneau-radius-md)',
    /** Text and icon of the current link. */
    'link-current-color': 'var(--panneau-color-text)',
    /** Background of the current link. */
    'link-current-bg': 'var(--panneau-color-surface)',
    /** Border color of the current link. */
    'link-current-border': 'var(--panneau-color-border)',
    /** Shadow of the current link. */
    'link-current-shadow': 'var(--panneau-shadow-sm)',
    /** Background of the logo, the first letter of the site. */
    'logo-bg': 'var(--panneau-color-accent)',
    /** Letter of the logo. */
    'logo-color': 'var(--panneau-color-accent-text)',
});

/** Tokens of the panel of an item's details, next to its list. */
export const itemPanelTokens = defineComponentTokens('item-panel', {
    /** Width, beside the list or over it. */
    width: '24rem',
    /** Width once widened, for previews: a share of the page, or a length. */
    'width-wide': '50%',
    /** Background. */
    bg: 'var(--panneau-color-surface)',
    /** Corner radius, beside the list. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow, beside the list. */
    shadow: 'var(--panneau-shadow-md)',
});

/** The component tokens of `@panneau/app`, by component (decision 0024). */
export const appComponentTokens = Object.freeze({
    shell: shellTokens.tokens,
    sidebar: sidebarTokens.tokens,
    'item-panel': itemPanelTokens.tokens,
});

type AppTokenName =
    | keyof typeof shellTokens.tokens
    | keyof typeof sidebarTokens.tokens
    | keyof typeof itemPanelTokens.tokens;

declare module '@panneau/ui' {
    // Lets `defineTheme()` take the tokens of the app.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the members are inherited
    interface PanneauTokens extends Record<AppTokenName, true> {}
}
