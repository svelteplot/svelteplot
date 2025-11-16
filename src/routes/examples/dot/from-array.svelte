<script module>
    export const title = 'Dots from coordinates array';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import { range } from 'd3-array';
</script>

<Plot grid>
    <Dot
        data={range(-10, 11, 0.5).map((n) => [n, n ** 3])}
        fill />
</Plot>
