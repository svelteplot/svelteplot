---
title: Reactivity
---

Because SveltePlot is built for Svelte, any reactive variable flows directly into a chart — no special wiring needed.

Declare a `$state` variable for the selected island and use it to filter the data:

```svelte
<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';

  const scheme = { Gentoo: '#4c78a8' };
  +++let island = $state('all');+++
</script>
```

Add a `<select>` bound to `island`, and filter before passing data to `<Dot>`:

```svelte
+++<label>
  Island:
  <select bind:value={island}>
    <option value="all">All islands</option>
    <option>Biscoe</option>
    <option>Dream</option>
    <option>Torgersen</option>
  </select>
</label>+++

<Plot color={{ legend: true, scheme }} y={{ grid: true, label: 'Body mass (g)' }} x={{ label: 'Bill length (mm)' }}>
  <Dot
    +++data={island === 'all' ? data : data.filter(d => d.island === island)}+++
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
</Plot>
```

Switch islands — the chart updates instantly. No event handlers, no watchers, no `on:change`. Svelte's reactivity just works.
