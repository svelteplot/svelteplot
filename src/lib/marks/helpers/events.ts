import type { BaseMarkProps, DataRecord, PlotScale, PlotScales, PlotState } from '$lib/types.js';
import type { MouseEventHandler } from 'svelte/elements';
import { invert, pick } from 'es-toolkit';
import { RAW_VALUE } from '$lib/transforms/recordize.js';
import { INDEX } from '$lib/constants.js';

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
        'onmouseup',
        'onwheel',
        'ontouchcancel',
        'ontouchend',
        'ontouchmove'
    ]);

    const listeners = new Map<string, MouseEventHandler<SVGElement>>();
    // attach event handlers
    for (const [eventName, eventHandler] of Object.entries(events)) {
        if (eventHandler) {
            const wrappedHandler = (origEvent: Event) => {
                const { scales } = getPlotState();
                if (origEvent.layerX !== undefined) {
                    if (scales.projection) {
                        const [x, y] = scales.projection.invert([
                            origEvent.layerX,
                            origEvent.layerY
                        ]);
                        origEvent.dataX = x;
                        origEvent.dataY = y;
                    } else {
                        origEvent.dataX = invertScale(scales.x, origEvent.layerX);
                        origEvent.dataY = invertScale(scales.y, origEvent.layerY);
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
        // invert band scale since scaleBand doesn't have an invert function
        const eachBand = scale.fn.step();
        console.log({ eachBand, position });
        const index = Math.floor(position / eachBand);
        return scale.fn.domain()[index];
    }
    return scale.fn.invert ? scale.fn.invert(position) : undefined;
}
