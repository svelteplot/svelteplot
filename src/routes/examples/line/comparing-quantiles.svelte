<script module>
    export const title = 'Quantile comparison';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const description =
        'You can use the <a href="/transforms/map">map transform</a> to compare different distributions against their quantiles.';
    export const transforms = ['map'];
    export const sortKey = 80;
</script>

<script lang="ts">
    import { Plot, Line, mapX } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
</script>

<Plot
    grid
    y={{ type: 'log' }}
    x={{ label: 'Quantiles ->', percent: true }}>
    <Line
        {...mapX(
            {
                data: olympians.filter((d) =>
                    [
                        'triathlon',
                        'aquatics',
                        'gymnastics',
                        'basketball'
                    ].includes(d.sport)
                ),
                sort: 'weight',
                x: 'weight',
                y: 'weight',
                stroke: 'sport'
            },
            'quantile'
        )}
        text="sport"
        strokeWidth={2} />
</Plot>
