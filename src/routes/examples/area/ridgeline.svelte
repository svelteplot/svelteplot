<script module>
    export const title = 'Ridgeline plot';
    export const data = {
        lincoln_temperature: '/data/lincoln_weather.csv'
    };
    export const description =
        'Ridgeline-style density areas of the daily mean temperatures in Lincoln, NE, with one facet per month. Adapted from <a href="https://austinwehrwein.com/data-visualization/it-brings-me-ggjoy/">this example by Austin Wehrwein</a>.';
    export const transforms = ['density'];
    export const sortKey = 112;
    export const repl =
        'https://svelte.dev/playground/6a9f4ce281064c2c95ca56ce0e214a83?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        Line,
        RuleY,
        Text,
        densityX,
        LinearGradientX
    } from 'svelteplot';
    import { useDark } from '$shared/ui/isDark.svelte';

    type LincolnTemperatureRow = {
        Month: string;
        ['Mean Temperature [F]']: number;
    };

    const ds = useDark();
    let {
        lincoln_temperature
    }: { lincoln_temperature: LincolnTemperatureRow[] } =
        $props();

    const months = $derived([
        ...new Set(lincoln_temperature.map((d) => d.Month))
    ]);

    const colorStops = $derived([
        {
            x: -23,
            color: ds.isDark ? '#0493cf' : '#0493cf'
        },
        {
            x: -16,
            color: ds.isDark ? '#206d9d' : '#52a7db'
        },
        {
            x: -8,
            color: ds.isDark ? '#304a5d' : '#a2cbe1'
        },
        {
            x: 0,
            color: ds.isDark ? '#292b14' : '#ffffe0'
        },
        {
            x: 10,
            color: ds.isDark ? '#5c3f12' : '#ffc173'
        },
        {
            x: 20,
            color: ds.isDark ? '#994d0b' : '#ff7f26'
        },
        {
            x: 30,
            color: ds.isDark ? '#f72d00' : '#f50000'
        }
    ]);
</script>

<Plot
    height={600}
    marginTop={30}
    color={{ legend: false }}
    fy={{
        axis: false,
        domain: months
    }}
    x={{ label: 'Mean temperature (C)' }}
    y={{
        percent: true,
        label: 'Density',
        axis: false,
        domain: [0, 0.06]
    }}>
    <defs>
        <LinearGradientX id="temp" stops={colorStops} />
    </defs>
    <RuleY y={0} opacity={0.5} />
    <!-- compute density -->
    {@const densityData = densityX(
        {
            data: lincoln_temperature,
            x: (d) =>
                (d['Mean Temperature [F]'] - 32) / 1.8,
            fy: 'Month'
            // fill: 'Month'
        },
        { bandwidth: 4 }
    )}}
    <!-- rigde areas -->
    <AreaY
        {...densityData}
        fill="url(#temp)"
        fillOpacity={0.75}
        curve="basis"
        sort={densityData.x}
        blend={ds.isDark ? 'screen' : 'multiply'} />
    <!-- top line -->
    <Line {...densityData} curve="basis" />
    <!-- month labels -->
    <Text
        data={months.map((d) => ({ Month: d }))}
        fy="Month"
        text="Month"
        fontSize={14}
        frameAnchor="left" />
</Plot>
