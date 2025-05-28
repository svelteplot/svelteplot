<!-- @component
    Renders a geographic graticule grid with customizable step sizes
-->
<script module lang="ts">
    import type { DefaultOptions, BaseMarkProps } from '../types.js';
    export type GraticuleMarkProps = Omit<
        BaseMarkProps,
        'fill' | 'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target' | 'cursor'
    > & {
        step?: number;
        stepX?: number;
        stepY?: number;
    };
</script>

<script lang="ts">
    import Geo from './Geo.svelte';
    import { geoGraticule } from 'd3-geo';
    import { getContext } from 'svelte';

    const DEFAULTS = {
        graticuleStep: 10,
        ...getContext<Partial<DefaultOptions>>('svelteplot/defaults')
    };

    let { step = DEFAULTS.graticuleStep, stepX, stepY, ...options }: GraticuleMarkProps = $props();

    let graticule = $derived.by(() => {
        const graticule = geoGraticule();
        graticule.stepMinor([stepX || step, stepY || step]);
        return graticule;
    });
</script>

<Geo data={[graticule()]} {...options} geoType="graticule" preferStroke />
