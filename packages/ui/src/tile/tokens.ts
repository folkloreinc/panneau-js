import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Tile and TileGroup. */
export const tileTokens = defineComponentTokens('tile', {
    /** Space between the media, the text and the actions. */
    gap: 'var(--panneau-space-3)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-3)',
    /** Vertical padding of `md`. */
    'padding-y': 'var(--panneau-space-3)',
    /** Vertical padding of `sm`. */
    'padding-y-sm': 'var(--panneau-space-2)',
    /** Corner radius of a tile, and of an outlined group. */
    radius: 'var(--panneau-radius-lg)',
    /** Color of the border of `outline`, and of the lines of a group. */
    'border-color': 'var(--panneau-color-border)',
    /** Background of `subtle`. */
    'subtle-bg': 'var(--panneau-color-surface-sunken)',
    /** Background of a tile with a link, on hover. */
    'hover-bg': 'var(--panneau-color-hover)',
    /** Size of the media of `md`. */
    'media-size': '2.5rem',
    /** Size of the media of `sm`. */
    'media-size-sm': '2rem',
    /** Background of the square around an icon. */
    'icon-bg': 'var(--panneau-color-surface-sunken)',
    /** Color of an icon. */
    'icon-color': 'var(--panneau-color-text-muted)',
    /** Corner radius of the square around an icon. */
    'icon-radius': 'var(--panneau-radius-md)',
    /** Font weight of the title. */
    'title-font-weight': 'var(--panneau-font-weight-medium)',
    /** Color of the description. */
    'description-color': 'var(--panneau-color-text-muted)',
});
