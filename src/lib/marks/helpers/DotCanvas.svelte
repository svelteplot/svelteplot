<script lang="ts">
    import type {
        PlotState,
        Mark,
        BaseMarkProps,
        ScaledDataRecord,
        PlotContext
    } from 'svelteplot/types/index.js';
    import { resolveProp } from '$lib/helpers/resolve.js';
    import { maybeSymbol } from '$lib/helpers/symbols.js';
    import { symbol as d3Symbol } from 'd3-shape';
    import type { Attachment } from 'svelte/attachments';
    import CanvasLayer from './CanvasLayer.svelte';
    import { getContext } from 'svelte';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { resolveColor } from './canvas.js';

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    let {
        mark,
        data
    }: {
        mark: Mark<BaseMarkProps>;
        plot: PlotState;
        data: ScaledDataRecord[];
    } = $props();

    function drawSymbolPath(symbolType: string, size: number, context) {
        // maybeSymbol(symbolType).draw(context, size);
        return d3Symbol(maybeSymbol(symbolType), size).context(context)();
    }

    let _markOptions = $state(mark.options);

    const renderDots: Attachment = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const datum of data) {
                    if (datum.valid) {
                        let { fill, stroke } = datum;

                        fill = resolveColor(fill, canvas);
                        stroke = resolveColor(stroke, canvas);

                        if (stroke && stroke !== 'none') {
                            const strokeWidth = resolveProp(
                                _markOptions.strokeWidth,
                                datum.datum,
                                1.6
                            );
                            context.lineWidth = strokeWidth;
                        }

                        context.fillStyle = fill ? fill : 'none';
                        context.strokeStyle = stroke ? stroke : 'none';
                        context.translate(datum.x, datum.y);

                        const size = datum.r * datum.r * Math.PI;

                        context.beginPath();
                        drawSymbolPath(datum.symbol, size, context);
                        context.closePath();

                        const { opacity = 1, fillOpacity = 1, strokeOpacity = 1 } = datum;

                        if (opacity != null) context.globalAlpha = opacity ?? 1;
                        if (fillOpacity != null) context.globalAlpha = (opacity ?? 1) * fillOpacity;
                        if (fill && fill !== 'none') context.fill();
                        if (strokeOpacity != null)
                            context.globalAlpha = (opacity ?? 1) * strokeOpacity;
                        if (stroke && stroke !== 'none') context.stroke();
                        context.translate(-datum.x, -datum.y);
                    }
                }
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
    };
</script>

<CanvasLayer {@attach renderDots} />
