---
'@panneau/ui': minor
'@panneau/intl': minor
'@panneau/app': patch
---

`LineChart` reads without a pointer: a monotone curve with an area that fades out, a scale of round graduations with lines across the plot, dates at regular steps under it, and the last value at the end of the line. New props: `axisLabel`, `showMax`, `showLast`, `showAxis`, `domain`, `formatTick`, `curve`, and `isInteractive`, which shows the value of the point under the pointer or chosen with the arrow keys. A point can have a `shortLabel` for under the plot. The line draws itself when the chart appears. New tokens `grid-color` and `reveal-duration`; `dot-size` is now 8px and `area-opacity` 0.2. The `series` widget gives full dates to the table and short ones to the axis, and is interactive past 31 points.
