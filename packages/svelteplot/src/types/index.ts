import type { Snippet } from 'svelte';
import type { Writable } from 'svelte/store';
import type { MarkerShape } from '../marks/helpers/Marker.svelte';
import type { Channels, ScaledChannelName } from './channel.js';
import type { RawValue } from './data.js';
import type { BaseMarkProps } from './mark.js';

/** a generic record type used when the specific mark options type is not known */
export type GenericMarkOptions = Record<string | symbol, any>;

/** the name of a d3 curve interpolation method */
export type CurveName =
    | 'basis'
    | 'basis-closed'
    | 'basis-open'
    | 'bundle'
    | 'bump-x'
    | 'bump-y'
    | 'cardinal'
    | 'cardinal-closed'
    | 'cardinal-open'
    | 'catmull-rom'
    | 'catmull-rom-closed'
    | 'catmull-rom-open'
    | 'linear'
    | 'linear-closed'
    | 'monotone-x'
    | 'monotone-y'
    | 'natural'
    | 'step'
    | 'step-after'
    | 'step-before';

export type MarkerOptions = {
    /**
     * the marker for the starting point of a line segment
     */
    markerStart?: boolean | MarkerShape | Snippet;
    /**
     * the marker for any intermediate point of a line segment
     */
    markerMid?: boolean | MarkerShape | Snippet;
    /**
     * the marker for the end point of a line segment
     */
    markerEnd?: boolean | MarkerShape | Snippet;
    /**
     * shorthand for setting the marker on all points
     */
    marker?: boolean | MarkerShape | Snippet;
    /**
     * scale factor for marker size, relative to the line stroke width
     */
    markerScale?: ConstantAccessor<number>;
};

/** a value that is either a constant or a function that computes a per-datum value */
type BivariantCallback<TArgs extends unknown[], TResult> = {
    bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

export type ConstantAccessor<K, T = Record<string | symbol, RawValue>> =
    | K
    | BivariantCallback<[d: T, index: number], K>
    | null
    | undefined;

/** the input argument to a data transform: data array plus channel mappings and mark props */
export type TransformArg<T> = Channels<T> & BaseMarkProps<T> & { data: T[] };
/** the input argument to a map transform: data array plus channel mappings */
export type MapArg<T> = Channels<T> & { data: T[] };

/** transform input for raw data rows (before recordization) */
export type TransformArgsRow<T extends RawValue | object> = Partial<Channels<T>> & { data: T[] };
/** transform input for data records (after recordization) */
export type TransformArgsRecord<T extends object> = Partial<Channels<T>> & { data: T[] };

/** the return type of a transform, ensuring data is always present */
export type TransformReturn<C extends TransformArg<T>, T> = C & Required<Pick<Channels<T>, 'data'>>;

/** writable stores used by marks to contribute to automatic margin computation */
export type AutoMarginStores = {
    /** per-mark contributions to the top margin */
    autoMarginTop: Writable<Map<string, number>>;
    /** per-mark contributions to the left margin */
    autoMarginLeft: Writable<Map<string, number>>;
    /** per-mark contributions to the right margin */
    autoMarginRight: Writable<Map<string, number>>;
    /** per-mark contributions to the bottom margin */
    autoMarginBottom: Writable<Map<string, number>>;
};

/** a function that maps source values (S) to target values (T) for the given indices (I) */
export type MapIndexFunction = (I: number[], S: RawValue[], T: RawValue[]) => void;

/** an object implementing the mapIndex interface for custom map transforms */
export type MapIndexObject = {
    /** the function that performs the index-based mapping */
    mapIndex: MapIndexFunction;
};

/** a named map method, a custom mapping function, or a MapIndexObject */
export type MapMethod =
    | 'cumsum'
    | 'rank'
    | 'quantile'
    | ((I: number[], S: number[]) => number[])
    | MapIndexObject;

/**
 * An object specifying mapping methods for one or more scaled channels
 * e.g. ```{ x: 'rank' }```
 */
export type MapOptions = Partial<Record<ScaledChannelName, MapMethod>>;

/** a record indicating which scaled channels are actively used by a mark */
export type UsedScales = Record<ScaledChannelName, boolean>;

export * from './channel';
export * from './axes';
export * from './colorScheme';
export * from './data';
export * from './facet';
export * from './mark';
export * from './plot';
export * from './scale';
export * from '../transforms/density';
export * from '../transforms/window';
export * from '../helpers/reduce';
