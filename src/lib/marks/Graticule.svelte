<!-- @component
    Renders a geographic graticule grid with customizable step sizes
-->

<script lang="ts">
    interface GraticuleMarkProps extends Omit<
        BaseMarkProps<GeoJSON.GeoJsonObject>,
        'fill' | 'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target' | 'cursor'
    > {
        step?: number;
        stepX?: number;
        stepY?: number;
    }
    import Geo from './Geo.svelte';
    import { geoGraticule } from 'd3-geo';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import type { BaseMarkProps } from '../types/index.js';

    let markProps: GraticuleMarkProps = $props();

    const DEFAULTS = {
        step: 10,
        ...getPlotDefaults().graticule
    };

    const { class: className = '', ...options }: GraticuleMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const graticule = $derived.by(() => {
        const graticule = geoGraticule();
        graticule.stepMinor([
            options.stepX ?? options.step ?? DEFAULTS.step,
            options.stepY ?? options.step ?? DEFAULTS.step
        ]);
        return graticule;
    });
</script>

<Geo data={[graticule()]} {...options} geoType="graticule" />
