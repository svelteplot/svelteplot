<!--
    @component
    For showing custom HTML tooltips positioned at x/y coordinates
-->

<script lang="ts" generics="Datum extends DataRecord">
    interface CustomMarkHTMLProps {
        /** the input data array */
        data: Datum[];
        /** the horizontal position channel; bound to the x scale */
        x?: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y?: ChannelAccessor<Datum>;
        /** anchor position within the frame when x or y is not specified */
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
        /** CSS class applied to the wrapper element */
        class: string | null;
        /** snippet rendered for each data point with the datum and its projected coordinates */
        children: Snippet<[{ datum: Datum; x: number; y: number }]>;
    }
    import { type Snippet } from 'svelte';
    import type { ChannelAccessor, ConstantAccessor, DataRecord } from '../types/index.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    import { resolveChannel } from '../helpers/resolve.js';
    import { projectX, projectY, projectXY } from '../helpers/scales.js';
    import { isValid } from '../helpers/index.js';

    const plot = usePlot();

    let {
        data = [{} as Datum],
        x,
        y,
        frameAnchor,
        children,
        class: className = null
    }: CustomMarkHTMLProps = $props();

    function getXY(datum: Datum) {
        const fa = (frameAnchor || 'center') as string;
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
