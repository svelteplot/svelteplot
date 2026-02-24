<script module>
    export const title = 'Symlog kneeling curve';
    export const description =
        'Useful for long time spans: this chart shows ~800k years of CO2 concentration while preserving detail around year zero using a symmetric log scale.';
    export const data = { kneeling: '/data/kneeling.csv' };
</script>

<script lang="ts">
    import { Plot, Line } from 'svelteplot';
    import { Slider, RadioInput } from '$shared/ui';
    import type { KneelingRow } from '../types';

    let { kneeling }: { kneeling: KneelingRow[] } =
        $props();

    let type = $state('symlog');
    let constant = $state(2000);
</script>

<div class="controls">
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

<Plot grid height={300} x={{ type: type as any, constant }}>
    <Line data={kneeling} x="year" y="co2" />
</Plot>

<style>
    .controls {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }
</style>
