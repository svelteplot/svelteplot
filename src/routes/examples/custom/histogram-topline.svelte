<script module lang="ts">
    export const title = 'Histogram with a topline';
</script>

<script lang="ts">
    import { page } from '$app/state';
    let { olympians } = $derived(page.data.data);
    import {
        Plot,
        RectY,
        binX,
        CustomMark,
        stackY
    } from 'svelteplot';
</script>

<Plot height={300} y={{ zero: true }}>
    {@const binned = binX(
        { data: olympians, x: 'weight' },
        { y: 'count', interval: 3 }
    )}
    <RectY {...binned} opacity={0.2} />
    <CustomMark {...stackY(binned)}>
        {#snippet marks({ records })}
            <path
                d="M{records[0].x1},{records[0].y1} {records
                    .map((r) => `V${r.y2}H${r.x2}`)
                    .join(' ')}"
                stroke="currentColor"
                fill="none" />
        {/snippet}
    </CustomMark>
</Plot>
