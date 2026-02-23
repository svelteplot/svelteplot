<script module>
    export const title = 'Facet padding';
    export const description =
        'You can adjust the padding between facets using the `padding` or `paddingInner` options on the `fx` and `fy` options.';
    export const sortKey = 99;
</script>

<script lang="ts">
    import { Plot } from 'svelteplot';
</script>

<Plot
    height={400}
    fx={{
        domain: ['Panel A', 'Panel B', 'Panel C'],
        axis: 'bottom',
        padding: 0.2
    } as any}
    x={{ domain: [0, 1] }}
    y={{ domain: [0, 1] }}
    grid
    frame />

<style>
    :global(.facet-axis-x text) {
        font-size: 12px;
        font-weight: bold;
    }
</style>
