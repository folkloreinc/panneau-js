import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of RadioGroup: its radios, the media of its options, and its cards. */
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
    /** Size of the leading media of an option. */
    'media-size': '2rem',
    /** Corner radius of the leading media of an option: its content is clipped to it. */
    'media-radius': 'var(--panneau-radius-full)',
    /** Space between the cards, with `appearance="cards"`. */
    'card-gap': 'var(--panneau-space-2)',
    /** Padding of a card. */
    'card-padding': 'var(--panneau-space-3)',
    /** Background of a card. */
    'card-bg': 'var(--panneau-color-surface)',
    /** Border color of a card. */
    'card-border-color': 'var(--panneau-color-border)',
    /** Border color of a hovered card. */
    'card-border-color-hover': 'var(--panneau-color-border-control)',
    /** Border color of the selected card, which is twice as wide. */
    'card-border-color-selected': 'var(--panneau-color-accent)',
    /** Corner radius of a card. */
    'card-radius': 'var(--panneau-radius-md)',
    /** Font weight of the label of a card. */
    'card-label-font-weight': 'var(--panneau-font-weight-medium)',
});
