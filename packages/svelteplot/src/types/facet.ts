import type { ChannelAccessor, ChannelName, DataRecord, RawValue } from './index.js';

/** the state of a single facet panel within a faceted plot */
type FacetState = {
    /** the current horizontal facet value */
    fx: RawValue;
    /** the current vertical facet value */
    fy: RawValue;
    /**
     * True, if the facet is the leftmost in its row
     */
    left: boolean;
    /**
     * True, if the facet is the topmost in its column
     */
    top: boolean;
    /**
     * True, if the facet is the rightmost in its row
     */
    right: boolean;
    /**
     * True, if the facet is the bottommost in its column
     */
    bottom: boolean;
    /**
     * True, if the adjacent facet to the top is empty
     */
    topEmpty: boolean;
    /**
     * True, if the adjacent facet to the bottom is empty
     */
    bottomEmpty: boolean;
    /**
     * True, if the adjacent facet to the left is empty
     */
    leftEmpty: boolean;
    /**
     * True, if the adjacent facet to the right is empty
     */
    rightEmpty: boolean;
};

/**
 * Test if the given data record is visible in the current facet.
 */
type TestFacetFunction = (
    datum: DataRecord<any>,
    channels: Record<ChannelName, ChannelAccessor>
) => boolean;

/** context provided to marks for facet-aware filtering and state access */
export type FacetContext = {
    /**
     * Returns a stateful function that tests whether a specific data
     * record is visible in the current facet or not.
     */
    getTestFacet: () => TestFacetFunction;
    /** returns the current facet panel state (position, edge flags) */
    getFacetState: () => FacetState;
};
