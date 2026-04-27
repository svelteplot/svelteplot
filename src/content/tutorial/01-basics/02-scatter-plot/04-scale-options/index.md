---
title: Scale options
---

SveltePlot lets you configure each axis via scale options on `<Plot>`. Let's improve the y-axis first — the `value` column holds polling percentages, so we can tell the y scale to format ticks as percentages and add a grid:

```svelte
/// file: App.svelte
---<Plot color={{ legend: true, scheme }}>---
+++<Plot
  color={{ legend: true, scheme }}
	y={{ percent: true, grid: true }}>+++
```

Now let's clean up the x-axis. Setting `interval: 'month'` snaps the x axis ticks to monthly intervals:

```svelte
/// file: App.svelte
<Plot
  color={{ legend: true, scheme }}
  y={{ percent: true, grid: true }}--->---
  +++x={{ interval: 'month' }}>+++
```
