<!--
@component
Helper component for rendering Arrow marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface ArrowCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            headAngle?: ConstantAccessor<number, Datum>;
            headLength?: ConstantAccessor<number, Datum>;
            bend?: ConstantAccessor<number, Datum> | true;
            inset?: ConstantAccessor<number, Datum>;
            insetStart?: ConstantAccessor<number, Datum>;
            insetEnd?: ConstantAccessor<number, Datum>;
            sweep?: SweepOption;
        };
        usedScales: UsedScales;
    }

    import type {
        BaseMarkProps,
        ConstantAccessor,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import { coalesce, maybeNumber } from '../../helpers/index.js';
    import {
        arrowPath,
        maybeSweep,
        type SweepFunc,
        type SweepOption
    } from '../../helpers/arrowPath.js';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales }: ArrowCanvasProps = $props();

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                const sweep = maybeSweep(options.sweep) as SweepFunc;

                for (const d of data) {
                    if (!d.valid) continue;

                    const datum = d.datum as unknown as Datum;

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

                    const strokeWidth = (resolveProp(options.strokeWidth, datum, 1) ?? 1) as number;
                    const inset = resolveProp(options.inset, datum, 0);
                    const insetStart = resolveProp(options.insetStart, datum);
                    const insetEnd = resolveProp(options.insetEnd, datum);
                    const headAngle = (resolveProp(options.headAngle, datum, 60) ?? 60) as number;
                    const headLength = (resolveProp(options.headLength, datum, 8) ?? 8) as number;
                    const bendVal =
                        options.bend === true
                            ? 22.5
                            : ((resolveProp(
                                  options.bend as ConstantAccessor<number, Datum>,
                                  datum,
                                  0
                              ) ?? 0) as number);

                    const pathStr = arrowPath(
                        d.x1 ?? 0,
                        d.y1 ?? 0,
                        d.x2 ?? 0,
                        d.y2 ?? 0,
                        maybeNumber(coalesce(insetStart, inset)) ?? 0,
                        maybeNumber(coalesce(insetEnd, inset)) ?? 0,
                        headAngle,
                        headLength,
                        bendVal,
                        strokeWidth,
                        sweep
                    );

                    if (!pathStr) continue;

                    const path = new Path2D(pathStr);

                    context.lineWidth = strokeWidth;
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = stroke;
                    context.globalAlpha = opacity * strokeOpacity;
                    context.stroke(path);
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
