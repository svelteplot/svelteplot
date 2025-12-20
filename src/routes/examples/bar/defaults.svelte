<script module>
    export const title = 'Bar defaults';
    export const fullCode = true;
    export const sortKey = 99;
    export const repl =
        'https://svelte.dev/playground/3798ba1144c54f0788e709a1a6f05b6b?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        BarX,
        setPlotDefaults
    } from 'svelteplot';

    setPlotDefaults({
        bar: {
            borderRadius: 4,
            stroke: 'currentColor',
            fill: null
        }
    });
</script>

<Plot y={['A', 'B', 'C', 'D', 'E', 'F']}>
    <BarX data={[1, 2, 3, 4, 5, 6]} fill={(d) => d} />
</Plot>
