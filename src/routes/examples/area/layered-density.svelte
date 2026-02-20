<script module>
    export const title = 'Layered density plot';
    export const data = {
        iris: '/data/iris2.csv'
    };
    export const description =
        'Layered density plot of the measurements in the <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, showing density estimates for each measurement type stacked on top of each other.';
    export const transforms = ['density'];
    export const sortKey = 113;
    export const repl =
        'https://svelte.dev/playground/4b6abaf9dc234843bd335ad2e0324eec?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        RuleY,
        AreaY,
        densityX
    } from 'svelteplot';
    import type { Iris2Row } from '../types';
    import { useDark } from '$shared/ui/isDark.svelte';

    const ds = useDark();
    let { iris }: { iris: Iris2Row[] } = $props();
</script>

<Plot
    color={{ legend: true }}
    y={{ label: 'Density', percent: true }}
    grid>
    <AreaY
        y1={0}
        fillOpacity={0.5}
        {...densityX(
            {
                data: iris as any,
                x: 'Value',
                fill: 'Measurement'
            },
            { trim: false, channel: 'y2' }
        ) as any}
        stroke="Measurement"
        curve="basis"
        blend={ds.isDark ? 'screen' : 'multiply'} />
    <RuleY y={0} />
</Plot>
