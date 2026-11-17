import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of LineChart. */
export const lineChartTokens = defineComponentTokens('line-chart', {
    /** Height of the plot, without the labels around it. */
    height: '8rem',
    /** Width of the line. */
    'line-width': '2px',
    /** Diameter of the dots: the last value, the highest one, the point under the pointer. */
    'dot-size': '8px',
    /** Opacity of the area under the line, at its top: it fades out to the baseline. */
    'area-opacity': '0.2',
    /** Color of the lines of the graduations across the plot. */
    'grid-color': 'var(--panneau-color-border)',
    /** Font size of the labels: the scale, the dates, the values. */
    'label-font-size': 'var(--panneau-font-size-xs)',
    /** Duration of the line drawing itself when the chart appears: 0 with reduced motion. */
    'reveal-duration': 'calc(var(--panneau-duration-slow) * 3)',
});
