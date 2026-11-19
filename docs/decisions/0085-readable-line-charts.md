# 0085: Line charts that read without a pointer

- Status: accepted
- Date: 2026-11-17
- Changes: the line of the `series` widget of [0064](0064-dashboard-widgets.md)

## Context

`LineChart` drew straight segments between the points, a dot on each of them, the highest value alone as its scale, at the top left of the plot, and the first and last dates. Under the total of a `series` widget, that lone value read as part of the total. Nothing gave a value between those, except a native `title` on each dot.

Charts of other admin tools add a tooltip under the pointer by default. It hides what the chart should show: a value needs a hover, a pointer that crosses a dashboard sets off bubbles over the marks, and a phone has no hover. What a chart needs to be read depends on its data: a scale for a count over two weeks, a fixed scale for a ratio, only the trend beside a number, the value of a day in a series of 90.

## Decision

**The values are on the chart.** By default, `LineChart` draws:

- a scale of round graduations (2 to 4 steps of 1, 2 or 5 times a power of 10), with a hairline across the plot for each one. From 0, or the lowest value under it, to the first round value above the highest. Numbers in full under 10,000, compact on a scale that reaches it;
- dates under the plot: the first, the last, and up to 5 others at regular steps, every other one hidden when the chart is narrower than 28rem (a container query);
- the last value written at the end of the line, with a dot. Above its point, or under it when the line comes down to it.

Options, for the data:

- `axisLabel`: what the values are, above the scale (`Entries`, `Minutes`);
- `showMax`: the highest value marked on the line, unless it is the last one or next to it;
- `showLast={false}`: no value on the line;
- `showAxis={false}`: no scale, a line at 0 alone, for a trend beside a number;
- `domain`: fixed bounds, `{ min: 0, max: 1 }` for a ratio;
- `formatTick`: the graduations, short (`25%`, `1 min`), apart from `formatValue`.

**A curve that doesn't lie.** The line is a monotone cubic curve (as d3's `curveMonotoneX`, `curve="monotone"` by default): smooth, but never above or below its points between two of them, so a count doesn't dip under 0 or peak between two days. The "natural" curve of some chart libraries does both. `curve="linear"` keeps straight segments. The area under the line fades from the color of the series to nothing at the baseline (`area-opacity`, 0.2 at the top).

**Hover is an option.** `isInteractive` shows the value of the point under the pointer: a vertical line, its dot, and its value and full label in a bubble. The arrow keys, `Home` and `End` move through the points from the keyboard: the plot is then a `slider` named by `label`, whose `aria-valuetext` is the point (`October 5, 2026: 4`). Off by default. The `series` widget turns it on past 31 points, where a day can't be read from the scale. Every value stays in the table of the chart, for assistive technologies, whether the chart is interactive or not.

**Labels.** `LineChartPoint` has a `shortLabel` for under the plot (`Oct 5`), and its `label` is the full one, in the table and the bubble (`October 5, 2026`). The `series` widget gives both.

**Motion.** The line draws itself from the left when the chart appears (`reveal-duration`, 3 times `--panneau-duration-slow`), then its dots and values fade in. Not when the data changes, and not with reduced motion.

**Tokens.** `dot-size` grows to 8px, with a ring of the surface around the dots, `area-opacity` to 0.2. New: `grid-color` and `reveal-duration`.

## Consequences

- A `series` widget reads without a pointer: its scale, its dates and its last value are on it.
- A chart that should show its peak, a ratio or a trend alone says so with its props, chart by chart.
- What isn't done yet: the change against the previous period, a trend in a `stat`, a choice of period in the card, and several series with a legend. They need the protocol and `laravel-panneau`.
