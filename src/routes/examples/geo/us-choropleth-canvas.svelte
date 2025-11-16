<script module>
    export const title = 'US choropleth map (canvas)';
    export const description =
        'See also the <a href="/examples/geo/us-choropleth">SVG version</a>';
    export const sortKey = 2;
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
        canvas
        data={counties}
        fill={(d) => d.properties.unemployment} />
</Plot>
