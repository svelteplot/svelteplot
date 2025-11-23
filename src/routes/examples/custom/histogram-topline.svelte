<script module lang="ts">
    export const title = 'Histogram with a topline';
    export const repl =
        'https://svelte.dev/playground/42919d4eb5d84d1ca3a0d6c7028eea0d?version=latest';
    export const transforms = ['bin'];
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    let { olympians } = $props();
    import {
        Plot,
        RectY,
        binX,
        CustomMark
    } from 'svelteplot';
</script>

<Plot y={{ zero: true }}>
    {@const binned = binX(
        { data: olympians, x: 'weight' },
        { y: 'count', interval: 3 }
    )}
    <RectY {...binned} opacity={0.2} />
    <CustomMark {...binned}>
        {#snippet marks({ records })}
            <path
                d="M{records[0].x1},{records[0].y} {records
                    .map((r) => `V${r.y}H${r.x2}`)
                    .join(' ')}" />
        {/snippet}
    </CustomMark>
</Plot>

<style>
    path {
        stroke: currentcolor;
        fill: none;
    }
</style>
