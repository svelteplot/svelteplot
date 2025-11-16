<script lang="ts">
    import type {
        Mark,
        BaseMarkProps,
        PlotContext,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '$lib/helpers/resolve.js';
    import { getContext } from 'svelte';
    import { type Line } from 'd3-shape';
    import CanvasLayer from './CanvasLayer.svelte';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { resolveColor } from './canvas.js';

    let {
        mark,
        groupedLineData,
        usedScales,
        linePath
    }: {
        mark: Mark<BaseMarkProps>;
        groupedLineData: ScaledDataRecord[][];
        usedScales: UsedScales;
        linePath: Line<ScaledDataRecord>;
        groupByKey?: unknown;
    } = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    function maybeOpacity(value: unknown) {
        return value == null ? 1 : +value;
    }

    const render = ((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                linePath.context(context);
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);
                context.lineJoin = 'round';
                context.lineCap = 'round';

                for (const group of groupedLineData) {
                    if (group.length < 2) continue;

                    // Get the first point to determine line styles
                    const firstPoint = group[0];
                    if (!firstPoint || !firstPoint.valid) continue;

                    let { stroke, ...restStyles } = resolveScaledStyleProps(
                        firstPoint.datum,
                        mark.options,
                        usedScales,
                        plot,
                        'stroke'
                    );

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const strokeOpacity = maybeOpacity(restStyles['stroke-opacity']);

                    const strokeWidth = resolveProp(
                        mark.options.strokeWidth,
                        firstPoint.datum,
                        1.4
                    ) as number;

                    if (mark.options.outlineStroke) {
                        // draw stroke outline first
                        const outlineStroke = resolveColor(mark.options.outlineStroke, canvas);
                        const outlineStrokeWidth =
                            mark.options.outlineStrokeWidth ?? strokeWidth + 2;
                        const outlineStrokeOpacity = mark.options.outlineStrokeOpacity ?? 1;

                        context.lineWidth = outlineStrokeWidth;
                        context.strokeStyle = outlineStroke;
                        context.globalAlpha = opacity * outlineStrokeOpacity;
                        context.beginPath();
                        linePath(group);
                        context.stroke();
                    }

                    stroke = resolveColor(stroke, canvas);

                    if (stroke && stroke !== 'none') {
                        context.lineWidth = strokeWidth ?? 1.4;
                    }

                    context.strokeStyle = stroke ? stroke : 'currentColor';
                    context.globalAlpha = opacity * strokeOpacity;

                    // Start drawing the line
                    context.beginPath();
                    linePath(group);
                    context.stroke();
                }
                linePath.context(null);
            }

            return () => {
                context?.clearRect(
                    0,
                    0,
                    plot.width * (devicePixelRatio.current ?? 1),
                    plot.height * (devicePixelRatio.current ?? 1)
                );
            };
        });
    }) as Attachment;
</script>

<CanvasLayer {@attach render} />
