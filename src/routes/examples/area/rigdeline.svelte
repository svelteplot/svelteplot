<script module>
    export const title = 'Ridgeline plot';
    export const data = {
        lincoln_temperature: '/data/lincoln_weather.csv'
    };
    export const description =
        'Ridgeline-style density areas of the daily mean temperatures in Lincoln, NE, with one facet per month. Adapted from <a href="https://austinwehrwein.com/data-visualization/it-brings-me-ggjoy/">It brings me ggjoy</a>.';
    export const transforms = ['density'];
    export const sortKey = 112;
</script>

<script lang="ts">
    import {
        Plot,
        AreaY,
        RuleY,
        densityX
    } from 'svelteplot';
    import { useDark } from 'svelteplot/ui/isDark.svelte';

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    type LincolnTemperatureRow = {
        Month: string;
        ['Mean Temperature [F]']: number;
    };

    const ds = useDark();
    let {
        lincoln_temperature
    }: { lincoln_temperature: LincolnTemperatureRow[] } =
        $props();
</script>

<Plot
    height={600}
    marginLeft={0}
    marginTop={25}
    marginBottom={30}
    inset={6}
    color={{ legend: false }}
    fy={{ domain: months, label: 'Month', axis: 'left' }}
    x={{ label: 'Mean temperature (F)' }}
    y={{
        percent: true,
        label: 'Density',
        axis: false,
        domain: [0, 0.04]
    }}>
    <RuleY y={0} />
    <AreaY
        {...densityX(
            {
                data: lincoln_temperature,
                x: 'Mean Temperature [F]',
                fy: 'Month',
                fill: 'Month'
            },
            { bandwidth: 4 }
        )}
        fillOpacity={0.65}
        stroke="Month"
        strokeWidth={1}
        curve="basis"
        blend={ds.isDark ? 'screen' : 'multiply'} />
</Plot>
