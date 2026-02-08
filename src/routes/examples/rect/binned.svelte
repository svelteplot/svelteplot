<script module>
    export const title = 'Binned Rectangles';
    export const description =
        'A simple example of a binned rectangle plot showing the distribution of Olympian weights. Based on an example from <a href="https://observablehq.com/@observablehq/plot-olympians-heatmap">Observable Plot</a>.';
    export const sortKey = 20;
    export const transforms = ['bin'];
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, Rect, bin } from 'svelteplot';
    import type { OlympiansRow } from '../types';
    import { useDark } from 'svelteplot/shared/ui/isDark.svelte';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();

    const ds = useDark();
</script>

<Plot
    opacity={{
        range: [ds.isDark ? 0 : 0.4, 1],
        type: 'sqrt'
    }}
    color={{ scheme: ds.isDark ? 'magma' : 'rdpu' }}>
    <Rect
        {...bin(
            { data: olympians, x: 'weight', y: 'height' },
            { fill: 'count', opacity: 'count' }
        )}
        inset={0} />
</Plot>
