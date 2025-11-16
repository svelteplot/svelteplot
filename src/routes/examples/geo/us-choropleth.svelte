<script module>
    export const title = 'US choropleth map';
    export const description =
        'See also the <a href="/examples/geo/us-choropleth-canvas">Canvas version</a>';
    export const sortKey = 1;
</script>

<script>
    import { Plot } from 'svelteplot';
    import Geo from 'svelteplot/marks/Geo.svelte';
    import * as topojson from 'topojson-client';
    import { page } from '$app/state';

    const { us, unemployment } = $derived(page.data.data);
    const rateMap = $derived(
        new Map(unemployment.map((d) => [d.id, +d.rate]))
    );
    const counties = $derived(
        topojson
            .feature(us, us.objects.counties)
            .features.map((feat) => {
                return {
                    ...feat,
                    properties: {
                        ...feat.properties,
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
        fill={(d) => d.properties.unemployment}
        title={(d) =>
            `${d.properties.name}\n${d.properties.unemployment}%`} />
</Plot>
