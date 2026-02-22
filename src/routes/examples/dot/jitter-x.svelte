<script module>
    export const title = 'Jitter X';
    export const sortKey = 40;
    export const transforms = ['jitter'];
    export const data = { cars: '/data/cars.csv' };
    export const description = `This example demonstrates how to apply <a href="/transforms/jitter">jittering</a> along the x-axis.`;
</script>

<script lang="ts">
    import { Plot, Dot, jitterX } from 'svelteplot';
    import { randomLcg } from 'd3-random';
    let { cars } = $props();
</script>

<Plot
    inset={14}
    x={{ padding: 0.5, label: 'Cylinders' }}
    y={{ grid: true }}>
    <Dot
        {...jitterX(
            {
                data: cars,
                x: 'cylinders',
                y: 'power (hp)'
            },
            {
                type: 'uniform',
                width: 0.45,
                // optional: provide a seeded random number generator for reproducibility
                source: randomLcg(42)
            }
        )}
        r={2.6}
        fill="#2563eb" />
</Plot>
