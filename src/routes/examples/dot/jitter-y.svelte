<script module>
    export const title = 'Jitter along y-axis';
    export const sortKey = 41;
    export const transforms = ['jitter'];
    export const data = { cars: '/data/cars.csv' };
    export const description = `This example demonstrates how to apply <a href="/transforms/jitter">jittering</a> along the y-axis.`;
</script>

<script lang="ts">
    import { Plot, Dot, jitterY } from 'svelteplot';
    import { randomLcg } from 'd3-random';
    let { cars } = $props();
</script>

<Plot
    inset={14}
    x={{ grid: true, label: 'Weight (lb)' }}
    y={{ ticks: [4, 6, 8] }}>
    <Dot
        {...jitterY(
            {
                data: cars,
                x: 'weight (lb)',
                y: 'cylinders'
            },
            {
                type: 'normal',
                std: 0.25,
                // optional: provide a seeded random number generator for reproducibility
                source: randomLcg(42)
            }
        )} />
</Plot>
