import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Popover. */
export const popoverTokens = defineComponentTokens('popover', {
    /** Background. */
    bg: 'var(--panneau-color-surface-raised)',
    /** Border color. */
    'border-color': 'var(--panneau-color-border)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-lg)',
    /** Shadow. */
    shadow: 'var(--panneau-shadow-lg)',
    /** Padding of the content. */
    padding: 'var(--panneau-space-3)',
});
