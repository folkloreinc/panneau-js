import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Stat. */
export const statTokens = defineComponentTokens('stat', {
    /** Space between the label, the number and the help. */
    gap: 'var(--panneau-space-1)',
    /** Font size of the label. */
    'label-font-size': 'var(--panneau-font-size-sm)',
    /** Font family of the number. */
    'value-font-family': 'var(--panneau-font-family-heading)',
    /** Font size of the number. */
    'value-font-size': '2rem',
    /** Font weight of the number. */
    'value-font-weight': 'var(--panneau-font-weight-bold)',
    /** Font size of the help under the number. */
    'help-font-size': 'var(--panneau-font-size-sm)',
});
