<!--
    @component
    For showing custom HTML tooltips positioned at x/y coordinates
-->

<script lang="ts" generics="Datum extends DataRecord">
    interface CustomMarkHTMLProps {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        frameAnchor?: ConstantAccessor<
            | 'bottom'
            | 'top'
            | 'left'
            | 'right'
            | 'top-left'
            | 'bottom-left'
            | 'top-right'
            | 'bottom-right'
            | 'center',
            Datum
        >;
        class: string | null;
        children: Snippet<{ datum: Datum; x: number; y: number }>;
    }
    import { getContext, type Snippet } from 'svelte';
    import type {
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        PlotContext
    } from '../types/index.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    import { resolveChannel } from '$lib/helpers/resolve.js';
    import { projectX, projectY, projectXY } from '$lib/helpers/scales.js';
    import { isValid } from '$lib/helpers/index.js';

    let {
        data = [{} as Datum],
        x,
        y,
        frameAnchor,
        children,
        class: className = null
    }: CustomMarkHTMLProps = $props();

    function getXY(datum: Datum) {
        const fa = frameAnchor || 'center';
        const isLeft = fa.endsWith('left');
        const isRight = fa.endsWith('right');
        const isTop = fa.startsWith('top');
        const isBottom = fa.startsWith('bottom');

        if (x == null || y == null) {
            // project x and y individually
            const px =
                x != null
                    ? projectX('x', plot.scales, resolveChannel('x', datum, { x, y }))
                    : plot.options.marginLeft +
                      (isLeft ? 0 : isRight ? plot.width : plot.width / 2);
            const py =
                y != null
                    ? projectY('y', plot.scales, resolveChannel('y', datum, { x, y }))
                    : plot.options.marginTop +
                      (isTop ? 0 : isBottom ? plot.height : plot.height / 2);
            return [px, py];
        } else {
            // use projectXY
            const x_ = resolveChannel('x', datum, { x, y });
            const y_ = resolveChannel('y', datum, { x, y });
            return projectXY(plot.scales, x_, y_);
        }
    }
</script>

{#snippet customMarks()}
    {#each data as datum, i (i)}
        {@const [px, py] = getXY(datum)}
        {#if isValid(px) && isValid(py)}
            <div
                class="custom-mark-html"
                style:left="{px.toFixed(0)}px"
                style:top="{py.toFixed(0)}px">
                {@render children({ datum, x: px, y: py })}
            </div>
        {/if}
    {/each}
{/snippet}

{#if data.length > 1 || className}
    <div class="g-custom-mark-html {className || ''}">
        {@render customMarks()}
    </div>
{:else}
    {@render customMarks()}
{/if}

<style>
    .custom-mark-html {
        position: absolute;
    }
</style>
