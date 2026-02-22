<script module lang="ts">
    export const title = 'Histogram with a topline';
    export const transforms = ['bin'];
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import {
        Plot,
        RectY,
        binX,
        CustomMark
    } from 'svelteplot';
    let { olympians } = $props();
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
