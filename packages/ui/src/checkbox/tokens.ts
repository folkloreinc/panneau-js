import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Checkbox. */
export const checkboxTokens = defineComponentTokens('checkbox', {
    /** Size of the box. */
    size: '1.125rem',
    /** Color of the check mark. */
    'checked-color': 'var(--panneau-color-accent-text)',
    /** Background of the box. */
    bg: 'var(--panneau-color-surface)',
    /** Border color of the box. */
    'border-color': 'var(--panneau-color-border-control)',
    /** Corner radius of the box. */
    radius: 'var(--panneau-radius-sm)',
    /** Background and border color of a checked box. */
    'checked-bg': 'var(--panneau-color-accent)',
});
