<script module>
    export const title = 'Canada temperature contours';
    export const description =
        'Filled contour bands of maximum temperature interpolated from Canadian weather stations using the random-walk method.';
    export const data = {
        weather: '/data/us-weather.csv',
        canadaTopo: '/data/canada.json'
    };
    export const sortKey = 40;
</script>

<script lang="ts">
    import { Plot, Contour, Geo } from 'svelteplot';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $props();

    const weatherData = $derived(
        weather.filter((d: any) => d.Tx != null)
    );
    const land = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.land
        )
    );
    const innerBorders = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.innerborders
        )
    );
</script>

<Plot
    projection={{
        type: 'conic-conformal',
        domain: land,
        rotate: [96, 0],
        center: [0, 56],
        parallels: [49, 77]
    }}
    color={{
        scheme: 'burd',
        type: 'diverging',
        legend: true
    }}>
    <defs>
        <clipPath id="canada-land-weather">
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
        blur={1}
        clipPath="url(#canada-land-weather)" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="currentColor"
        strokeOpacity={0.3}
        fill={null} />
</Plot>
