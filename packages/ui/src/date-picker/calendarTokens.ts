import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of the calendar of `DatePicker`. */
export const calendarTokens = defineComponentTokens('calendar', {
    /** Size of a day. */
    'cell-size': '2.25rem',
    /** Corner radius of a day. */
    'cell-radius': 'var(--panneau-radius-md)',
    /** Text color of the selected day. */
    'selected-color': 'var(--panneau-color-accent-text)',
    /** Background of the selected day. */
    'selected-bg': 'var(--panneau-color-accent)',
});
