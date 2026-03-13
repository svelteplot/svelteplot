<script module>
    export const title = 'Geo raster';
    export const description =
        'An interpolated raster of maximum temperatures from weather stations across Canada, clipped to the land outline and labeled by province.';
    export const data = {
        weather: '/data/us-weather.csv',
        canadaTopo: '/data/canada.json'
    };
    export const sortKey = 50;
</script>

<script lang="ts">
    import { Plot, Raster, Geo, Text } from 'svelteplot';
    import * as topojson from 'topojson-client';

    const { weather, canadaTopo } = $props();

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
    const provinces = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.provinces
        ).features
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
    height={500}
    color={{
        scheme: 'burd',
        type: 'quantile',
        legend: true
    }}>
    <defs>
        <clipPath id="usa">
            <Geo data={[land]} />
        </clipPath>
    </defs>
    <Raster
        data={weather.filter((d) => d.Tx != null)}
        x="Long"
        clipPath="url(#usa)"
        y="Lat"
        interpolate="random-walk"
        blur={2}
        fill="Tx" />

    <Geo data={[land]} stroke="currentColor" fill={null} />
    <Geo
        data={[innerBorders]}
        stroke="white"
        opacity={0.5} />
    <Text
        data={provinces}
        text={(d) => d.properties.postal}
        fill="white"
        stroke="black"
        strokeWidth={2}
        strokeOpacity={0.25}
        x={(d) => d.properties.cx}
        y={(d) => d.properties.cy} />
</Plot>
