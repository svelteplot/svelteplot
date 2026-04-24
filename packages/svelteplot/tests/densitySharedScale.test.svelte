<script lang="ts">
    import { CustomMark, Density, Plot } from 'svelteplot';
</script>

<Plot width={200} height={200} axes={false}>
    <Density data={[{ x: 0, y: null }, { x: 1, y: Number.NaN }, { x: 2 }]} x="x" y="y" />

    <CustomMark
        data={[
            { x: 0, y: 10 },
            { x: 1, y: 20 }
        ]}
        x="x"
        y="y">
        {#snippet mark({ record, index })}
            <circle
                class="shared-scale-point"
                data-index={index}
                data-x={record.x}
                data-y={record.y} />
        {/snippet}
    </CustomMark>
</Plot>
