---
title: Examples of customizing Axes
---

This page shows many examples of using Axes translated from the [Observable Plot Plot Gallery](https://observablehq.com/@observablehq/plot-gallery).
It only includes examples using the standard demo datasets from the [@observablehq/sample-datasets](https://www.npmjs.com/package/@observablehq/sample-datasets) package.


## [ggplot2-style axes](https://observablehq.com/@observablehq/plot-ggplot2-style-axes)

```svelte live
<script>
    import { Plot, Frame, Line, GridX, GridY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot inset={10} >
  <Frame fill="#eaeaea" />
  <GridY stroke={"white"} strokeOpacity={1} />
  <GridX stroke="white" strokeOpacity={1} />
  <Line data={aapl} x="Date" y="Close" stroke="black" />
</Plot>
```


## [Datawrapper-style date axis](https://observablehq.com/@observablehq/plot-datawrapper-style-date-axis)

```svelte live
<script>
    import { Plot, AxisX, Line, GridX, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot  >
  <RuleY data={[0]} />
  <AxisX ticks="3 months" />
  <GridX  />
  <Line data={aapl} x="Date" y="Close" />
</Plot>

```

## [New York Times-style axes](https://observablehq.com/@observablehq/plot-nyt-style-axes)

```svelte live
<script>
    import { Plot, AxisX, AxisY, Line, GridY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot round=true marginLeft={0} x={{  label: null,  insetLeft: 36}} >
  <GridY strokeDasharray="0.75,2" strokeOpacity={1} />
  <AxisY 
    tickSize={0}
    dx={38}
    dy={-6}
    lineAnchor="bottom"
  />
  <RuleY data={[0]} />
  <Line data={aapl} x="Date" y="Close" markerEnd="dot" />
</Plot>


```


## [Data based axis](https://observablehq.com/@observablehq/plot-data-based-axis)

> :warning: This isn't rendering correctly - the `x` channel isn't affecting the positioned where the y-axis lines end (and labels are positioned).
> See [Issue #76](https://github.com/svelteplot/svelteplot/issues/76)

```svelte live
<script>
    import { Plot, AxisX, AxisY, Line, GridY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot marginRight={0} >
  <RuleY data={[0]} />
  <Line data={aapl} x="Date" y="Close" />
  <GridY 
    x={y => aapl.find(d => d.Close >= y)?.Date}
    insetLeft={-6}
  />
  <AxisY 
    x={y => aapl.find(d => d.Close >= y)?.Date}
    insetLeft={-6}
    textStroke="var(--vp-c-bg)"
   />
</Plot>

```


## [Major and minor axis ticks](https://observablehq.com/@observablehq/plot-major-and-minor-axis-ticks)

```svelte live
<script>
    import { Plot, AxisX, AxisY, Line, GridY, RuleY } from 'svelteplot';
    import { page } from '$app/state';

    let { aapl } = $derived(page.data.data);
</script>

<Plot marginRight={0} >
  <Line data={aapl} x="Date" y="Close" />
  
  <AxisX ticks="month" text={null} tickSize={3} />
  <AxisX />
  
  <AxisY ticks={50} tickSize={3} text={null} />
  <AxisY />
</Plot>
```
