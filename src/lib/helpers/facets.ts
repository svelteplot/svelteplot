import type { GenericMarkOptions, Mark, PlotState, RawValue } from '../types/index.js';
import { resolveChannel } from './resolve.js';

/**
 * This function tracks which facets are "empty", meaning that they don't contain
 * any "facetted" data points. This can happen when fx and fy are combined and
 * certain combinations don't yield results.
 *
 * @param marks
 * @param fxValues x facet domain
 * @param fyValues y facet domain
 * @returns
 */
export function getEmptyFacets(
    marks: Mark<GenericMarkOptions>[],
    fxValues: RawValue[],
    fyValues: RawValue[]
) {
    const facettedMarks = marks.filter((mark) => {
        return (
            mark.options.__firstFacet &&
            mark.data.length > 0 && // has data
            !mark.options.automatic && // not an automatic mark
            (fxValues.length === 1 || mark.options.fx != null) && // uses x faceting
            (fyValues.length === 1 || mark.options.fy != null) // uses y faceting
        );
    });
    const facettedData = facettedMarks
        .map((mark) =>
            mark.data.map((datum) => {
                const fx = resolveChannel('fx', datum, mark.options);
                const fy = resolveChannel('fy', datum, mark.options);
                return {
                    fx,
                    fy
                };
            })
        )
        .flat(1);

    const out = new Map<RawValue, Map<RawValue, boolean>>();
    for (const fx of fxValues) {
        out.set(fx, new Map<RawValue, boolean>());
        for (const fy of fyValues) {
            // we need to loop over all facetted marks to see if there's any which has
            // no data for the current fx,fy combination
            let hasFacettedData = fxValues.length === 1 || fyValues.length === 1;
            for (const datum of facettedData) {
                if (datum.fx === fx && datum.fy === fy) {
                    hasFacettedData = true;
                    break;
                }
            }
            out.get(fx)?.set(fy, !hasFacettedData);
        }
    }
    return out;
}

/**
 * Stable string key for a (fxValue, fyValue) pair, used as Map keys
 * for the keyed tree map in Pointer/HTMLTooltip.
 */
export function facetKey(fxValue: RawValue | boolean, fyValue: RawValue | boolean): string {
    return JSON.stringify([fxValue, fyValue]);
}

/**
 * Inverts a d3 band scale: given a pixel position, returns the domain value
 * whose band contains that position, or undefined if outside all bands.
 *
 * d3.scaleBand has no .invert(), so we iterate the domain (O(n), n = facet count,
 * typically <20).
 */
export function invertBand(
    scale: { (value: string): number | undefined; bandwidth(): number },
    domain: readonly (string | RawValue)[],
    pixelPos: number
): RawValue | undefined {
    const bw = scale.bandwidth();
    for (const value of domain) {
        const start = scale(value as string);
        if (start != null && pixelPos >= start && pixelPos < start + bw) {
            return value as RawValue;
        }
    }
    return undefined;
}

/**
 * Walk up the DOM from `target` to find the nearest `g.facet` element.
 * Returns the facet x/y indices from `data-facet-x` and `data-facet-y`
 * attributes, or null if no facet element is found.
 */
export function findFacetFromDOM(
    target: Element | null
): { fxIndex: number; fyIndex: number } | null {
    let el = target;
    while (el) {
        if (el.classList?.contains('facet')) {
            const fxIndex = parseInt((el as HTMLElement).dataset?.facetX ?? '0', 10);
            const fyIndex = parseInt((el as HTMLElement).dataset?.facetY ?? '0', 10);
            return { fxIndex, fyIndex };
        }
        el = el.parentElement;
    }
    return null;
}

/**
 * Detect which facet the mouse event is in and compute the pixel offset.
 *
 * Strategy: try DOM walk first (fast, reliable when the event target is inside
 * a facet `<g>`). Fall back to inverting the fx/fy band scales from the mouse
 * position (works in jsdom where getBoundingClientRect returns zeros).
 *
 * Returns { fxValue, fyValue, offsetX, offsetY } where offset is the pixel
 * translation of the facet from the plot body origin.
 */
export function detectFacet(
    evt: MouseEvent,
    plot: PlotState
): { fxValue: RawValue | boolean; fyValue: RawValue | boolean; offsetX: number; offsetY: number } {
    const fxScale = plot.scales.fx;
    const fyScale = plot.scales.fy;
    const fxDomain = fxScale.domain;
    const fyDomain = fyScale.domain;
    const hasFx = fxDomain.length > 0;
    const hasFy = fyDomain.length > 0;

    // Try DOM walk
    const facetInfo = findFacetFromDOM(evt.target as Element);
    if (facetInfo) {
        const fxValue = hasFx ? fxDomain[facetInfo.fxIndex] : true;
        const fyValue = hasFy ? fyDomain[facetInfo.fyIndex] : true;
        return {
            fxValue,
            fyValue,
            offsetX: hasFx ? (fxScale.fn(fxValue) ?? 0) : 0,
            offsetY: hasFy ? (fyScale.fn(fyValue) ?? 0) : 0
        };
    }

    // Fallback: invert mouse position against band scales
    const bodyRect = plot.body.getBoundingClientRect();
    const svgX = evt.clientX - bodyRect.left;
    const svgY = evt.clientY - bodyRect.top;
    const fxValue = hasFx ? (invertBand(fxScale.fn as any, fxDomain, svgX) ?? fxDomain[0]) : true;
    const fyValue = hasFy ? (invertBand(fyScale.fn as any, fyDomain, svgY) ?? fyDomain[0]) : true;
    return {
        fxValue,
        fyValue,
        offsetX: hasFx ? (fxScale.fn(fxValue) ?? 0) : 0,
        offsetY: hasFy ? (fyScale.fn(fyValue) ?? 0) : 0
    };
}
