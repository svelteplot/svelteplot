<script module lang="ts">
    export const title = 'Simple rectangles';
    export const repl =
        'https://svelte.dev/playground/7a6b0ae12c624ffeb52448adac644b5b?version=5.33.18';
</script>

<script lang="ts">
    import { Plot, Rect, Text } from 'svelteplot';

    const data = [
        {
            x1: 10,
            x2: 15,
            y1: 5,
            y2: 9
        },
        {
            x1: 7,
            x2: 12,
            y1: 7,
            y2: 13
        }
    ];
</script>

<Plot grid inset={10}>
    <Rect
        {data}
        x1="x1"
        x2="x2"
        y1="y1"
        y2="y2"
        stroke="currentColor"
        fill="currentColor"
        fillOpacity={0.5} />
</Plot>
