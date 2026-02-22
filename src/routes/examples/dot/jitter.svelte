<script module>
    export const title = 'Jitter both axes';
    export const sortKey = 42;
    export const transforms = ['jitter'];
    export const data = { cars: '/data/cars.csv' };
    export const description = `This example demonstrates how to apply <a href="/transforms/jitter">jittering</a> along multiple axes.`;
</script>

<script lang="ts">
    import { Plot, Dot, jitter } from 'svelteplot';
    import { randomLcg } from 'd3-random';
    let { cars }: { cars: CarsRow[] } = $props();
    import type { CarsRow } from '../types';

    const source = randomLcg(42);
</script>

<Plot
    inset={14}
    x={{ label: 'Year' }}
    y={{ grid: true, label: '0-60 mph (s)' }}>
    <Dot
        {...jitter(
            {
                data: cars,
                x: 'year',
                y: '0-60 mph (s)'
            },
            {
                x: { type: 'uniform', width: 0.35, source },
                y: { type: 'normal', std: 0.2, source }
            }
        )} />
</Plot>
