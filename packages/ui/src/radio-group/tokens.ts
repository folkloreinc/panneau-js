import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of RadioGroup. */
export const radioTokens = defineComponentTokens('radio', {
    /** Size of the circle. */
    size: '1.125rem',
    /** Background of the circle. */
    bg: 'var(--panneau-color-surface)',
    /** Border color of the circle. */
    'border-color': 'var(--panneau-color-border-control)',
    /** Color of a selected circle. */
    'checked-color': 'var(--panneau-color-accent)',
    /** Border width of a selected circle, which draws the dot. */
    'checked-border-width': '0.3125rem',
});
