<script module>
    export const title = 'Bar defaults';
    export const fullCode = true;
    export const sortKey = 99;
</script>

<script lang="ts">
    import { Plot, BarX } from 'svelteplot';
    import { setContext } from 'svelte';

    setContext('svelteplot/defaults', {
        bar: {
            borderRadius: 4,
            stroke: 'currentColor',
            fill: null
        }
    });
</script>

<Plot>
    <BarX data={[1, 2, 3, 4, 5, 6]} fill={(d) => d} />
</Plot>
