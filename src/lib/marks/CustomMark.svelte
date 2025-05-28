<!--
    @component
    For showing custom SVG marks positioned at x/y coordinates
-->
<script module lang="ts">
    import type { ChannelAccessor, DataRow } from '$lib/types.js';
    import type { Snippet } from 'svelte';

    export type HTMLMarkProps = {
        data: DataRow[];
        x?: ChannelAccessor;
        y?: ChannelAccessor;
        children: Snippet<{ datum: DataRow; x: number; y: number }>;
    };
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import type { PlotContext } from '../types.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { projectXY } from '$lib/helpers/scales.js';
    import { isValid } from '$lib/helpers/index.js';
    import GroupMultiple from './helpers/GroupMultiple.svelte';

    let { data = [{}], x, y, children, class: className = null }: HTMLMarkProps = $props();
</script>

<GroupMultiple class="g-custom-mark {className || ''}" length={className ? 2 : data.length}>
    {#each data as datum, i (i)}
        {@const x_ = resolveChannel('x', datum, { x, y })}
        {@const y_ = resolveChannel('y', datum, { x, y })}
        {#if isValid(x_) && isValid(y_)}
            {@const [px, py] = projectXY(plot.scales, x_, y_)}
            <g transform="translate({px}, {py})">
                {@render children({ datum, x: px, y: py })}
            </g>
        {/if}
    {/each}
</GroupMultiple>
