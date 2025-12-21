<script module>
    export const title = 'Facet padding';
    export const description =
        'You can add minor ticks lines by adding a second axis and disabling the text labels.';
    export const data = { aapl: '/data/aapl.csv' };
    export const repl =
        'https://svelte.dev/playground/2e803e9ce10f42a9a3a854c958329a70?version=latest';
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
