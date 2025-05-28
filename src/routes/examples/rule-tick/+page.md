---
title: Examples of Rule and Tick marks
---

This page shows many examples of the use of the `Rule` and `Tick` marks translated from the [Observable Plot Plot Gallery](https://observablehq.com/@observablehq/plot-gallery).
It only includes examples using the standard demo datasets from the [@observablehq/sample-datasets](www.npmjs.com/package/@observablehq/sample-datasets) package;
it excludes those with `FileAttachment`s added to Observable Notebooks.


## [Candlestick chart](https://observablehq.com/@observablehq/plot-candlestick-chart)

```svelte live
<script>
    import { Plot, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
    const ticker = aapl.slice(-130);
</script>

<Plot inset={6} width={928} grid=true y={{  label: "↑ Apple stock price ($)"}} color={{  domain: [-1, 0, 1],  range: ["#e41a1c", "currentColor", "#4daf4a"]}} >
  <RuleX data={ticker} x="Date" y1="Low" y2="High" />
  <RuleX data={ticker} x="Date" y1="Open" y2="Close" stroke={d => Math.sign(d.Close - d.Open)} strokeWidth={4} strokeLinecap="round" />
</Plot>
```


## [Lollipop](https://observablehq.com/@observablehq/plot-lollipop)

> :warning: This seems to be interpreting "letter" as a literal value, rather than the name of a field.

```svelte live
<script>
    import { Plot, Dot, RuleX } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot x={{  label: null,  tickPadding: 6,  tickSize: 0}} y={{  percent: true}} >
  <RuleX data={alphabet} x="letter" y="frequency" strokeWidth={2} />
  <Dot data={alphabet} x="letter" y="frequency" fill="currentColor" r={4} />
</Plot>
```


## [Bar and tick](https://observablehq.com/@observablehq/plot-bar-and-tick)

> :warning: This fails with error "scale type mismatch for x (needs band)".

```svelte live
<script>
    import { Plot, BarY, TickY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { alphabet } = $derived(page.data.data);
</script>

<Plot x={{  label: null}} y={{  percent: true}} >
  <BarY data={alphabet} x="letter" y="frequency" fillOpacity={0.2} />
  <TickY data={alphabet} x="letter" y="frequency" />
  <RuleY data={[0]} />
</Plot>
```