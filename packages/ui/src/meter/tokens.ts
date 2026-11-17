import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Meter. */
export const meterTokens = defineComponentTokens('meter', {
    /** Height of the bar. */
    height: '0.375rem',
    /** Corners of the bar and its fill. */
    radius: 'var(--panneau-radius-full)',
    /** The track, under the fill. */
    'track-bg': 'var(--panneau-color-surface-sunken)',
});
