import { defineComponentTokens } from '../theme/componentTokens';

/**
 * Tokens of Heading, like Bootstrap's `$headings-*` and `$display-font-sizes`. `Prose` applies
 * them to the headings of rich content too.
 */
export const headingTokens = defineComponentTokens('heading', {
    /** Font family of sizes 1 to 4. */
    'font-family': 'var(--panneau-font-family-heading)',
    /** Font family of the display sizes. */
    'display-font-family': 'var(--panneau-font-family-display)',
    /** Text color. */
    color: 'inherit',
    /** Font size of the level 1. */
    '1-font-size': '1.75rem',
    /** Font weight of the level 1. */
    '1-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the level 1. */
    '1-line-height': 'var(--panneau-line-height-tight)',
    /** Letter spacing of the level 1. */
    '1-letter-spacing': '-0.015em',
    /** Font size of the level 2. */
    '2-font-size': '1.375rem',
    /** Font weight of the level 2. */
    '2-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the level 2. */
    '2-line-height': 'var(--panneau-line-height-tight)',
    /** Letter spacing of the level 2. */
    '2-letter-spacing': '-0.01em',
    /** Font size of the level 3. */
    '3-font-size': '1.125rem',
    /** Font weight of the level 3. */
    '3-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the level 3. */
    '3-line-height': 'var(--panneau-line-height-tight)',
    /** Letter spacing of the level 3. */
    '3-letter-spacing': 'normal',
    /** Font size of the level 4 (and 5, 6). */
    '4-font-size': 'var(--panneau-font-size-lg)',
    /** Font weight of the level 4 (and 5, 6). */
    '4-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the level 4 (and 5, 6). */
    '4-line-height': 'var(--panneau-line-height-tight)',
    /** Letter spacing of the level 4 (and 5, 6). */
    '4-letter-spacing': 'normal',
    /** Font size of the display size 1. */
    'display-1-font-size': '3rem',
    /** Font weight of the display size 1. */
    'display-1-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the display size 1. */
    'display-1-line-height': '1.1',
    /** Letter spacing of the display size 1. */
    'display-1-letter-spacing': '-0.025em',
    /** Font size of the display size 2. */
    'display-2-font-size': '2.25rem',
    /** Font weight of the display size 2. */
    'display-2-font-weight': 'var(--panneau-font-weight-bold)',
    /** Line height of the display size 2. */
    'display-2-line-height': '1.15',
    /** Letter spacing of the display size 2. */
    'display-2-letter-spacing': '-0.02em',
});
