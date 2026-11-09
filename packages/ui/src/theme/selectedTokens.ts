import { defineComponentTokens } from './componentTokens';

/**
 * Tokens of what is selected, checked or current: checked boxes, radios and switches, the selected
 * day of a calendar, the current tab, the value of a slider, selected rows, cards and media.
 *
 * They default to the accent, which a theme can keep for its main action only, as Bootstrap does
 * with `$component-active-bg` next to `$primary`: a yellow main action, and black selections.
 * Like other component tokens they are read with their default as a fallback and never declared,
 * so a scope that changes the accent changes the selections in it, unless a theme sets them.
 */
export const selectedTokens = defineComponentTokens('selected', {
    /** Fill of what is selected or checked, and the border of a selected card or row. */
    bg: 'var(--panneau-color-accent)',
    /** Text and icons on that fill: the check mark, the selected day. */
    text: 'var(--panneau-color-accent-text)',
    /** Background of a selected row, card, or range of days. */
    subtle: 'var(--panneau-color-accent-subtle)',
});
