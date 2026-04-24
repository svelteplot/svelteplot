<!--
@component
Helper class for rendering Cell, Bar and Rect marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface RectCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & BaseRectMarkProps<Datum>;
        usedScales: UsedScales;
        /**
         * By default, the `inset` property is applied to all four insets. Mark components
         * can tweak this behavior for insetTop and insetBottom by setting the
         * useInsetAsFallbackVertically prop to false.
         */
        useInsetAsFallbackVertically?: boolean;
        /**
         * By default, the `inset` property is applied to all four insets. Mark components
         * can tweak this behavior for insetLeft and insetRight by setting the
         * useInsetAsFallbackHorizontally prop to false.
         */
        useInsetAsFallbackHorizontally?: boolean;
        fallbackStyle?: 'fill' | 'stroke';
    }

    import type {
        BaseMarkProps,
        BaseRectMarkProps,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import type { BorderRadius } from 'svelteplot/types/mark.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import { roundedRect } from 'svelteplot/helpers/roundedRect';
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
        useInsetAsFallbackVertically = true,
        useInsetAsFallbackHorizontally = true,
        fallbackStyle
    }: RectCanvasProps = $props();

    const defaultColorProp = $derived(
        fallbackStyle ?? (options.stroke && !options.fill ? 'stroke' : 'fill')
    );

    function hasBorderRadius(borderRadius: BorderRadius) {
        return (
            (typeof borderRadius === 'number' && borderRadius > 0) ||
            (typeof borderRadius === 'object' &&
                Math.max(
                    borderRadius.topRight ?? 0,
                    borderRadius.bottomRight ?? 0,
                    borderRadius.topLeft ?? 0,
                    borderRadius.bottomLeft ?? 0
                ) > 0)
        );
    }

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

                    const x1 = datum.x1;
                    const x2 = datum.x2;
                    const y1 = datum.y1;
                    const y2 = datum.y2;

                    if (x1 == null || x2 == null || y1 == null || y2 == null) continue;

                    const minx = Math.min(x1, x2);
                    const maxx = Math.max(x1, x2);
                    const miny = Math.min(y1, y2);
                    const maxy = Math.max(y1, y2);

                    const inset = resolveProp(options.inset, datum.datum, 0) ?? 0;
                    const insetLeft =
                        resolveProp(
                            options.insetLeft,
                            datum.datum,
                            useInsetAsFallbackHorizontally ? inset : 0
                        ) ?? 0;
                    const insetRight =
                        resolveProp(
                            options.insetRight,
                            datum.datum,
                            useInsetAsFallbackHorizontally ? inset : 0
                        ) ?? 0;
                    const insetTop =
                        resolveProp(
                            options.insetTop,
                            datum.datum,
                            useInsetAsFallbackVertically ? inset : 0
                        ) ?? 0;
                    const insetBottom =
                        resolveProp(
                            options.insetBottom,
                            datum.datum,
                            useInsetAsFallbackVertically ? inset : 0
                        ) ?? 0;

                    const rectX = minx + insetLeft;
                    const rectY = miny + insetBottom;
                    const rectWidth = maxx - minx - insetLeft - insetRight;
                    const rectHeight = maxy - miny - insetTop - insetBottom;

                    if (rectWidth <= 0 || rectHeight <= 0) continue;

                    const borderRadius = resolveProp(
                        options.borderRadius,
                        datum.datum,
                        0
                    ) as BorderRadius;
                    const round = hasBorderRadius(borderRadius);

                    let { fill, stroke, ...restStyles } = resolveScaledStyleProps(
                        datum.datum,
                        options,
                        usedScales,
                        plot,
                        defaultColorProp
                    ) as { fill: string; stroke: string } & Record<string, unknown>;

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const fillOpacity = maybeOpacity(restStyles['fill-opacity']);
                    const strokeOpacity = maybeOpacity(restStyles['stroke-opacity']);

                    if (typeof fill === 'string') {
                        fill = resolveColor(fill, canvas) as string;
                    }
                    if (typeof stroke === 'string') {
                        stroke = resolveColor(stroke, canvas) as string;
                    }

                    if (stroke && stroke !== 'none') {
                        const strokeWidth = resolveProp(options.strokeWidth, datum.datum, 1);
                        context.lineWidth = strokeWidth ?? 1;
                    }

                    if (round) {
                        const path = new Path2D(
                            roundedRect(rectX, rectY, rectWidth, rectHeight, borderRadius)
                        );

                        if (fill && fill !== 'none') {
                            context.fillStyle = fill;
                            context.globalAlpha = opacity * fillOpacity;
                            context.fill(path);
                        }

                        if (stroke && stroke !== 'none') {
                            context.strokeStyle = stroke;
                            context.globalAlpha = opacity * strokeOpacity;
                            context.stroke(path);
                        }
                    } else {
                        context.beginPath();
                        context.rect(rectX, rectY, rectWidth, rectHeight);

                        if (fill && fill !== 'none') {
                            context.fillStyle = fill;
                            context.globalAlpha = opacity * fillOpacity;
                            context.fill();
                        }

                        if (stroke && stroke !== 'none') {
                            context.strokeStyle = stroke;
                            context.globalAlpha = opacity * strokeOpacity;
                            context.stroke();
                        }
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
