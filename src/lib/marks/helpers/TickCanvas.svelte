<script lang="ts" generics="Datum extends DataRecord">
    interface TickCanvasProps<Datum extends DataRecord> {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            x?: ChannelAccessor<Datum>;
            y?: ChannelAccessor<Datum>;
            inset?: ConstantAccessor<number | string, Datum>;
            tickLength?: ConstantAccessor<number, Datum>;
        };
        usedScales: UsedScales;
        orientation: 'vertical' | 'horizontal';
    }

    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '$lib/helpers/resolve.js';
    import { parseInset } from '$lib/helpers/index.js';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales, orientation }: TickCanvasProps<Datum> = $props();

    function maybeOpacity(value: unknown) {
        return value == null ? 1 : +value;
    }

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const datum of data) {
                    if (!datum.valid) continue;

                    let { stroke, ...restStyles } = resolveScaledStyleProps(
                        datum.datum,
                        options,
                        usedScales,
                        plot,
                        'stroke'
                    );

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const strokeOpacity = maybeOpacity(restStyles['stroke-opacity']);
                    const rawLinecap = restStyles['stroke-linecap'] as CanvasLineCap | undefined;
                    const strokeWidth = +(resolveProp(
                        options.strokeWidth,
                        datum.datum,
                        1
                    ) as number);
                    const tickLength = +(resolveProp(
                        options.tickLength,
                        datum.datum,
                        10
                    ) as number);
                    const insetValue = resolveProp(options.inset, datum.datum, 0) as
                        | number
                        | string;

                    stroke = resolveColor(stroke || 'currentColor', canvas);
                    if (!stroke || stroke === 'none') continue;

                    context.lineCap =
                        rawLinecap === 'round' || rawLinecap === 'square' || rawLinecap === 'butt'
                            ? rawLinecap
                            : 'butt';
                    context.lineWidth = strokeWidth;
                    context.strokeStyle = stroke;
                    context.globalAlpha = opacity * strokeOpacity;
                    context.beginPath();

                    if (orientation === 'vertical') {
                        const x = datum.x;
                        if (x == null) continue;

                        let y1: number;
                        let y2: number;

                        if (options.y != null) {
                            const y = datum.y;
                            if (y == null) continue;

                            const bandwidth =
                                usedScales.y && plot.scales.y.type === 'band'
                                    ? plot.scales.y.fn.bandwidth()
                                    : 0;
                            y1 = y - bandwidth * 0.5;
                            y2 = y + bandwidth * 0.5;
                        } else {
                            y1 = plot.options.marginTop + (datum.dy ?? 0);
                            y2 = plot.options.marginTop + plot.plotHeight + (datum.dy ?? 0);
                        }

                        const inset = parseInset(insetValue, Math.abs(y2 - y1));
                        const singlePoint = y1 === y2;
                        context.moveTo(x, y1 + inset + (singlePoint ? tickLength * 0.5 : 0));
                        context.lineTo(x, y2 - inset - (singlePoint ? tickLength * 0.5 : 0));
                    } else {
                        const y = datum.y;
                        if (y == null) continue;

                        let x1: number;
                        let x2: number;

                        if (options.x != null) {
                            const x = datum.x;
                            if (x == null) continue;

                            const bandwidth =
                                usedScales.x && plot.scales.x.type === 'band'
                                    ? plot.scales.x.fn.bandwidth()
                                    : 0;
                            x1 = x - bandwidth * 0.5;
                            x2 = x + bandwidth * 0.5;
                        } else {
                            x1 = plot.options.marginLeft + (datum.dx ?? 0);
                            x2 = plot.options.marginLeft + plot.facetWidth + (datum.dx ?? 0);
                        }

                        const inset = parseInset(insetValue, Math.abs(x2 - x1));
                        const singlePoint = x1 === x2;
                        context.moveTo(x1 + inset + (singlePoint ? tickLength * 0.5 : 0), y);
                        context.lineTo(x2 - inset - (singlePoint ? tickLength * 0.5 : 0), y);
                    }

                    context.stroke();
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

<CanvasLayer {@attach render} />
