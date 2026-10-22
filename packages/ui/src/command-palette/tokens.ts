import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of CommandPalette. */
export const commandPaletteTokens = defineComponentTokens('command-palette', {
    /** Maximum width. */
    width: '40rem',
    /** Space above the palette, which opens near the top of the screen. */
    'offset-top': '12dvh',
    /** Maximum height of the list of results. */
    'list-max-height': '60dvh',
    /** Background. */
    bg: 'var(--panneau-color-surface-raised)',
    /** Corner radius. */
    radius: 'var(--panneau-radius-lg)',
    /** Corner radius of the items. */
    'item-radius': 'var(--panneau-radius-md)',
    /** Background of the item chosen with the keyboard or the pointer. */
    'item-active-bg': 'var(--panneau-color-hover)',
});
