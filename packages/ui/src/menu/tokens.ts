import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Menu: its sections, its footer, and the media and selection of its items. */
export const menuTokens = defineComponentTokens('menu', {
    /** Font size of the header of a section. */
    'header-font-size': 'var(--panneau-font-size-xs)',
    /** Font weight of the header of a section. */
    'header-font-weight': 'var(--panneau-font-weight-medium)',
    /** Color of the header of a section. */
    'header-color': 'var(--panneau-color-text-muted)',
    /** Case of the header of a section: `uppercase` makes it an eyebrow, `none` keeps its text. */
    'header-text-transform': 'uppercase',
    /** Letter spacing of the header of a section. */
    'header-letter-spacing': '0.04em',
    /** Font size of the footer note. */
    'footer-font-size': 'var(--panneau-font-size-xs)',
    /** Color of the footer note. */
    'footer-color': 'var(--panneau-color-text-muted)',
    /** Size of the leading media of an item. */
    'media-size': '1.5rem',
    /** Size of the leading media of an item with a description, on two lines. */
    'media-size-described': '2rem',
    /** Corner radius of the leading media of an item: its content is clipped to it. */
    'media-radius': 'var(--panneau-radius-full)',
    /** Background of a selected item. */
    'item-bg-selected': 'var(--panneau-color-surface-sunken)',
});
