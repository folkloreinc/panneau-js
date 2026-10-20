---
'@panneau/ui': minor
---

Chart colors (decision 0024, point 9): tokens for 8 categorical colors, a 5-step sequential ramp and a diverging pair, in both schemes, and `chartColors` to use them as CSS variables. The default categorical colors reach 3:1 against the surface and stay distinct with protanopia, deuteranopia and tritanopia. `checkTheme()` checks the chart colors a theme sets and reports similar categorical colors in `colorDifferences`, and `checkColorDifferences()` checks any palette.
