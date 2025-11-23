<script module>
    export const title = 'Flow plot';

    export const description = `Based on an example from <a href="https://observablehq.com/@observablehq/plot-wind-map">Observable Plot</a> that is based on a <a href="https://github.com/gicentre/litvis/blob/main/examples/windVectors.md">LitVis example</a>.`;
    export const data = { wind: '/data/wind.csv' };
</script>

<script lang="ts">
    import { Plot, Vector } from 'svelteplot';
    import type { WindRow } from '../types';

    let { wind }: { wind: WindRow[] } = $props();
</script>

<Plot
    inset={10}
    aspectRatio={1}
    color={{
        label: 'Speed (m/s)',
        zero: true,
        legend: true
    }}>
    <Vector
        data={wind}
        x="longitude"
        y="latitude"
        rotate={({ u, v }) =>
            (Math.atan2(u, v) * 180) / Math.PI}
        length={({ u, v }) => Math.hypot(u, v)}
        stroke={({ u, v }) => Math.hypot(u, v)} />
</Plot>
