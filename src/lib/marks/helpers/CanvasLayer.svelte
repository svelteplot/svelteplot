<script lang="ts">
    import { getContext } from 'svelte';
    import type { PlotContext } from 'svelteplot/types';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import { MediaQuery } from 'svelte/reactivity';
    import type { Attachment } from 'svelte/attachments';

    const darkMode = new MediaQuery('prefers-color-scheme: dark');
    let colorScheme = $state();

    /**
     * we need to repaint on dark mode changes in case the user
     * is using any css variables or currentColor that changes
     * with the color scheme
     */
    const watchColorScheme: Attachment = (element: Element) => {
        const htmlElement = element.ownerDocument.documentElement;
        const observer = new MutationObserver(() => {
            colorScheme = getComputedStyle(htmlElement).colorScheme;
        });
        observer.observe(htmlElement, { attributes: true });
        return () => {
            observer.disconnect();
        };
    };

    let restProps: {} = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());
</script>

<!-- 
    @component The CanvasLayer component is a helper component that inserts a 
    canvas element inside a foreignObject for use in a plot and takes care of 
    scaling it to the device pixel ratio.
-->
<foreignObject x="0" y="0" {@attach watchColorScheme} width={plot.width} height={plot.height}>
    {#key [colorScheme, darkMode.current]}
        <canvas
            xmlns="http://www.w3.org/1999/xhtml"
            {...restProps}
            width={plot.width * (devicePixelRatio.current ?? 1)}
            height={plot.height * (devicePixelRatio.current ?? 1)}
            style="width: {plot.width}px; height: {plot.height}px;"></canvas>
    {/key}
</foreignObject>

<style>
    foreignObject,
    canvas {
        color: currentColor;
    }
</style>
