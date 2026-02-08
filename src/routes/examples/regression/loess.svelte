<script module>
    export const title = 'Loess regression';
    export const data = { cars: '/data/cars.csv' };
</script>

<script lang="ts">
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { Slider } from '$shared/ui';

    let { cars } = $props();

    let span = $state(0.7);
</script>

<Slider
    label="span"
    bind:value={span}
    min={0.1}
    max={1}
    step={0.01} />

<Plot grid>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        symbol="plus"
        opacity={0.6} />
    <RegressionY
        data={cars}
        type="loess"
        {span}
        stroke="var(--svp-red)"
        x="power (hp)"
        y="weight (lb)" />
</Plot>
