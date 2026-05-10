---
title: Adding a legend
---

The dots are colored by species, but without a legend we can't tell which is which. Add one by passing a `color` option to `<Plot>`:

```svelte
---<Plot>---
+++<Plot color={{ legend: true }}>+++
  <Dot {data} x="bill_length_mm" y="body_mass_g" fill="species" />
</Plot>
```

SveltePlot reads the `fill` channel, builds the color scale, and renders a legend automatically.

You can also pin specific species to specific colors using a `scheme` object. Any value not listed gets an automatic color:

```svelte
<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';

+++  const scheme = {
+++    Gentoo: '#4c78a8'
+++  };
</script>

---<Plot color={{ legend: true }}>---
+++<Plot color={{ legend: true, scheme }}>+++
```
