import type { BaseMarkProps, DataRecord, PlotScale, PlotState } from '$lib/types/index.js';
import type { MouseEventHandler } from 'svelte/elements';
import { pick } from 'es-toolkit';
import { RAW_VALUE } from '$lib/transforms/recordize.js';
import { INDEX } from '$lib/constants.js';

// Extend the MouseEvent type to include the properties we're using
declare global {
    interface MouseEvent {
        layerX?: number;
        layerY?: number;
        dataX?: number | string | Date;
        dataY?: number | string | Date;
    }
}

/**
 * Translates client coordinates (clientX, clientY) to the layer coordinates
 * of the plot frame, regardless of which element triggered the event
 */
export function clientToLayerCoordinates(
    event: MouseEvent,
    plotBody: HTMLElement | null | undefined
): [number, number] {
    // If layerX/Y already exist and the target is the plot frame (rect element),
    // we can use them directly
    // if (event.layerX !== undefined && (event.target as SVGElement).tagName === 'rect') {
    //     return [event.layerX, event.layerY];
    // }

    // Otherwise, transform from client coordinates to layer coordinates
    // by getting the bounds of the plot body element and calculating the offset
    if (!plotBody) return [0, 0];
    const plotBodyRect = plotBody.getBoundingClientRect();

    // Calculate the coordinates relative to the plot body
    return [event.clientX - plotBodyRect.left, event.clientY - plotBodyRect.top];
}

export function addEventHandlers(
    node: SVGElement,
    {
        options,
        datum,
        getPlotState
    }: { options: BaseMarkProps; datum: DataRecord; getPlotState: () => PlotState }
) {
    const events = pick(options, [
        'onclick',
        'oncontextmenu',
        'ondblclick',
        'ondrag',
        'ondragend',
        'ondragenter',
        'ondragleave',
        'ondragover',
        'ondragstart',
        'ondrop',
        'onmousedown',
        'onmouseenter',
        'onmouseleave',
        'onmousemove',
        'onmouseout',
        'onmouseover',
        'onmouseup',
        'onpointercancel',
        'onpointerdown',
        'onpointerenter',
        'onpointerleave',
        'onpointermove',
        'onpointerout',
        'onpointerover',
        'onpointerup',
        'ontouchcancel',
        'ontouchend',
        'ontouchmove',
        'onwheel'
    ]);

    const listeners = new Map<string, MouseEventHandler<SVGElement>>();
    // attach event handlers
    for (const [eventName, eventHandler] of Object.entries(events)) {
        if (eventHandler) {
            const wrappedHandler = (origEvent: Event) => {
                const { scales, body, options } = getPlotState();
                if (origEvent instanceof MouseEvent || origEvent instanceof PointerEvent) {
                    let facetEl = origEvent.target as SVGElement;
                    while (facetEl && !facetEl.classList.contains('facet')) {
                        facetEl = facetEl.parentElement;
                    }
                    const facetRect = (facetEl?.firstChild ?? body).getBoundingClientRect();
                    const relativeX =
                        origEvent.clientX - facetRect.left + (options.marginLeft ?? 0);
                    const relativeY = origEvent.clientY - facetRect.top + (options.marginTop ?? 0);

                    if (scales.projection) {
                        const [x, y] = scales.projection.invert([relativeX, relativeY]);
                        origEvent.dataX = x;
                        origEvent.dataY = y;
                    } else {
                        origEvent.dataX = invertScale(scales.x, relativeX);
                        origEvent.dataY = invertScale(scales.y, relativeY);
                    }
                }

                eventHandler(
                    origEvent,
                    datum.hasOwnProperty(RAW_VALUE) ? datum[RAW_VALUE] : datum,
                    datum[INDEX]
                );
            };
            listeners.set(eventName, wrappedHandler);
            node.addEventListener(eventName.substring(2), wrappedHandler);
        }
    }
    if (events.onclick || events.onmousedown || events.onmouseup) {
        // force role button
        node.setAttribute('role', 'button');
    }
    return {
        destroy() {
            for (const [eventName, handler] of listeners.entries()) {
                node.removeEventListener(eventName.substring(2), handler);
            }
        }
    };
}

function invertScale(scale: PlotScale, position: number) {
    if (scale.type === 'band') {
        const range = scale.fn.range();
        const domain = scale.fn.domain();
        const eachBand = scale.fn.step();
        const extent = range[1] - range[0];
        const posInRange = ((position - range[0]) / extent) * Math.abs(extent);
        const index = Math.floor(posInRange / eachBand);
        return domain[index];
    }
    return scale.fn.invert ? scale.fn.invert(position) : undefined;
}
