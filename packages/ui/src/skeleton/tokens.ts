import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Skeleton. */
export const skeletonTokens = defineComponentTokens('skeleton', {
    /** Color of the blocks: a tint of the text, so they show on every surface. */
    color: 'color-mix(in srgb, var(--panneau-color-text) 9%, transparent)',
    /** Corner radius of lines and rectangles. */
    radius: 'var(--panneau-radius-sm)',
    /** Duration of one pulse. */
    duration: '1.6s',
});
