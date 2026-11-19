import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of EmptyState. */
export const emptyStateTokens = defineComponentTokens('empty-state', {
    /** Space between the icon, the text and the actions. */
    gap: 'var(--panneau-space-3)',
    /** Vertical padding of `md`. */
    'padding-y': 'var(--panneau-space-10)',
    /** Vertical padding of `sm`. */
    'padding-y-sm': 'var(--panneau-space-4)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-4)',
    /** Widest line of the description. */
    'max-width': '32rem',
    /** Size of the square around the icon. */
    'icon-size': '3rem',
    /** Background of the square around the icon. */
    'icon-bg': 'var(--panneau-color-surface-sunken)',
    /** Color of the icon. */
    'icon-color': 'var(--panneau-color-text-muted)',
    /** Corner radius of the square around the icon. */
    'icon-radius': 'var(--panneau-radius-lg)',
    /** Font size of the title of `md`. */
    'title-font-size': 'var(--panneau-font-size-lg)',
    /** Font size of the title of `sm`. */
    'title-font-size-sm': 'var(--panneau-font-size-md)',
    /** Font weight of the title. */
    'title-font-weight': 'var(--panneau-font-weight-medium)',
    /** Color of the description. */
    'description-color': 'var(--panneau-color-text-muted)',
});
