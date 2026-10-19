/** The number of categorical chart colors: series beyond it reuse them in order. */
export const CHART_CATEGORICAL_COUNT = 8;

/** The number of steps of the sequential chart ramp. */
export const CHART_SEQUENTIAL_COUNT = 5;

/**
 * The colors of charts, as CSS variables for `fill` and `stroke`: they follow the theme, the color
 * scheme and the scope of the chart. Dashboard charts use only these.
 *
 * - `categorical(index)`: the color of a series, in a fixed order (`index` from 0), repeating after
 *   8. Each one reaches 3:1 against the surface and stays distinct with color vision deficiencies.
 * - `sequential(step)`: a step from 1 (low) to 5 (high) of a ramp, for quantities.
 * - `diverging`: two colors around a neutral midpoint, for values above and below a reference.
 */
export const chartColors = Object.freeze({
    categorical: (index: number): string =>
        `var(--panneau-chart-categorical-${(((Math.floor(index) % CHART_CATEGORICAL_COUNT) + CHART_CATEGORICAL_COUNT) % CHART_CATEGORICAL_COUNT) + 1})`,
    sequential: (step: 1 | 2 | 3 | 4 | 5): string => `var(--panneau-chart-sequential-${step})`,
    diverging: Object.freeze({
        negative: 'var(--panneau-chart-diverging-negative)',
        neutral: 'var(--panneau-chart-diverging-neutral)',
        positive: 'var(--panneau-chart-diverging-positive)',
    }),
});
