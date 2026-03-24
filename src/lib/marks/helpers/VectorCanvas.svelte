<!--
@component
Helper component for rendering Vector marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface VectorCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            rotate?: ChannelAccessor<Datum>;
            r?: number;
            anchor?: 'start' | 'middle' | 'end';
            shape?: 'arrow' | 'spike' | 'arrow-filled' | ShapeRenderer;
        };
        usedScales: UsedScales;
    }

    import type {
        BaseMarkProps,
        ChannelAccessor,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import { defaultRadius, shapePath, type ShapeRenderer } from '../../helpers/vectorShapes.js';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales }: VectorCanvasProps = $props();

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                const shape = options.shape ?? 'arrow';
                const anchor = options.anchor ?? 'middle';
                const defaultColorProp = shape === 'arrow-filled' ? 'fill' : 'stroke';

                for (const d of data) {
                    if (!d.valid) continue;

                    const datum = d.datum as unknown as Datum;
                    const length = d.length as number;
                    const r = (d.r as number) ?? defaultRadius;

                    if (length == null || r == null) continue;

                    const styleProps = resolveScaledStyleProps(
                        d.datum,
                        options,
                        usedScales,
                        plot,
                        defaultColorProp
                    ) as Record<string, unknown>;

                    const opacity = +(styleProps['opacity'] ?? 1);
                    const fillOpacity = +(styleProps['fill-opacity'] ?? 1);
                    const strokeOpacity = +(styleProps['stroke-opacity'] ?? 1);
                    const fill = resolveColor(String(styleProps.fill || 'none'), canvas);
                    const stroke = resolveColor(String(styleProps.stroke || 'none'), canvas);

                    const hasFill = fill && fill !== 'none';
                    const hasStroke = stroke && stroke !== 'none';

                    if (!hasFill && !hasStroke) continue;

                    const rotateDeg = (resolveProp(options.rotate, datum, 0) ?? 0) as number;
                    const rotateRad = (rotateDeg * Math.PI) / 180;

                    const anchorOffset =
                        anchor === 'start' ? 0 : anchor === 'end' ? length : length / 2;

                    const pathStr = shapePath(shape, length, r);
                    if (!pathStr) continue;
                    const path2d = new Path2D(pathStr);

                    const strokeWidth = (resolveProp(options.strokeWidth, datum, 1.5) ??
                        1.5) as number;

                    context.save();
                    context.translate(d.x as number, d.y as number);
                    context.rotate(rotateRad);
                    context.translate(0, anchorOffset);

                    context.lineWidth = strokeWidth;
                    context.lineCap = 'round';
                    context.lineJoin = 'round';

                    if (hasFill) {
                        context.fillStyle = fill as string;
                        context.globalAlpha = opacity * fillOpacity;
                        context.fill(path2d);
                    }

                    if (hasStroke) {
                        context.strokeStyle = stroke as string;
                        context.globalAlpha = opacity * strokeOpacity;
                        context.stroke(path2d);
                    }

                    context.restore();
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
