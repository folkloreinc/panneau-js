import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Badge. */
export const badgeTokens = defineComponentTokens('badge', {
    /** Space between an icon and the text. */
    gap: 'var(--panneau-space-1)',
    /** Height, and minimum width. */
    height: '1.25rem',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-2)',
    /** Font size. */
    'font-size': 'var(--panneau-font-size-xs)',
    /** Font weight. */
    'font-weight': 'var(--panneau-font-weight-medium)',
    /** Width of the border. */
    'border-width': 'var(--panneau-border-width)',
    /** Corner radius: a pill by default. */
    radius: 'var(--panneau-radius-full)',
});
