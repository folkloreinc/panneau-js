import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of PillTrigger. */
export const pillTriggerTokens = defineComponentTokens('pill-trigger', {
    /** Background. */
    bg: 'var(--panneau-color-surface-sunken)',
    /** Background of a hovered, pressed or open trigger. */
    'bg-hover':
        'color-mix(in srgb, var(--panneau-color-text) 8%, var(--panneau-color-surface-sunken))',
    /** Color of the value. */
    color: 'var(--panneau-color-text)',
    /** Color of the border: none by default. */
    'border-color': 'transparent',
    /** Corner radius. */
    radius: 'var(--panneau-radius-full)',
    /** Space between the media, the value and the chevron. */
    gap: 'var(--panneau-space-2)',
    /** Horizontal padding. */
    'padding-x': 'var(--panneau-space-3)',
    /** Horizontal padding of the small size. */
    'padding-x-sm': 'var(--panneau-space-2)',
    /** Font size of the value. */
    'font-size': 'var(--panneau-font-size-md)',
    /** Font size of the value, small size. */
    'font-size-sm': 'var(--panneau-font-size-sm)',
    /** Font weight of the value. */
    'font-weight': 'var(--panneau-font-weight-medium)',
    /** Size of the leading media. */
    'media-size': '1.5rem',
    /** Size of the leading media, small size. */
    'media-size-sm': '1.25rem',
    /** Corner radius of the leading media: its content is clipped to it. */
    'media-radius': 'var(--panneau-radius-full)',
});
