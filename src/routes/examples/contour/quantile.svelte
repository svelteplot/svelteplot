<script module>
    export const title = 'Quantile contour thresholds';
    export const description =
        'Contour bands of Canadian maximum temperature with quantile-spaced thresholds, so each band covers an equal share of the data distribution. The threshold color scale is synced to the same breakpoints.';
    export const data = {
        weather: '/data/us-weather.csv',
        canadaTopo: '/data/canada.json'
    };
    export const sortKey = 50;
</script>

<script lang="ts">
    import { Plot, Contour, Geo } from 'svelteplot';
    import { quantileSorted } from 'd3-array';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $props();

    const weatherData = $derived(weather.filter((d: any) => d.Tx != null));
    const land = $derived(topojson.feature(canadaTopo, canadaTopo.objects.land));
    const innerBorders = $derived(
        topojson.feature(canadaTopo, canadaTopo.objects.innerborders)
    );

    const n = 9;
    const thresholds = $derived.by(() => {
        const sorted = weatherData
            .map((d: any) => d.Tx as number)
            .sort((a: number, b: number) => a - b);
        const quantiles = Array.from({ length: n }, (_, i) =>
            quantileSorted(sorted, (i + 1) / (n + 1)) as number
        );
        return [sorted[0] - 1e-6, ...quantiles] as number[];
    });
    const colorDomain = $derived(thresholds.slice(1));
</script>

<Plot
    projection={{
        type: 'conic-conformal',
        domain: land,
        rotate: [96, 0],
        center: [0, 56],
        parallels: [49, 77]
    }}
    color={{ scheme: 'burd', type: 'threshold', domain: colorDomain, legend: true }}>
    <defs>
        <clipPath id="canada-land-quantile">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Contour
        data={weatherData}
        x="Long"
        y="Lat"
        value="Tx"
        fill="value"
        stroke="none"
        interpolate="random-walk"
        blur={2}
        clipPath="url(#canada-land-quantile)"
        {thresholds} />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo data={[innerBorders]} stroke="currentColor" strokeOpacity={0.3} fill={null} />
</Plot>
