<script module>
    export const title = 'Weather station map';
    export const description =
        'A projected dot map of Canadian weather stations, colored by recorded maximum temperature.';
    export const data = {
        weather: '/data/us-weather.csv',
        canadaTopo: '/data/canada.json'
    };
    export const sortKey = 60;
</script>

<script lang="ts">
    import { Plot, Dot, Geo } from 'svelteplot';
    import * as topojson from 'topojson-client';

    type WeatherRow = {
        Lat: number;
        Long: number;
        Tx: number | null;
    };

    type WeatherDatum = WeatherRow & {
        Tx: number;
    };

    type CanadaAtlas = TopoJSON.Topology & {
        objects: {
            land: TopoJSON.GeometryCollection;
        };
    };

    type ExampleProps = {
        weather: WeatherRow[];
        canadaTopo: CanadaAtlas;
    };

    const { weather, canadaTopo } =
        $props() as ExampleProps;

    const weatherData = $derived(
        weather.filter(
            (d): d is WeatherDatum => d.Tx != null
        )
    );
    const land = $derived(
        topojson.feature(
            canadaTopo,
            canadaTopo.objects.land
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
    height={500}
    color={{
        scheme: 'burd',
        type: 'quantile',
        legend: true
    }}>
    <Dot data={weatherData} x="Long" y="Lat" fill="Tx" />
    <Geo data={[land]} stroke="currentColor" fill={null} />
</Plot>
