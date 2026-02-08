<!--
@component
Helper component for rendering Rule marks (RuleX and RuleY) in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RuleCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            inset?: ConstantAccessor<number, Datum>;
            insetTop?: ConstantAccessor<number, Datum>;
            insetBottom?: ConstantAccessor<number, Datum>;
            insetLeft?: ConstantAccessor<number, Datum>;
            insetRight?: ConstantAccessor<number, Datum>;
        };
        usedScales: UsedScales;
        orientation: 'vertical' | 'horizontal';
        marginTop?: number;
        marginLeft?: number;
        facetWidth?: number;
        facetHeight?: number;
    }

    import type {
        BaseMarkProps,
        ConstantAccessor,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '$lib/helpers/resolve.js';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let {
        data,
        options,
        usedScales,
        orientation,
        marginTop = plot.options.marginTop,
        marginLeft = plot.options.marginLeft,
        facetWidth = plot.facetWidth,
        facetHeight = plot.facetHeight
    }: RuleCanvasProps = $props();

    function maybeOpacity(value: unknown) {
        return value == null ? 1 : +value;
    }

    const render: Attachment = (canvas: HTMLCanvasElement) => {
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

                    stroke = resolveColor(stroke || 'currentColor', canvas);

                    if (stroke && stroke !== 'none') {
                        const resolvedLinecap = restStyles['stroke-linecap'] as
                            | CanvasLineCap
                            | undefined
                            | null;
                        const strokeWidth = resolveProp(
                            options.strokeWidth,
                            datum.datum,
                            1
                        ) as number;
                        context.lineCap =
                            resolvedLinecap === 'round' ||
                            resolvedLinecap === 'square' ||
                            resolvedLinecap === 'butt'
                                ? resolvedLinecap
                                : 'butt';
                        context.lineWidth = strokeWidth;
                        context.strokeStyle = stroke;
                        context.globalAlpha = opacity * strokeOpacity;

                        context.beginPath();

                        if (orientation === 'vertical') {
                            // RuleX: vertical line
                            const x = datum.x;
                            const inset = +resolveProp(options.inset, datum.datum, 0);
                            const insetTop = +resolveProp(options.insetTop, datum.datum, 0);
                            const insetBottom = +resolveProp(options.insetBottom, datum.datum, 0);

                            const y1 =
                                (inset || insetTop) +
                                (datum.y1 != null ? datum.y1 : marginTop + (datum.dy ?? 0));
                            const y2 =
                                (datum.y2 != null
                                    ? datum.y2
                                    : facetHeight + marginTop + (datum.dy ?? 0)) -
                                (inset || insetBottom);

                            if (x != null) {
                                context.moveTo(x, y1);
                                context.lineTo(x, y2);
                            }
                        } else {
                            // RuleY: horizontal line
                            const y = datum.y;
                            const inset = +resolveProp(options.inset, datum.datum, 0);
                            const insetLeft = +resolveProp(options.insetLeft, datum.datum, 0);
                            const insetRight = +resolveProp(options.insetRight, datum.datum, 0);

                            const x1 =
                                (inset || insetLeft) +
                                (datum.x1 != null ? datum.x1 : marginLeft + (datum.dx ?? 0));
                            const x2 =
                                (datum.x2 != null
                                    ? datum.x2
                                    : facetWidth + marginLeft + (datum.dx ?? 0)) -
                                (inset || insetRight);

                            if (y != null) {
                                context.moveTo(x1, y);
                                context.lineTo(x2, y);
                            }
                        }

                        context.stroke();
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

<CanvasLayer {@attach render} />
