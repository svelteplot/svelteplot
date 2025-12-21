<script lang="ts" generics="Datum extends DataRecord">
    import type {
        Mark,
        BaseMarkProps,
        ScaledDataRecord,
        UsedScales,
        CurveName,
        ConstantAccessor
    } from 'svelteplot/types/index.js';
    import CanvasLayer from './CanvasLayer.svelte';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { resolveColor } from './canvas.js';
    import type { CurveFactory } from 'd3-shape';
    import { trailPath, type TrailSample } from './trail';
    import { resolveProp, resolveScaledStyleProps } from 'svelteplot/helpers/resolve';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    interface TrailCanvasProps<Datum> {
        curve?: CurveName | CurveFactory;
        tension?: number;
        cap?: 'butt' | 'round';
        resolution?: number | 'auto';
        data: ScaledDataRecord<Datum>[][];
        usedScales: UsedScales;
        options: {
            fill?: ConstantAccessor<string, Datum>;
            defined?: ConstantAccessor<boolean, Datum>;
            opacity?: ConstantAccessor<number, Datum>;
            'fill-opacity'?: ConstantAccessor<number, Datum>;
        };
    }

    let {
        curve,
        cap,
        tension,
        resolution,
        usedScales,
        data: groupedTrailData,
        options
    }: TrailCanvasProps<Datum> = $props();

    function maybeOpacity(value: unknown) {
        return value == null ? 1 : +value;
    }

    const plot = usePlot();

    const render = ((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const trailData of groupedTrailData) {
                    if (trailData.length < 2) continue;

                    // Get the first point to determine line styles
                    const firstPoint = trailData[0];
                    if (!firstPoint || !firstPoint.valid) continue;

                    const samples = trailData.map((d) => ({
                        x: Number(d.x),
                        y: Number(d.y),
                        r: Number(d.r ?? 0)
                    })) satisfies TrailSample[];

                    const defined = trailData.map(
                        (d) =>
                            d.valid &&
                            d.r >= 0 &&
                            (resolveProp(options.defined, d.datum, true) ?? true)
                    );

                    let { fill, ...restStyles } = resolveScaledStyleProps(
                        firstPoint.datum,
                        options,
                        usedScales,
                        plot,
                        'fill'
                    );

                    const opacity = maybeOpacity(restStyles['opacity']);
                    const fillOpacity = maybeOpacity(restStyles['fill-opacity']);

                    fill = resolveColor(fill, canvas);

                    context.fillStyle = fill ? fill : 'currentColor';
                    context.beginPath();

                    trailPath(samples, defined, context, {
                        curve,
                        cap,
                        tension,
                        ...(typeof resolution === 'number' ? { samplesPerSegment: resolution } : {})
                    });

                    context.globalAlpha = opacity * fillOpacity;
                    context.fill();

                    // {#each groupedTrailData as trailData, i (i)}
                    //         {@const samples = trailData.map((d) => ({
                    //             x: Number(d.x),
                    //             y: Number(d.y),
                    //             r: Number(d.r ?? 0)
                    //         })) satisfies TrailSample[]}
                    //         {@const defined = trailData.map(
                    //             (d) =>
                    //                 d.valid &&
                    //                 d.r >= 0 &&
                    //                 (resolveProp(options.defined, d.datum, true) ?? true)
                    //         )}
                    //         {@const pathString = trailPath(samples, defined, d3Path(), {
                    //             curve,
                    //             cap,
                    //             tension,
                    //             ...(typeof resolution === 'number'
                    //                 ? { samplesPerSegment: resolution }
                    //                 : {})
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
    }) as Attachment;
</script>

<CanvasLayer {@attach render} />
