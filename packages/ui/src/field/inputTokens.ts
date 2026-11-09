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
    /** Border color of a focused input. */
    'border-color-focus': 'var(--panneau-color-focus)',
    /** Ring around a focused input, as a `box-shadow`: thicker, softer, or `none`. */
    'focus-ring': '0 0 0 1px var(--panneau-color-focus)',
    /** Ring around a focused input that has errors, as a `box-shadow`. */
    'focus-ring-invalid': '0 0 0 1px var(--panneau-color-danger)',
});
