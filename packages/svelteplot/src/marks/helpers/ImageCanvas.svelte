<!--
@component
Helper component for rendering Image marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface ImageCanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            src?: ConstantAccessor<string, Datum>;
            width?: ConstantAccessor<number, Datum>;
            height?: ConstantAccessor<number, Datum>;
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
    import { resolveProp } from '../../helpers/resolve.js';
    import type { Attachment } from 'svelte/attachments';
    import { SvelteMap } from 'svelte/reactivity';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales }: ImageCanvasProps = $props();

    // Cache loaded images by URL to avoid redundant fetches
    const imageCache = new SvelteMap<string, HTMLImageElement>();

    // Reactive counter: incremented when an image finishes loading,
    // which triggers the $effect to re-run and repaint the canvas.
    let loadedCount = $state(0);

    function getImage(url: string): HTMLImageElement | undefined {
        if (imageCache.has(url)) {
            const img = imageCache.get(url)!;
            return img.complete && img.naturalWidth > 0 ? img : undefined;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        imageCache.set(url, img);
        img.onload = () => {
            loadedCount++;
        };
        img.onerror = () => {
            // Remove failed entries so they can be retried
            imageCache.delete(url);
        };
        img.src = url;
        return img.complete && img.naturalWidth > 0 ? img : undefined;
    }

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            // Reference loadedCount so this effect re-runs when images load
            void loadedCount;

            if (context) {
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const d of data) {
                    if (!d.valid) continue;

                    const datum = d.datum as unknown as Datum;

                    const srcUrl = resolveProp(options.src, datum, '') as string;
                    if (!srcUrl) continue;

                    const img = getImage(srcUrl);
                    if (!img) continue;

                    const w =
                        d.r !== undefined
                            ? (d.r as number) * 2
                            : (Number(resolveProp(options.width, datum, 20) ?? 20) as number);
                    const h =
                        d.r !== undefined
                            ? (d.r as number) * 2
                            : (Number(
                                  resolveProp(options.height || options.width, datum, 20) ?? 20
                              ) as number);

                    const x = (d.x ?? 0) - w * 0.5;
                    const y = (d.y ?? 0) - h * 0.5;

                    if (d.r !== undefined) {
                        // Circular clipping
                        const cx = d.x as number;
                        const cy = d.y as number;
                        const r = d.r as number;
                        context.save();
                        context.beginPath();
                        context.arc(cx, cy, r, 0, Math.PI * 2);
                        context.clip();
                        context.drawImage(img, x, y, w, h);
                        context.restore();
                    } else {
                        context.drawImage(img, x, y, w, h);
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
