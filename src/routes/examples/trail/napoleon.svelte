<script module lang="ts">
    export const title = 'Napoleons March';
    export const description = `A trail plot showing Napoleon's march on and retreat from Moscow in 1812 (based on <a href="https://en.wikipedia.org/wiki/Charles_Joseph_Minard#The_map_of_Napoleon's_Russian_campaign">Charles Minard's famous chart</a>), overlaid on a map of todays country borders. `;
    export const data = {
        countries10m: '/data/countries-10m.json',
        minard: '/data/minard_troops.csv'
    };
    export const sortKey = 55;
</script>

<script lang="ts">
    import { Plot, Geo, Trail, Text } from 'svelteplot';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';
    import { extent } from 'd3-array';
    import Graticule from 'svelteplot/marks/Graticule.svelte';
    import Frame from 'svelteplot/marks/Frame.svelte';
    import RadioInput from 'svelteplot/ui/RadioInput.svelte';

    const { countries10m, minard } =
        $props() as ExamplesData;

    const borders = $derived(
        topojson.mesh(
            countries10m,
            countries10m.objects.countries,
            (a, b) => a !== b
        )
    );
    const countries = $derived(
        topojson.feature(
            countries10m,
            countries10m.objects.countries
        )
    );
    const LON = extent(minard, (d) => d.long);
    const LAT = extent(minard, (d) => d.lat);

    const countryLabels = [
        {
            name: 'Russia',
            lon: 33.4,
            lat: 56
        },
        {
            name: 'Belarus',
            lon: 27.9534,
            lat: 53.7098
        },
        {
            name: 'Estonia',
            lon: 25.0136,
            lat: 58.5953
        },
        {
            name: 'Latvia',
            lon: 25.2,
            lat: 56.8796
        },
        {
            name: 'Lithuania',
            lon: 24.5,
            lat: 55.7
        }
    ];

    const domain = {
        coordinates: [
            [
                [LON[0], LAT[1]],
                [LON[0], LAT[0]],
                [LON[1], LAT[0]],
                [LON[1], LAT[1]],
                [LON[0], LAT[1]]
            ].reverse()
        ],
        type: 'Polygon'
    };
</script>

<Plot
    r={{
        range: [0, 24],
        // note that Minard's original chart
        // used a linear scale for troop sizes
        type: 'linear'
    }}
    projection={{
        type: 'conic-equal-area',
        inset: 20,
        domain // computed from troop coordinates
    }}>
    <Graticule
        opacity={0.1}
        step={1}
        strokeDasharray="2,2" />
    <!-- define countries to show -->
    {@const show = new Set([
        'Russia',
        'Poland',
        'Belarus',
        'Estonia',
        'Latvia',
        'Lithuania'
    ])}
    <!-- "inner glow" of countries created using masked fills -->
    <Geo
        data={countries.features.filter((d) =>
            show.has(d.properties.name)
        )}
        fill={(d) => d.properties.name}
        opacity={0.2}
        mask="url(#clip)" />
    <!-- the mask is created using a frame and blurred country borders -->
    <defs>
        <mask id="clip">
            <Frame fill="black" stroke="none" />
            <Geo
                data={[borders]}
                stroke="white"
                strokeWidth={12}
                strokeLinejoin="round"
                opacity={1}
                svgFilter="url(#blur)" />
        </mask>
        <filter id="blur">
            <feGaussianBlur stdDeviation="1" />
        </filter>
    </defs>
    <!-- country labels -->
    <Text
        class="country-label"
        data={countryLabels}
        x="lon"
        y="lat"
        text="name"
        fontSize={16}
        dy={-4}
        rotate={(d) => -10 + (d.lon - 23.8) * -0.5}
        fill="currentColor"
        lineAnchor="middle"
        textAnchor="middle" />
    <!-- country borders -->
    <Geo
        data={[borders]}
        stroke="currentColor"
        opacity={0.4} />
    <!-- troop sizes -->
    <Trail
        data={minard}
        x="long"
        y="lat"
        cap="butt"
        r="survivors"
        z={(d) => `${d.group}-${d.direction}`}
        fill={(d) =>
            d.direction === 'A'
                ? 'currentColor'
                : 'var(--svp-red)'} />
</Plot>

<style>
    :global {
        .country-label {
            letter-spacing: 1px;
            text-transform: uppercase;
            opacity: 0.25;
        }
    }
</style>
