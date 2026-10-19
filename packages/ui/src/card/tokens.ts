import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Card. */
export const cardTokens = defineComponentTokens('card', {
    /** Background. */
    bg: 'var(--panneau-color-surface)',
    /** Width of the border and of the separators. */
    'border-width': 'var(--panneau-border-width)',
    /** Color of the border and of the separators. */
    'border-color': 'var(--panneau-color-border)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow. */
    shadow: 'var(--panneau-shadow-sm)',
    /** Vertical padding of the header and the footer. */
    'header-padding-y': 'var(--panneau-space-3)',
    /** Horizontal padding of every section. */
    'padding-x': 'var(--panneau-space-4)',
    /** Font size of the title. */
    'title-font-size': 'var(--panneau-font-size-lg)',
    /** Font weight of the title. */
    'title-font-weight': 'var(--panneau-font-weight-bold)',
    /** Vertical padding of the body. */
    'padding-y': 'var(--panneau-space-4)',
    /** Space between the children of the body. */
    gap: 'var(--panneau-space-4)',
});
