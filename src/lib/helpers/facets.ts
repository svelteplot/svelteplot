import type { GenericMarkOptions, Mark, RawValue } from '$lib/types/index.js';
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

// TODO: write unit tests
