import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of the label, description and errors around inputs. */
export const fieldTokens = defineComponentTokens('field', {
    /** Space between the label, the input, the description and the errors. */
    gap: 'var(--panneau-space-1)',
    /** Font size of the label. */
    'label-font-size': 'var(--panneau-font-size-md)',
    /** Font weight of the label. */
    'label-font-weight': 'var(--panneau-font-weight-medium)',
});
