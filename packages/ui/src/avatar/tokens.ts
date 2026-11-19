import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Avatar and AvatarGroup. */
export const avatarTokens = defineComponentTokens('avatar', {
    /** Size of `xs`. */
    'size-xs': '1.25rem',
    /** Size of `sm`, the size of the shell. */
    'size-sm': '1.75rem',
    /** Size of `md`, the default. */
    'size-md': '2.25rem',
    /** Size of `lg`. */
    'size-lg': '3rem',
    /** Size of `xl`. */
    'size-xl': '4rem',
    /** Corner radius: a circle by default. */
    radius: 'var(--panneau-radius-full)',
    /** Font weight of the initials. */
    'font-weight': 'var(--panneau-font-weight-bold)',
    /** How much of the name's color is mixed with the surface, behind the initials. */
    tint: '30%',
    /** Width of the ring of a tone. */
    'ring-width': '2px',
    /** Gap between the avatar and its ring. */
    'ring-gap': '2px',
    /** Color of the gap around the avatar: under its ring, and between avatars of a group. */
    'gap-color': 'var(--panneau-color-surface)',
    /** How much avatars of a group overlap, as a share of their size. */
    'group-overlap': '0.25',
});
