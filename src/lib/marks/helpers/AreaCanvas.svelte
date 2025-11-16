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
    import { type Area } from 'd3-shape';
    import CanvasLayer from './CanvasLayer.svelte';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { resolveColor } from './canvas.js';

    let {
        mark,
        groupedAreaData,
        usedScales,
        areaPath
    }: {
        mark: Mark<BaseMarkProps>;
        groupedAreaData: ScaledDataRecord[][];
        usedScales: UsedScales;
        areaPath: Area<ScaledDataRecord>;
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
                areaPath.context(context);
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const group of groupedAreaData) {
                    if (group.length < 2) continue;

                    // Get the first point to determine area styles
                    const firstPoint = group[0];
                    if (!firstPoint || !firstPoint.valid) continue;

                    let { fill, stroke, ...restStyles } = resolveScaledStyleProps(
                        firstPoint.datum,
                        mark.options,
                        usedScales,
                        plot,
                        'fill'
                    );

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const fillOpacity = maybeOpacity(restStyles['fill-opacity']);
                    const strokeOpacity = maybeOpacity(restStyles['stroke-opacity']);

                    const strokeWidth = resolveProp(
                        mark.options.strokeWidth,
                        firstPoint.datum,
                        0
                    ) as number;

                    fill = resolveColor(fill || 'currentColor', canvas);
                    stroke = resolveColor(stroke, canvas);

                    // Start drawing the area
                    context.beginPath();
                    areaPath(group);

                    // Fill the area
                    if (fill && fill !== 'none') {
                        context.fillStyle = fill;
                        context.globalAlpha = opacity * fillOpacity;
                        context.fill();
                    }

                    // Stroke the area outline if strokeWidth > 0
                    if (stroke && stroke !== 'none' && strokeWidth > 0) {
                        context.strokeStyle = stroke;
                        context.lineWidth = strokeWidth;
                        context.globalAlpha = opacity * strokeOpacity;
                        context.stroke();
                    }
                }
                areaPath.context(null);
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
