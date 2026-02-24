<script module>
    export const title = 'Stacked RectY';
    export const transforms = ['stack'];
</script>

<script lang="ts">
    import { Plot, RectY } from 'svelteplot';

    const data = [
        { width: 2.5, height: 1, category: 'A' },
        { width: 3, height: 4, category: 'B' },
        { width: 4, height: 3, category: 'C' }
    ];
</script>

<Plot color={{ legend: true }}>
    <RectY
        {data}
        x1={0}
        x2="width"
        {...{ y: 'height' } as any}
        fill="category"
        insetBottom={1} />
</Plot>
