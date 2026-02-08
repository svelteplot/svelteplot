---
title: Reactive playground
---

Plot scales react to mark data changes

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import Slider from '$lib/shared/ui/Slider.svelte';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);

    let cutoff = $state(0);

    let data = $derived(
        cutoff ? aapl.slice(0, -cutoff) : aapl
    );
</script>

<Slider
    label="cutoff"
    bind:value={cutoff}
    min={0}
    max={aapl.length - 10} />
<Plot grid inset={10}>
    <Line {data} x="Date" y="Close" />
</Plot>
```

Plot reacts to channel changes:

```svelte live
<script>
    import { Plot, Line } from 'svelteplot';
    import Select from '$lib/shared/ui/Select.svelte';

    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
    let y = $state('Close');
</script>

<Select
    label="y"
    bind:value={y}
    options={['Open', 'Close', 'Volume']} />
<Plot grid inset={10}>
    <Line data={aapl} x="Date" {y} />
</Plot>
```

## Reactive scales test

```svelte live
<script lang="ts">
    import Slider from '$lib/shared/ui/Slider.svelte';
    import { Plot, Dot, RuleY } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);

    let filter = $state(false);
    let facet = $state(false);
    let minWeight = $state(8000);

    let justGentoo = $derived(
        penguins.filter((d) => d.species === 'Gentoo')
    );
    let others = $derived(
        penguins.filter((d) => d.species !== 'Gentoo')
    );
</script>

<p>
    Changing a mark filter should not affect the inferred
    scale range:
</p>
<Slider
    label="min weight"
    min={3000}
    max={8000}
    bind:value={minWeight} />

<p>But filtering data should:</p>
<label
    ><input type="checkbox" bind:checked={filter} /> just Gentoo</label
><br />

<label
    ><input type="checkbox" bind:checked={facet} /> facet</label
><br />

{#if penguins.length}
    <Plot grid>
        {#if !filter}
            <Dot
                data={others}
                fill="gray"
                x="culmen_length_mm"
                y="culmen_depth_mm"
                filter={(d) => d.body_mass_g < minWeight} />
        {/if}
        <Dot
            data={justGentoo}
            fill="red"
            fx={facet ? 'sex' : null}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            filter={(d) => d.body_mass_g < minWeight} /> />
    </Plot>
{/if}
```
