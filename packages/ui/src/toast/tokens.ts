import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Toast. */
export const toastTokens = defineComponentTokens('toast', {
    /** Width of the toasts. */
    width: '24rem',
    /** Background. */
    bg: 'var(--panneau-color-surface-raised)',
    /** Border color. */
    'border-color': 'var(--panneau-color-border)',
    /** Width of the colored edge of a toast with a tone. */
    'tone-width': '4px',
    /** Corner radius. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow. */
    shadow: 'var(--panneau-shadow-lg)',
});
