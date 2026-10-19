import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Tooltip. */
export const tooltipTokens = defineComponentTokens('tooltip', {
    /** Vertical padding. */
    'padding-y': 'var(--panneau-space-1)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-2)',
    /** Font size. */
    'font-size': 'var(--panneau-font-size-sm)',
    /** Text color. */
    color: 'var(--panneau-color-bg)',
    /** Background. */
    bg: 'var(--panneau-color-text)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-sm)',
});
