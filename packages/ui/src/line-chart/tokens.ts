import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of LineChart. */
export const lineChartTokens = defineComponentTokens('line-chart', {
    /** Height of the plot, without the labels under it. */
    height: '8rem',
    /** Width of the line. */
    'line-width': '2px',
    /** Diameter of the dots of the points. */
    'dot-size': '6px',
    /** Opacity of the area under the line. */
    'area-opacity': '0.12',
    /** Font size of the labels. */
    'label-font-size': 'var(--panneau-font-size-xs)',
});
