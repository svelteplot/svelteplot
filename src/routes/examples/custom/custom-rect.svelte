<script module lang="ts">
    export const title = 'Simple rectangles';
</script>

<script lang="ts">
    import { Plot, CustomMark, Text } from 'svelteplot';

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
    <CustomMark {data} x1="x1" x2="x2" y1="y1" y2="y2">
        {#snippet mark({ record })}
            <rect
                x={Math.min(record.x1, record.x2)}
                y={Math.min(record.y1, record.y2)}
                width={Math.abs(record.x2 - record.x1)}
                height={Math.abs(record.y2 - record.y1)}
                stroke="currentColor"
                fill="currentColor"
                fill-opacity="0.5" />
        {/snippet}
    </CustomMark>
</Plot>
