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

    function normalizeLineCap(value: unknown): CanvasLineCap {
        return value === 'round' || value === 'square' || value === 'butt' ? value : 'butt';
    }

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                const yUsesBand = usedScales.y && plot.scales.y.type === 'band';
                const xUsesBand = usedScales.x && plot.scales.x.type === 'band';
                const yBandwidth = yUsesBand ? plot.scales.y.fn.bandwidth() : 0;
                const xBandwidth = xUsesBand ? plot.scales.x.fn.bandwidth() : 0;
                const hasYChannel = options.y != null;
                const hasXChannel = options.x != null;
                const marginTop = plot.options.marginTop;
                const marginLeft = plot.options.marginLeft;
                const fullY2 = marginTop + plot.plotHeight;
                const fullX2 = marginLeft + plot.facetWidth;

                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);
                context.beginPath();

                let currentStyle: {
                    key: string;
                    stroke: string;
                    lineCap: CanvasLineCap;
                    lineWidth: number;
                    alpha: number;
                } | null = null;
                let hasCurrentSegments = false;
                const resolvedStrokeCache: Record<
                    string,
                    ReturnType<typeof resolveColor>
                > = Object.create(null);
                let currentTickLength = 10;
                let currentInsetValue: number | string = 0;

                const flushPath = () => {
                    if (!currentStyle || !hasCurrentSegments) return;

                    let resolvedStroke = resolvedStrokeCache[currentStyle.stroke];
                    if (!(currentStyle.stroke in resolvedStrokeCache)) {
                        resolvedStroke = resolveColor(currentStyle.stroke, canvas);
                        resolvedStrokeCache[currentStyle.stroke] = resolvedStroke;
                    }
                    if (resolvedStroke && resolvedStroke !== 'none') {
                        context.lineCap = currentStyle.lineCap;
                        context.lineWidth = currentStyle.lineWidth;
                        context.strokeStyle = resolvedStroke;
                        context.globalAlpha = currentStyle.alpha;
                        context.stroke();
                    }

                    context.beginPath();
                    hasCurrentSegments = false;
                };

                const prepareStyle = (datum: ScaledDataRecord<Datum>) => {
                    let { stroke, ...restStyles } = resolveScaledStyleProps(
                        datum.datum,
                        options,
                        usedScales,
                        plot,
                        'stroke'
                    );

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const strokeOpacity = maybeOpacity(restStyles['stroke-opacity']);
                    const lineCap = normalizeLineCap(restStyles['stroke-linecap']);
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

                    const strokeValue = String(stroke || 'currentColor');
                    const alpha = opacity * strokeOpacity;
                    const styleKey = `${strokeValue}|${lineCap}|${strokeWidth}|${alpha}`;
                    if (!currentStyle || currentStyle.key !== styleKey) {
                        flushPath();
                        currentStyle = {
                            key: styleKey,
                            stroke: strokeValue,
                            lineCap,
                            lineWidth: strokeWidth,
                            alpha
                        };
                    }

                    currentTickLength = tickLength;
                    currentInsetValue = insetValue;
                };

                if (orientation === 'vertical') {
                    for (const datum of data) {
                        if (!datum.valid) continue;
                        prepareStyle(datum);

                        const x = datum.x;
                        if (x == null) continue;

                        let y1: number;
                        let y2: number;

                        if (hasYChannel) {
                            const y = datum.y;
                            if (y == null) continue;

                            y1 = y - yBandwidth * 0.5;
                            y2 = y + yBandwidth * 0.5;
                        } else {
                            y1 = marginTop + (datum.dy ?? 0);
                            y2 = fullY2 + (datum.dy ?? 0);
                        }

                        const inset = parseInset(currentInsetValue, Math.abs(y2 - y1));
                        const singlePoint = y1 === y2;
                        context.moveTo(x, y1 + inset + (singlePoint ? currentTickLength * 0.5 : 0));
                        context.lineTo(x, y2 - inset - (singlePoint ? currentTickLength * 0.5 : 0));
                        hasCurrentSegments = true;
                    }
                } else {
                    for (const datum of data) {
                        if (!datum.valid) continue;
                        prepareStyle(datum);

                        const y = datum.y;
                        if (y == null) continue;

                        let x1: number;
                        let x2: number;

                        if (hasXChannel) {
                            const x = datum.x;
                            if (x == null) continue;

                            x1 = x - xBandwidth * 0.5;
                            x2 = x + xBandwidth * 0.5;
                        } else {
                            x1 = marginLeft + (datum.dx ?? 0);
                            x2 = fullX2 + (datum.dx ?? 0);
                        }

                        const inset = parseInset(currentInsetValue, Math.abs(x2 - x1));
                        const singlePoint = x1 === x2;
                        context.moveTo(x1 + inset + (singlePoint ? currentTickLength * 0.5 : 0), y);
                        context.lineTo(x2 - inset - (singlePoint ? currentTickLength * 0.5 : 0), y);
                        hasCurrentSegments = true;
                    }
                }
                flushPath();
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
