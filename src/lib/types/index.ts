import type { Snippet } from 'svelte';
import type { Writable } from 'svelte/store';
import type { MarkerShape } from '../marks/helpers/Marker.svelte';
import type { Channels, ScaledChannelName } from './channel.js';
import type { DataRecord, DataRow, RawValue } from './data.js';
import type { BaseMarkProps } from './mark.js';

export type GenericMarkOptions = Record<string | symbol, any>;

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
};

export type ConstantAccessor<K, T = Record<string | symbol, RawValue>> =
    | K
    | ((d: T, index: number) => K)
    | null
    | undefined;

export type TransformArg<T> = Channels<T> & BaseMarkProps<T> & { data: T[] };
export type MapArg<T> = Channels<T> & { data: T[] };

export type TransformArgsRow<T extends RawValue | object> = Partial<Channels<T>> & { data: T[] };
export type TransformArgsRecord<T extends object> = Partial<Channels<T>> & { data: T[] };

export type TransformReturn<C extends TransformArg<T>, T> = C & Required<Pick<Channels<T>, 'data'>>;

export type AutoMarginStores = {
    autoMarginTop: Writable<Map<string, number>>;
    autoMarginLeft: Writable<Map<string, number>>;
    autoMarginRight: Writable<Map<string, number>>;
    autoMarginBottom: Writable<Map<string, number>>;
};

export type MapIndexObject = {
    mapIndex: (I: number[], S: RawValue[], T: RawValue[]) => void;
};

export type MapMethod =
    | 'cumsum'
    | 'rank'
    | 'quantile'
    | ((I: number[], S: number[]) => number[])
    | MapIndexObject;

export type MapOptions = Partial<Record<ScaledChannelName, MapMethod>>;

export type UsedScales = Record<ScaledChannelName, boolean>;

export * from './channel';
export * from './colorScheme';
export * from './data';
export * from './facet';
export * from './mark';
export * from './plot';
export * from './scale';
