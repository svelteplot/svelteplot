<script module>
    export let title = 'Simple waffle';
    export let sortKey = 1;
</script>

<script>
    import {
        Plot,
        WaffleY,
        WaffleX,
        RuleY
    } from 'svelteplot';
    import { Slider } from 'svelteplot/ui';
    import { page } from '$app/state';
    import RuleX from 'svelteplot/marks/RuleX.svelte';
    let { alphabet } = $derived(page.data.data);

    const data = [
        { fruit: 'Apples', quantity: 212 },
        { fruit: 'Bananas', quantity: 207 },
        { fruit: 'Cherries', quantity: 315 },
        { fruit: 'Dates', quantity: 11 }
    ];

    let gap = $state(1);
    let unit = $state(1);
</script>

<Slider
    label="Gap"
    min={0}
    max={10}
    step={1}
    bind:value={gap} />

<Slider
    label="Unit"
    min={1}
    max={10}
    step={1}
    bind:value={unit} />

<Plot grid>
    <RuleY data={[0]} />
    <WaffleY
        multiple={10}
        {gap}
        {unit}
        {data}
        x="fruit"
        y="quantity" />
</Plot>

<Plot grid height={400}>
    <RuleX data={[0]} />
    <WaffleX {gap} {unit} {data} y="fruit" x="quantity" />
</Plot>
