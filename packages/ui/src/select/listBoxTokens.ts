import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of the options of `Select`, `ComboBox` and `Menu`. */
export const listBoxTokens = defineComponentTokens('list-box', {
    /** Padding around the options. */
    padding: 'var(--panneau-space-1)',
    /** Vertical padding of an option. */
    'item-padding-y': 'var(--panneau-space-1)',
    /** Horizontal padding of an option. */
    'item-padding-x': 'var(--panneau-space-2)',
    /** Corner radius of an option. */
    'item-radius': 'var(--panneau-radius-sm)',
    /** Background of a focused or hovered option. */
    'item-bg-hover': 'var(--panneau-color-hover)',
});
