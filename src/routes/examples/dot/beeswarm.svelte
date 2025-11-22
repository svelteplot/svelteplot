<script module>
    export const title = 'Beeswarm plot';
    export const sortKey = 30;
    export const transforms = ['dodge'];
    export const data = { cars: '/data/cars.csv' };
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
