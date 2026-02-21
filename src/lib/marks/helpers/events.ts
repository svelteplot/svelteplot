import type {
    BaseMarkProps,
    DataRecord,
    DataRow,
    PlotScale,
    PlotState
} from '../../types/index.js';
import { pick } from 'es-toolkit';
import { RAW_VALUE } from '../../transforms/recordize.js';
import { INDEX } from '../../constants.js';
import type { Attachment } from 'svelte/attachments';
import type { ScaleBand } from 'd3-scale';

type MouseEventHandler<T extends EventTarget = EventTarget> = (
    event: Event & { currentTarget: T },
    datum?: unknown,
    index?: number
) => void;

// Extend the MouseEvent type to include custom plot data properties
declare global {
    interface MouseEvent {
        readonly layerX: number;
        readonly layerY: number;
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

export function addEventHandlers<T extends DataRow>({
    options,
    datum,
    plot
}: {
    options: BaseMarkProps<T>;
    datum: DataRecord;
    plot: PlotState;
}): Attachment {
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

    return (node: Element) => {
        const listeners = new Map<string, MouseEventHandler<SVGElement>>();
        // attach event handlers
        for (const [eventName, eventHandler] of Object.entries(events)) {
            if (eventHandler) {
                const wrappedHandler = (origEvent: Event) => {
                    const { scales, body, options: plotOptions } = plot;
                    if (origEvent instanceof MouseEvent || origEvent instanceof PointerEvent) {
                        let facetEl = origEvent.target as SVGElement;
                        while (
                            facetEl &&
                            !facetEl.classList.contains('facet') &&
                            facetEl.parentElement
                        ) {
                            // ensure that parentElement is SVGElement
                            if (!(facetEl.parentElement instanceof SVGElement)) break;
                            facetEl = facetEl.parentElement;
                        }
                        const facetRect = (
                            facetEl?.firstElementChild ?? body
                        ).getBoundingClientRect();
                        const relativeX =
                            origEvent.clientX - facetRect.left + (plotOptions.marginLeft ?? 0);
                        const relativeY =
                            origEvent.clientY - facetRect.top + (plotOptions.marginTop ?? 0);

                        if (scales.projection) {
                            const [x, y] = (scales.projection as any).invert([
                                relativeX,
                                relativeY
                            ]);
                            origEvent.dataX = x;
                            origEvent.dataY = y;
                        } else {
                            origEvent.dataX = invertScale(scales.x, relativeX);
                            origEvent.dataY = invertScale(scales.y, relativeY);
                        }
                    }

                    (eventHandler as any)(
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

        return () => {
            for (const [eventName, handler] of listeners.entries()) {
                node.removeEventListener(eventName.substring(2), handler as EventListener);
            }
        };
    };
}

function invertScale(scale: PlotScale, position: number) {
    if (scale.type === 'band') {
        const bandScale = scale.fn as unknown as ScaleBand<string | number>;
        const range = bandScale.range();
        const domain = bandScale.domain();
        const eachBand = bandScale.step();
        const start = range[0] ?? 0;
        const end = range[1] ?? start;
        const extent = end - start;
        const posInRange = (position - start) * Math.sign(extent);
        const index = Math.floor(posInRange / eachBand);
        return domain[index];
    }
    const maybeInvert = scale.fn as { invert?: (value: number) => number | string | Date };
    return maybeInvert.invert ? maybeInvert.invert(position) : undefined;
}
