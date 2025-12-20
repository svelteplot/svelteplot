<script module>
    export const title = 'Linked Bars';
    export const description =
        'A bar chart with linked bars, showing the relationship between two datasets.';
    export const repl =
        'https://svelte.dev/playground/dd45ca2754ad41499139706342e5f4d4?version=latest';
</script>

<script>
    import { Plot, BarX } from 'svelteplot';

    const data = [
        { url: '/marks/line', label: 'Line', value: 5 },
        { url: '/marks/bar', label: 'Bar', value: 3 },
        { url: '/marks/dot', label: 'Dot', value: 4 },
        { url: '/marks/rect', label: 'Rect', value: 2 }
    ];
</script>

<Plot>
    <BarX
        {data}
        x="value"
        y="label"
        data-sveltekit-noscroll
        href="url" />
</Plot>
