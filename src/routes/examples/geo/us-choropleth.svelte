<script module>
    export const title = 'US choropleth map';
    export const description =
        'See also the <a href="/examples/geo/us-choropleth-canvas">Canvas version</a>';
    export const sortKey = 1;
    export const data = {
        us: '/data/us-counties-10m.json',
        unemployment: '/data/unemployment.csv'
    };
</script>

<script lang="ts">
    import { Plot } from 'svelteplot';
    import Geo from 'svelteplot/marks/Geo.svelte';
    import * as topojson from 'topojson-client';

    const { us, unemployment } = $props();

    const rateMap = $derived(
        new Map(
            unemployment.map((d: any) => [d.id, +d.rate])
        )
    );
    const counties = $derived(
        (topojson as any)
            .feature(us, us.objects.counties)
            .features.map((feat: any) => {
                return {
                    ...feat,
                    properties: {
                        ...(feat as any).properties,
                        unemployment: rateMap.get(+feat.id)
                    }
                };
            })
    );
</script>

<Plot
    projection="albers-usa"
    color={{
        scheme: 'blues',
        label: 'Unemployment (%)',
        legend: true,
        n: 5,
        type: 'quantile'
    }}>
    <Geo
        data={counties}
        fill={(d) => (d as any).properties.unemployment}
        title={(d) =>
            `${(d as any).properties.name}\n${(d as any).properties.unemployment}%`} />
</Plot>
