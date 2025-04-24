---
title: Kneeling curve
---

This is useful for showing datasets ranging over a long time span. Here we're showing 800k years of CO2 concentration but with +/- 2000 years around year zero shown using a linear scale.

```svelte live
<script>
    import { Plot, Line } from '$lib';
    import { page } from '$app/state';
    import { Slider, RadioInput } from '$lib/ui';

    let type = $state('symlog');
    let constant = $state(2000);
    let { kneeling } = $derived(page.data.data);
</script>

<div style="display:flex;justify-content: space-between">
    <Slider
        label="constant"
        bind:value={constant}
        min={100}
        max={2000} />
    <RadioInput
        label="type"
        options={['symlog', 'linear']}
        bind:value={type} />
</div>
<Plot grid height={300} x={{ type, constant }}>
    <Line data={kneeling} x="year" y="co2" />
</Plot>
```

```svelte
<Plot
    grid
    height={300}
    x={{ type: 'symlog', constant: 2000 }}>
    <Line data={kneeling} x="year" y="co2" />
</Plot>
```
