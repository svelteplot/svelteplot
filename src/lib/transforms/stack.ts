import isDataRecord from '$lib/helpers/isDataRecord.js';
import { resolveChannel, resolveProp } from '$lib/helpers/resolve.js';
import type {
    ChannelAccessor,
    DataRecord,
    TransformArg,
    ChannelName,
    Channels
} from '$lib/types/index.js';
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
import { INDEX } from 'svelteplot/constants.js';
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

export type StackOrder = 'none' | 'appearance' | 'inside-out' | 'sum';
export type StackOffset = 'none' | 'wiggle' | 'center' | 'normalize' | 'diverging';

export type StackOptions = {
    offset: null | StackOffset;
    order: null | StackOrder;
    reverse: boolean;
};

const STACK_ORDER: Record<StackOrder, Function> = {
    // null
    // TODO: value: ,
    none: stackOrderNone,
    sum: stackOrderAscending,
    appearance: stackOrderAppearance,
    'inside-out': stackOrderInsideOut
};

const STACK_OFFSET: Record<StackOffset, Function | null> = {
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
        const resolvedData = indexData(data).map((d, i) => ({
            ...(isDataRecord(d) ? d : { [RAW_VALUE]: d }),
            [S[secondDim]]: resolveChannel(secondDim, d, channels),
            [GROUP]: groupBy === true ? 'G' : resolveChannel(groupBy, d, channels),
            [FACET]:
                groupFacetsBy.length > 0
                    ? groupFacetsBy
                          .map((channel) => String(resolveChannel(channel, d, channels)))
                          .join('---')
                    : 'F',
            [S[byDim]]: resolveChannel(byDim, d, channels)
        })) as DataRecord[];

        // the final data ends up here
        const out = [];

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
                stackData = groupedBySecondDim.map(([k, items]) => {
                    const values = items
                        // keep original order within bucket; no stable series identity across buckets
                        .map((d) => ({ i: d[INDEX], v: d[S[byDim]] }));
                    if (values.length > maxKeys) maxKeys = values.length;
                    return values;
                });
                keys = range(maxKeys);
            } else {
                // Grouped stacking: keep consistent series identities using the group key
                const keySet = new Set<any>();
                stackData = groupedBySecondDim.map(([k, items]) => {
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
                        keySet.add(key);
                    });
                    return obj;
                });
                keys = Array.from(keySet);
            }

            const stackOrder = (series: number[][]) => {
                const f = STACK_ORDER[options.order || 'none'];
                return options.reverse ? f(series).reverse() : f(series);
            };

            // now stack the values for each index
            const series = stack()
                .order(stackOrder)
                // Wiggle requires consistent series identities; fall back to 'center' for unit stacking
                .offset(
                    groupBy === true && options.offset === 'wiggle'
                        ? STACK_OFFSET['center']
                        : STACK_OFFSET[options.offset]
                )
                .keys(keys)
                .value((d, key, i, data) => {
                    return d[key]?.v;
                })(stackData);

            // and combine it all back into a flat array
            const newData = series
                .flatMap((s) => s.map((d) => [d[0], d[1], d.data[s.key]?.i]))
                .filter((d) => d[2] !== undefined)
                .map((d) => ({ [S[byLow]]: d[0], [S[byHigh]]: d[1], ...resolvedData[d[2]] }));

            out.push(...newData);

            // which we then add to the output data
            // out.push(...newData);
        }

        return {
            data: out,
            ...channels,
            [byDim]: undefined,
            ...(typeof channels[byDim] === 'string' && !channels[`__${byDim}_origField`]
                ? { [`__${byDim}_origField`]: channels[byDim] }
                : {}),
            ...{ [byLow]: S[byLow], [byHigh]: S[byHigh] }
        };
    }
    return { data, ...channels };
}

export function stackY<T>(
    { data, ...channels }: TransformArg<T>,
    opts: Partial<StackOptions> = {}
): TransformArg<T> {
    return stackXY('y', data, channels, applyDefaults(opts));
}

export function stackX<T>(
    { data, ...channels }: TransformArg<T>,
    opts: Partial<StackOptions> = {}
): TransformArg<T> {
    return stackXY('x', data, channels, applyDefaults(opts));
}

function applyDefaults(opts: Partial<StackOptions>): StackOptions {
    if (opts.offset === 'wiggle' && opts.order === undefined) {
        return { ...DEFAULT_STACK_OPTIONS, order: 'inside-out', ...opts };
    }
    return { ...DEFAULT_STACK_OPTIONS, ...opts };
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
    if (min(filtered, (d) => resolveProp(d[value], d)) < 0)
        throw new Error('stackMosaic: negative values not supported');

    groupFacetsAndZ<T>(filtered, restArgs, (data) => {
        const total = sum(data, (d) => resolveProp(d[value], d));
        let outerPos = 0;

        const outerChannel = outer === 'x' ? x : y;
        const innerChannel = inner === 'x' ? x : y;
        const outerSym1 = outer === 'x' ? S.x1 : S.y1;
        const outerSym2 = outer === 'x' ? S.x2 : S.y2;
        const innerSym1 = inner === 'x' ? S.x1 : S.y1;
        const innerSym2 = inner === 'x' ? S.x2 : S.y2;
        const outerOpt = outer === 'x' ? xOpt : yOpt;
        const innerOpt = inner === 'x' ? xOpt : yOpt;

        const grouped = d3Groups(data, (d) => resolveProp(d[outerChannel], d));
        const innerOrder = new Map(grouped[0][1].map((d, i) => [d[innerChannel], i]));

        grouped.forEach(([k, items], i) => {
            const groupValue = sum(items, (d) => resolveProp(d[value], d));
            const o1 = outerPos,
                o2 = outerPos + groupValue;
            outerPos = o2;

            let innerPos = 0;
            (i
                ? items.sort(
                      (a, b) => innerOrder.get(a[innerChannel]) - innerOrder.get(b[innerChannel])
                  )
                : items
            ).forEach((d) => {
                const iv = resolveProp(d[value], d);
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

export function stackMosaicX<T>(args, opts) {
    return stackMosaic(args, { outer: 'x', inner: 'y' }, opts);
}

export function stackMosaicY<T>(args, opts) {
    return stackMosaic(args, { outer: 'y', inner: 'x' }, opts);
}
