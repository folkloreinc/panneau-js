import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Switch. */
export const switchTokens = defineComponentTokens('switch', {
    /** Width of the track. */
    width: '2.25rem',
    /** Height of the track. */
    height: '1.25rem',
    /** Background of the track when off. */
    'track-bg': 'var(--panneau-color-border-control)',
    /** Border color of the track when off, drawn inside it: a theme can draw an empty track. */
    'track-border-color': 'transparent',
    /** Corner radius of the track and the thumb. */
    radius: 'var(--panneau-radius-full)',
    /** Size of the thumb. */
    'thumb-size': '1rem',
    /** Background of the thumb when off. */
    'thumb-bg': 'var(--panneau-color-surface)',
    /** Background of the track when on. */
    'checked-bg': 'var(--panneau-selected-bg, var(--panneau-color-accent))',
    /** Background of the thumb when on. */
    'checked-thumb-bg': 'var(--panneau-selected-text, var(--panneau-color-accent-text))',
});
