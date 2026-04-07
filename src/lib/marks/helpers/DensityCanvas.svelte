<script lang="ts">
    import type { ScaledDataRecord } from 'svelteplot/types/index.js';
    import type { GeoPath } from 'd3-geo';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { CSS_VAR } from '../../constants.js';
    import CanvasLayer from './CanvasLayer.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import { RAW_VALUE } from '../../transforms/recordize.js';

    let {
        scaledData,
        path,
        geomKey,
        fill,
        stroke,
        strokeWidth,
        strokeOpacity,
        fillOpacity,
        opacity,
        strokeMiterlimit
    }: {
        scaledData: ScaledDataRecord[];
        path: GeoPath;
        /** Symbol key used to retrieve the DensityGeometry from each datum. */
        geomKey: symbol;
        fill: string;
        stroke: string;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
        opacity?: number;
        strokeMiterlimit?: number;
    } = $props();

    const plot = usePlot();

    /** Resolve a fill/stroke string that may be the "density" keyword. */
    function resolveColorProp(prop: string, densityValue: number): string {
        if (/^density$/i.test(prop)) {
            return (plot.scales.color?.fn(densityValue) as string) ?? 'currentColor';
        }
        return prop;
    }

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (!context) return;

            path.context(context);
            context.resetTransform();
            context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

            let currentColor: string | undefined;

            const resolveCanvasColor = (color: string): string => {
                if (color.toLowerCase() === 'currentcolor') {
                    return (
                        currentColor ||
                        (currentColor = getComputedStyle(
                            canvas.parentElement?.parentElement ?? canvas
                        ).getPropertyValue('color'))
                    );
                }
                if (CSS_VAR.test(color)) {
                    return getComputedStyle(canvas).getPropertyValue(color.slice(4, -1));
                }
                return color;
            };

            const globalOpacity = opacity ?? 1;
            if (strokeMiterlimit != null) context.miterLimit = strokeMiterlimit;

            for (const d of scaledData) {
                const geom = d.datum[geomKey as any] as any;
                if (!geom?.coordinates?.length) continue;

                const densityValue = (d.datum[RAW_VALUE as any] as number) ?? 0;
                const fillColor = resolveCanvasColor(resolveColorProp(fill, densityValue));
                const strokeColor = resolveCanvasColor(resolveColorProp(stroke, densityValue));

                context.beginPath();
                path(geom);
                context.closePath();

                if (fillColor && fillColor !== 'none') {
                    context.fillStyle = fillColor;
                    context.globalAlpha = globalOpacity * (fillOpacity ?? 1);
                    context.fill();
                }

                if (strokeColor && strokeColor !== 'none') {
                    context.strokeStyle = strokeColor;
                    context.lineWidth = strokeWidth ?? 1;
                    context.globalAlpha = globalOpacity * (strokeOpacity ?? 1);
                    context.stroke();
                }
            }

            // Reset path context in case we switch back to SVG rendering.
            path.context(null);

            return () => {
                context.clearRect(
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
