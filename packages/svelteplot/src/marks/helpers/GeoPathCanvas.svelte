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
        colorKeyword,
        fill,
        stroke,
        strokeWidth,
        strokeOpacity,
        fillOpacity,
        opacity,
        strokeMiterlimit,
        usePerPathFill = false,
        usePerPathStroke = false
    }: {
        scaledData: ScaledDataRecord[];
        path: GeoPath;
        /** Symbol key used to retrieve the GeoJSON geometry from each datum. */
        geomKey: symbol;
        /**
         * The color keyword that, when used as fill/stroke, maps the threshold
         * value through the plot's color scale.  E.g. "value" for Contour,
         * "density" for Density.
         */
        colorKeyword: string;
        fill: string;
        stroke: string;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
        opacity?: number;
        strokeMiterlimit?: number;
        usePerPathFill?: boolean;
        usePerPathStroke?: boolean;
    } = $props();

    const plot = usePlot();

    /** Resolve a fill/stroke string that may be the colorKeyword. */
    function resolveColorProp(prop: string, value: number): string {
        if (prop.toLowerCase() === colorKeyword.toLowerCase()) {
            return (plot.scales.color?.fn(value) as string) ?? 'currentColor';
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

                const thresholdValue = (d.datum[RAW_VALUE as any] as number) ?? 0;
                const fillColor = resolveCanvasColor(
                    usePerPathFill && d.fill
                        ? (d.fill as string)
                        : resolveColorProp(fill, thresholdValue)
                );
                const strokeColor = resolveCanvasColor(
                    usePerPathStroke && d.stroke
                        ? (d.stroke as string)
                        : resolveColorProp(stroke, thresholdValue)
                );

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
