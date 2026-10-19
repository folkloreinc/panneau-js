import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of the input box of text inputs, text areas, selects, combo boxes, number inputs, date pickers and time inputs. */
export const inputTokens = defineComponentTokens('input', {
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-control-padding-x)',
    /** Background. */
    bg: 'var(--panneau-color-surface)',
    /** Width of the border. */
    'border-width': 'var(--panneau-border-width)',
    /** Border color. */
    'border-color': 'var(--panneau-color-border-control)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-md)',
    /** Border color of a hovered input. */
    'border-color-hover': 'var(--panneau-color-text-muted)',
});
