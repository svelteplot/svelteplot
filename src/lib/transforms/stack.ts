import isDataRecord from '../helpers/isDataRecord.js';
import { resolveChannel, resolveProp } from '../helpers/resolve.js';
import type {
    ChannelAccessor,
    DataRecord,
    TransformArg,
    ChannelName,
    Channels
} from '../types/index.js';
import {
    stack,
    stackOffsetExpand,
    stackOffsetSilhouette,
    stackOffsetWiggle,
    stackOrderAppearance,
    stackOrderAscending,
    stackOrderInsideOut,
    stackOrderNone,
    stackOffsetDiverging
} from 'd3-shape';
import { sum, groups as d3Groups, min, range } from 'd3-array';
import { groupFacetsAndZ } from 'svelteplot/helpers/group';
import { filter } from './filter.js';
import { sort } from './sort.js';
import { INDEX, ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';
import { indexData, RAW_VALUE } from './recordize.js';

const S = {
    x: Symbol('x'),
    x1: Symbol('x1'),
    x2: Symbol('x2'),
    y: Symbol('y'),
    y1: Symbol('y1'),
    y2: Symbol('y2')
} as const;

const GROUP = Symbol('group');
const FACET = Symbol('facet');

const DEFAULT_STACK_OPTIONS: StackOptions = {
    order: null,
    offset: null,
    reverse: false
};

/** the order in which series are stacked */
export type StackOrder = 'none' | 'appearance' | 'inside-out' | 'sum';
/** the offset method used to position stacked values */
export type StackOffset = 'none' | 'wiggle' | 'center' | 'normalize' | 'diverging';

/** options for the stack transform, or false to disable stacking */
export type StackOptions =
    | {
          /** the offset method, or null for the default (zero baseline) */
          offset: null | StackOffset;
          /** the stack order, or null for the default (input order) */
          order: null | StackOrder;
          /** if true, reverse the stack order */
          reverse: boolean;
      }
    | false;

const STACK_ORDER: Record<StackOrder, (...args: any[]) => any> = {
    // null
    // TODO: value: ,
    none: stackOrderNone,
    sum: stackOrderAscending,
    appearance: stackOrderAppearance,
    'inside-out': stackOrderInsideOut
};

const STACK_OFFSET: Record<StackOffset, ((...args: any[]) => any) | null> = {
    none: null,
    diverging: stackOffsetDiverging,
    wiggle: stackOffsetWiggle,
    center: stackOffsetSilhouette,
    normalize: stackOffsetExpand
};

function stackXY<T>(
    byDim: 'x' | 'y',
    data: T[],
    channels: Channels<T>,
    options: StackOptions
): TransformArg<T> {
    if (options === false) {
        // no stacking
        return { data, ...channels };
    }
    // we need to stack the data for each facet separately
    const groupFacetsBy = [
        channels.fx != null ? 'fx' : null,
        channels.fy != null ? 'fy' : null
    ].filter((d) => d !== null) as ChannelName[];

    const groupBy = channels.z ? 'z' : channels.fill ? 'fill' : channels.stroke ? 'stroke' : true;
    const secondDim =
        byDim === 'x' ? (channels.y1 != null ? 'y1' : 'y') : channels.x1 != null ? 'x1' : 'x';

    const byLow: 'x1' | 'y1' = `${byDim}1`;
    const byHigh: 'x2' | 'y2' = `${byDim}2`;

    if (
        channels[byDim] != null &&
        channels[`${byLow}`] === undefined &&
        channels[`${byHigh}`] === undefined
    ) {
        // resolve all channels for easier computation below
        const resolvedData = indexData(data as object[]).map((d) => ({
            ...(isDataRecord(d) ? d : { [RAW_VALUE]: d }),
            [S[secondDim]]: resolveChannel(secondDim, d as any, channels),
            [GROUP]: groupBy === true ? 'G' : resolveChannel(groupBy, d as any, channels),
            [FACET]:
                groupFacetsBy.length > 0
                    ? groupFacetsBy
                          .map((channel) => String(resolveChannel(channel, d as any, channels)))
                          .join('---')
                    : 'F',
            [S[byDim]]: resolveChannel(byDim, d as any, channels)
        })) as DataRecord[];

        // the final data ends up here
        const out: DataRecord[] = [];

        // first we group the dataset by facets to avoid stacking of rows that are
        // in separate panels
        const groups = d3Groups(resolvedData, (d) => d[FACET]);

        for (const [, facetData] of groups) {
            // create a temporary dataset for stacking
            // If we have a grouping channel (fill/stroke/z), build objects keyed by group value
            // so that series identities remain consistent across the secondary dimension.
            // This is required for offsets like 'wiggle' and 'inside-out'.
            let keys: any[];

            const groupedBySecondDim = d3Groups(facetData, (d) => d[S[secondDim]]);
            // .sort((a, b) =>
            //     xOrder[a[0]] - xOrder[b[0]]
            // );
            let stackData: any[];

            const hasUniqueGroups =
                groupBy !== true &&
                groupedBySecondDim.every(([, items]) => {
                    const groupSet = new Set(items.map((d) => d[GROUP]));
                    return groupSet.size === items.length;
                });

            if (groupBy === true || !hasUniqueGroups) {
                // Unit stacking: map each secondary-dimension bucket to an array of values.
                // Series are positional (0..N-1) within each bucket.
                let maxKeys = 0;
                stackData = groupedBySecondDim.map(([_k, items]) => {
                    const values = items
                        // keep original order within bucket; no stable series identity across buckets
                        .map((d) => ({ i: d[INDEX], v: d[S[byDim]] }));
                    if (values.length > maxKeys) maxKeys = values.length;
                    return values;
                });
                keys = range(maxKeys);
            } else {
                // Grouped stacking: keep consistent series identities using the group key
                const keySet = new Set<any>(facetData.map((d) => d[GROUP]));
                stackData = groupedBySecondDim.map(([_k, items]) => {
                    const obj: Record<string | number, { i: number; v: number }> = {};
                    items.forEach((d) => {
                        const key = d[GROUP] as any;
                        // If duplicates exist for the same (secondDim, group) pair, sum values
                        // and keep the latest index for back-reference.
                        if (obj[key] == null) obj[key] = { i: d[INDEX], v: d[S[byDim]] } as any;
                        else
                            obj[key] = {
                                i: d[INDEX],
                                v: obj[key].v + (d[S[byDim]] as number)
                            } as any;
                    });
                    return obj;
                });
                keys = Array.from(keySet);
            }

            const stackOrder = (series: any[]) => {
                const f = STACK_ORDER[options.order || 'none'];
                return options.reverse ? f(series).reverse() : f(series);
            };

            // now stack the values for each index
            const series = stack()
                .order(stackOrder as any)
                // Wiggle requires consistent series identities; fall back to 'center' for unit stacking
                .offset(
                    (groupBy === true && options.offset === 'wiggle'
                        ? STACK_OFFSET['center']
                        : STACK_OFFSET[options.offset ?? 'none']) as any
                )
                .keys(keys)
                .value((d: any, key: any, _i: any, _data: any) => {
                    return d[key]?.v == null ? undefined : d[key]?.v;
                })(stackData);

            // and combine it all back into a flat array
            const newData = (series as any)
                .flatMap((s: any) => s.map((d: any) => [d[0], d[1], d.data[s.key]?.i]))
                .filter((d: any) => d[2] !== undefined)
                .map((d: any) => ({ [S[byLow]]: d[0], [S[byHigh]]: d[1], ...resolvedData[d[2]] }));

            out.push(...newData);

            // which we then add to the output data
            // out.push(...newData);
        }

        return {
            data: out.sort((a, b) => (a[INDEX] as number) - (b[INDEX] as number)),
            ...channels,
            [byDim]: undefined,
            ...(typeof channels[byDim] === 'string' && !channels[ORIGINAL_NAME_KEYS[byDim] as any]
                ? { [ORIGINAL_NAME_KEYS[byDim]]: channels[byDim] }
                : {}),
            [byLow]: S[byLow],
            [byHigh]: S[byHigh]
        } as TransformArg<T>;
    }
    return { data, ...channels };
}

/**
 * stacks data along the y dimension, producing y1 and y2 channels
 */
export function stackY<T>(
    { data, ...channels }: TransformArg<T>,
    opts: Partial<StackOptions> = {}
): TransformArg<T> {
    return stackXY('y', data, channels, applyDefaults(opts));
}

/**
 * stacks data along the x dimension, producing x1 and x2 channels
 */
export function stackX<T>(
    { data, ...channels }: TransformArg<T>,
    opts: Partial<StackOptions> = {}
): TransformArg<T> {
    return stackXY('x', data, channels, applyDefaults(opts));
}

function applyDefaults(opts: Partial<StackOptions>): StackOptions {
    if (opts === false) return false;
    if (typeof opts === 'object' && opts.offset === 'wiggle' && opts.order === undefined) {
        return { ...DEFAULT_STACK_OPTIONS, order: 'inside-out', ...opts } as StackOptions;
    }
    return { ...DEFAULT_STACK_OPTIONS, ...opts } as StackOptions;
}

function stackMosaic<T>(
    {
        data,
        x,
        y,
        value,
        fx,
        fy,
        ...rest
    }: {
        data: T[];
        x: ChannelAccessor<T>;
        y: ChannelAccessor<T>;
        value: ChannelAccessor<T>;
        fx?: ChannelAccessor<T>;
        fy?: ChannelAccessor<T>;
    } & Channels<T>,
    { outer, inner }: { outer: 'x' | 'y'; inner: 'x' | 'y' },
    {
        x: xOpt,
        y: yOpt
    }: {
        x?: { percent?: boolean };
        y?: { percent?: boolean };
    } = {}
) {
    const out: T[] = [];
    const { data: filtered, ...restArgs } = sort(filter({ data, x, y, value, fx, fy, ...rest }));

    if (!filtered) throw new Error('stackMosaic: missing data');
    if (!x) throw new Error('stackMosaic: missing x channel');
    if (!y) throw new Error('stackMosaic: missing y channel');
    if (!value) throw new Error('stackMosaic: missing value channel');
    if ((min(filtered as any, (d: any) => resolveProp((d as any)[value as any], d)) as any) < 0)
        throw new Error('stackMosaic: negative values not supported');

    groupFacetsAndZ<T>(filtered as T[], restArgs as any, (data) => {
        const total = sum(data, (d: any) => resolveProp((d as any)[value as any], d));
        let outerPos = 0;

        const outerChannel = outer === 'x' ? x : y;
        const innerChannel = inner === 'x' ? x : y;
        const outerSym1 = outer === 'x' ? S.x1 : S.y1;
        const outerSym2 = outer === 'x' ? S.x2 : S.y2;
        const innerSym1 = inner === 'x' ? S.x1 : S.y1;
        const innerSym2 = inner === 'x' ? S.x2 : S.y2;
        const outerOpt = outer === 'x' ? xOpt : yOpt;
        const innerOpt = inner === 'x' ? xOpt : yOpt;

        const grouped = d3Groups(data, (d: any) => resolveProp((d as any)[outerChannel as any], d));
        const innerOrder = new Map(
            grouped[0][1].map((d: any, i: number) => [(d as any)[innerChannel as any], i])
        );

        grouped.forEach(([_k, items], i) => {
            const groupValue = sum(items, (d: any) => resolveProp((d as any)[value as any], d));
            const o1 = outerPos,
                o2 = outerPos + groupValue;
            outerPos = o2;

            let innerPos = 0;
            (i
                ? items.sort(
                      (a: any, b: any) =>
                          (innerOrder.get((a as any)[innerChannel as any]) ?? 0) -
                          (innerOrder.get((b as any)[innerChannel as any]) ?? 0)
                  )
                : items
            ).forEach((d: any) => {
                const iv = resolveProp((d as any)[value as any], d) as number;
                const i1 = innerPos,
                    i2 = innerPos + iv;
                innerPos = i2;

                const normO1 = outerOpt?.percent ? o1 / total : o1;
                const normO2 = outerOpt?.percent ? o2 / total : o2;
                const normI1 = innerOpt?.percent ? i1 / groupValue : i1;
                const normI2 = innerOpt?.percent ? i2 / groupValue : i2;

                const result: any = { ...d };
                result[outerSym1] = normO1;
                result[outerSym2] = normO2;
                result[innerSym1] = normI1;
                result[innerSym2] = normI2;
                result[S.x] = (result[S.x1] + result[S.x2]) / 2;
                result[S.y] = (result[S.y1] + result[S.y2]) / 2;
                out.push(result);
            });
        });
    });

    return {
        ...rest,
        fx,
        fy,
        data: out,
        x: S.x,
        x1: S.x1,
        x2: S.x2,
        y: S.y,
        y1: S.y1,
        y2: S.y2
    };
}

/**
 * creates a mosaic layout with the outer (width) dimension along x and
 * the inner (height) dimension along y
 */
export function stackMosaicX<T>(
    args: Parameters<typeof stackMosaic<T>>[0],
    opts?: Parameters<typeof stackMosaic<T>>[2]
) {
    return stackMosaic(args, { outer: 'x', inner: 'y' }, opts);
}

/**
 * creates a mosaic layout with the outer (height) dimension along y and
 * the inner (width) dimension along x
 */
export function stackMosaicY<T>(
    args: Parameters<typeof stackMosaic<T>>[0],
    opts?: Parameters<typeof stackMosaic<T>>[2]
) {
    return stackMosaic(args, { outer: 'y', inner: 'x' }, opts);
}
