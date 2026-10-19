import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Alert. */
export const alertTokens = defineComponentTokens('alert', {
    /** Space between the icon, the content and the dismiss button. */
    gap: 'var(--panneau-space-3)',
    /** Vertical padding. */
    'padding-y': 'var(--panneau-space-3)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-4)',
    /** Width of the border. */
    'border-width': 'var(--panneau-border-width)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-md)',
    /** Font weight of the title. */
    'title-font-weight': 'var(--panneau-font-weight-bold)',
});
