<script lang="ts">
    import type {
        PlotState,
        ScaledDataRecord,
        ScaledChannelName,
        ChannelAccessor,
        MarkStyleProps
    } from 'svelteplot/types/index.js';
    import { resolveStyles, resolveProp } from '../../helpers/resolve.js';

    type StyleArgs = Partial<Record<ScaledChannelName | MarkStyleProps, ChannelAccessor>>;
    import { resolveColor } from './canvas.js';
    import type { Attachment } from 'svelte/attachments';
    import CanvasLayer from './CanvasLayer.svelte';
    import { devicePixelRatio } from 'svelte/reactivity/window';

    let {
        paths,
        args,
        className,
        usedScales,
        plot,
        defaultStrokeWidth = 1,
        canvas = false
    }: {
        paths: { path: string; datum: ScaledDataRecord }[];
        args: Record<string | symbol, any>;
        className: string;
        usedScales: Record<ScaledChannelName, boolean>;
        plot: PlotState;
        defaultStrokeWidth?: number;
        canvas?: boolean;
    } = $props();

    const render: Attachment = (el: Element) => {
        const canvasEl = el as HTMLCanvasElement;
        const context = canvasEl.getContext('2d');

        $effect(() => {
            if (!context) return;

            context.resetTransform();
            context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

            for (const { path: pathStr, datum } of paths) {
                const fillColor = resolveColor(datum.fill ?? 'none', canvasEl) as string;
                const strokeColor = resolveColor(datum.stroke ?? 'none', canvasEl) as string;
                const opacity = datum.opacity ?? 1;
                const fillOpacity = datum.fillOpacity ?? 1;
                const strokeOpacity = datum.strokeOpacity ?? 1;
                const strokeWidth = resolveProp(
                    (args as StyleArgs).strokeWidth as ChannelAccessor,
                    datum.datum,
                    defaultStrokeWidth
                ) as number;

                const p = new Path2D(pathStr);

                if (fillColor && fillColor !== 'none') {
                    context.fillStyle = fillColor;
                    context.globalAlpha = opacity * fillOpacity;
                    context.fill(p);
                }

                if (strokeColor && strokeColor !== 'none') {
                    context.strokeStyle = strokeColor;
                    context.lineWidth = strokeWidth ?? defaultStrokeWidth;
                    context.globalAlpha = opacity * strokeOpacity;
                    context.stroke(p);
                }
            }

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

{#if canvas}
    <CanvasLayer {@attach render} />
{:else}
    <g class={className}>
        {#each paths as { path, datum }, i (i)}
            {@const [style, styleClass] = resolveStyles(
                plot,
                datum,
                { strokeWidth: defaultStrokeWidth, ...(args as StyleArgs) },
                'stroke',
                usedScales
            )}
            <path d={path} class={styleClass} {style} />
        {/each}
    </g>
{/if}
