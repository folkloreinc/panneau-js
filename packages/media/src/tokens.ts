import { defineComponentTokens } from '@panneau/ui';

/**
 * Tokens of the media picker and the library: the smallest width of the cards of the grid, which
 * follows the density through the control height.
 */
export const mediaPickerTokens = defineComponentTokens('media-picker', {
    /** Smallest width of a card. */
    'card-size': 'calc(var(--panneau-control-height) * 5 - 1.75rem)',
    /** Smallest width of a card on a phone, two or three a row. */
    'card-size-sm': 'calc(var(--panneau-control-height) * 2.5)',
});

/**
 * Tokens of the image editor: the stage behind the image, a dark checkerboard that stays dark in
 * both schemes, as in photo editors, so that the image reads the same.
 */
export const imageEditorTokens = defineComponentTokens('image-editor', {
    /** Background of the stage. */
    stage: '#17181c',
    /** The other squares of the checkerboard. */
    'stage-pattern': '#1d1f24',
});

/** The component tokens of `@panneau/media` and their defaults, by component (decision 0024). */
export const mediaComponentTokens = Object.freeze({
    'media-picker': mediaPickerTokens.tokens,
    'image-editor': imageEditorTokens.tokens,
});
