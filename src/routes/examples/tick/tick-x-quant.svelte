<script module>
    export const title = 'TickX on quantitative scale';
    export const description =
        'Ticks also work on linear or time scales, in which case the tick length can be specified.';
    export const sortKey = 20;
</script>

<script lang="ts">
    import { range } from 'd3-array';
    import { Plot, TickX } from 'svelteplot';
</script>

<Plot y={{ type: 'linear' }} marginRight={10} grid>
    <TickX
        data={range(1, 100, 1).map((d) => ({
            x: d,
            y: Math.sin(d / 5) * Math.pow(d / 100, 1.5) * 5
        }))}
        y="y"
        x="x"
        tickLength={10}
        strokeWidth={2} />
</Plot>
