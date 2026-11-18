import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of Sparkline. */
export const sparklineTokens = defineComponentTokens('sparkline', {
    /** Height of the line. */
    height: '2rem',
    /** Width of the line. */
    'line-width': '1.5px',
    /** Opacity of the area under the line. */
    'area-opacity': '0.12',
    /** Diameter of the dot on the last value. */
    'dot-size': '6px',
});
