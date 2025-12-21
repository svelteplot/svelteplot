<script module>
    export const title = 'Facet padding';
    export const description =
        'You can adjust the padding between facets using the `padding` or `paddingInner` options on the `fx` and `fy` options.';
    export const repl =
        'https://svelte.dev/playground/5e77eedbf0c047b68bfbff5cfefced6b';
    export const sortKey = 99;
</script>

<script>
    import { Plot } from 'svelteplot';
</script>

<Plot
    height={400}
    fx={{ domain: ['A', 'B', 'C'], padding: 0.2 }}
    x={{ domain: [0, 1] }}
    y={{ domain: [0, 1] }}
    grid
    frame />
