<script module>
    export const title = 'Quantile plot';
    export const data = {
        olympians: '/data/olympians.csv'
    };
    export const description =
        'You can use the <a href="/transforms/map">map transform</a> to compare different distributions against their quantiles. This is sometimes referred to as <a href="https://www.sciencedirect.com/topics/mathematics/quantile-plot">quantile plot</a>.';
    export const transforms = ['map'];
    export const sortKey = 80;
    export const repl =
        'https://svelte.dev/playground/8221090246714f59a7752e8ac8285978?version=latest';
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
