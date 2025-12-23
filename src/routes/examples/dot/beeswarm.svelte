<script module>
    export const title = 'Beeswarm plot';
    export const sortKey = 30;
    export const transforms = ['dodge'];
    export const data = { cars: '/data/cars.csv' };
    export const repl =
        'https://svelte.dev/playground/15701199b28c41b59e2036ad1f1d79c9?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    let { cars } = $props();
</script>

<Plot height={200}>
    <Dot
        data={cars}
        x="weight (lb)"
        y={0}
        fill
        dodgeY="bottom" />
</Plot>
