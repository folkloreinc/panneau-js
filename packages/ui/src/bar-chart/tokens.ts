import { defineComponentTokens } from '../theme/componentTokens';

/** Tokens of BarChart. */
export const barChartTokens = defineComponentTokens('bar-chart', {
    /** Height of a bar. */
    'bar-height': '0.5rem',
    /** Corners of a bar. */
    'bar-radius': 'var(--panneau-radius-full)',
    /** Space between the rows. */
    gap: 'var(--panneau-space-3)',
    /** Font size of the labels and the values. */
    'font-size': 'var(--panneau-font-size-sm)',
});
