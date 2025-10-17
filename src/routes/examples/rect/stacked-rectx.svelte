<script module>
    export const title = 'Stacked RectX';
    export const repl =
        'https://svelte.dev/playground/4db4c6caea4f4329a30c1f18c46ea7d9?version=5.33.18';
    export const transforms = ['stack'];
</script>

<script lang="ts">
    import { Plot, RectX } from 'svelteplot';

    const data = [
        { width: 2.5, height: 1, category: 'A' },
        { width: 3, height: 4, category: 'B' },
        { width: 4, height: 3, category: 'C' }
    ];
</script>

<Plot color={{ legend: true }}>
    <RectX
        {data}
        y1={0}
        y2="height"
        x="width"
        fill="category"
        insetRight={1} />
</Plot>
