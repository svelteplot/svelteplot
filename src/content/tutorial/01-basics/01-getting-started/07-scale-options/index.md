---
title: Scale options
---

A **scale** translates data values into visual positions, sizes, and colors. You can tune each scale via options on `<Plot>`.

Add a grid and a descriptive label to the y axis:

```svelte
---<Plot color={{ legend: true, scheme }}>---
+++<Plot color={{ legend: true, scheme }} y={{ grid: true, label: 'Body mass (g)' }}>+++
```

Now label the x axis too:

```svelte
<Plot
  color={{ legend: true, scheme }}
  y={{ grid: true, label: 'Body mass (g)' }}
  +++x={{ label: 'Bill length (mm)' }}>+++
```

Scale options live directly on `<Plot>` — no separate axis components needed unless you want fine-grained control. Other useful options include `domain` (to fix the visible range), `type` (e.g. `'log'`), and `percent` (to format ticks as percentages).
