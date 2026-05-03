<script lang="ts">
    import { Hexbin, Hexgrid, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        hexbinArgs?: Partial<ComponentProps<typeof Hexbin>>;
        hexgridArgs?: ComponentProps<typeof Hexgrid>;
        showGrid?: boolean;
        data?: any[];
    }

    let { plotArgs, hexbinArgs, hexgridArgs, showGrid = false, data = [] }: Props = $props();
</script>

<Plot width={400} height={400} {...plotArgs}>
    <Hexbin {data} x="x" y="y" {...hexbinArgs} />
    {#if showGrid}<Hexgrid {...hexgridArgs} />{/if}
</Plot>
