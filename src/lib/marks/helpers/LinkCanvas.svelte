<!--
@component
Helper component for rendering Link marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface LinkCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum>;
        usedScales: UsedScales;
        curveFactory: CurveFactory | CurveBundleFactory;
    }

    import type {
        BaseMarkProps,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import {
        line,
        type CurveFactory,
        type CurveBundleFactory,
        type Line as D3Line
    } from 'd3-shape';
    import CanvasLayer from './CanvasLayer.svelte';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales, curveFactory }: LinkCanvasProps = $props();

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                const fn: D3Line<[number, number]> = line<[number, number]>()
                    .curve(curveFactory as CurveFactory)
                    .x((d) => d[0])
                    .y((d) => d[1])
                    .context(context);

                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);
                context.lineJoin = 'round';
                context.lineCap = 'round';

                for (const d of data) {
                    if (!d.valid) continue;

                    const styleProps = resolveScaledStyleProps(
                        d.datum,
                        options,
                        usedScales,
                        plot,
                        'stroke'
                    ) as Record<string, unknown>;

                    const opacity = +(styleProps['opacity'] ?? 1);
                    const strokeOpacity = +(styleProps['stroke-opacity'] ?? 1);
                    const stroke = resolveColor(
                        String(styleProps.stroke || 'currentColor'),
                        canvas
                    );

                    if (!stroke || stroke === 'none') continue;

                    const strokeWidth = (resolveProp(options.strokeWidth, d.datum, 1.6) ??
                        1.6) as number;

                    context.lineWidth = strokeWidth;
                    context.strokeStyle = stroke;
                    context.globalAlpha = opacity * strokeOpacity;

                    context.beginPath();
                    fn([
                        [d.x1 as number, d.y1 as number],
                        [d.x2 as number, d.y2 as number]
                    ]);
                    context.stroke();
                }

                fn.context(null);
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
