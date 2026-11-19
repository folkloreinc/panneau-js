import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of ButtonGroup. */
export const buttonGroupTokens = defineComponentTokens('button-group', {
    /** The line between two solid buttons, so that they don't merge. */
    'separator-color': 'color-mix(in srgb, currentcolor 30%, transparent)',
});
