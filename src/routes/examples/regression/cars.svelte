<script module>
    export const title = 'Regression scatterplot';
</script>

<script lang="ts">
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';
    import { Select, Slider } from '$lib/ui';

    let { cars } = $derived(page.data.data);

    let type = $state('linear');
    let order = $state(3);
    let span = $state(0.7);
    let confidence = $state(0.99);
    const types = ['linear', 'quad', 'exp', 'log', 'pow'];
</script>

<Select label="Type" bind:value={type} options={types} />

{#if type.startsWith('loess')}
    <Slider
        label="span"
        bind:value={span}
        min={0.1}
        max={2}
        step={0.01} />{/if}
<Select
    label="confidence:"
    bind:value={confidence}
    format={(d) => `${d * 100}%`}
    options={[0.8, 0.9, 0.95, 0.99, 0.999, 0.9999]} />

<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        symbol="plus"
        opacity={0.6} />
    <RegressionY
        data={cars}
        {type}
        {order}
        {span}
        {confidence}
        stroke="var(--svp-red)"
        x="power (hp)"
        y="weight (lb)" />
</Plot>
