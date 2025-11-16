<script module>
    export const title = 'Flow plot';
</script>

<script lang="ts">
    import { Plot, Vector } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { wind } = $derived(page.data.data) as ExamplesData;
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
