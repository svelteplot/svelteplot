import isDataRecord from '$lib/helpers/isDataRecord.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type {
    ChannelAccessor,
    ScaledChannelName,
    DataRow,
    DataRecord,
    TransformArg,
    ChannelName
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
import { index, union, sum, groups as d3Groups } from 'd3-array';
import { groupFacetsAndZ } from 'svelteplot/helpers/group';

const GROUP = Symbol('group');
const FACET = Symbol('group');

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

function stackXY(
    byDim: 'x' | 'y',
    data: DataRow[],
    channels: Partial<Record<ScaledChannelName, ChannelAccessor>>,
    options: StackOptions
) {
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
        const resolvedData = data.map((d) => ({
            ...(isDataRecord(d) ? d : { __orig: d }),
            [`__${secondDim}`]: resolveChannel(secondDim, d, channels),
            [GROUP]: groupBy === true ? 'G' : resolveChannel(groupBy, d, channels),
            [FACET]:
                groupFacetsBy.length > 0
                    ? groupFacetsBy
                          .map((channel) => String(resolveChannel(channel, d, channels)))
                          .join('---')
                    : 'F',
            [`__${byDim}`]: resolveChannel(byDim, d, channels)
        })) as DataRecord[];

        // the final data ends up here
        const out = [];

        // first we group the dataset by facets to avoid stacking of rows that are
        // in separate panels
        const groups = d3Groups(resolvedData, (d) => d[FACET]);
        for (const [, facetData] of groups) {
            // now we index the data on the second dimension, e.g. over x
            // when stacking over y
            const indexed = index(
                facetData,
                (d) => d[`__${secondDim}`],
                (d) => d[GROUP]
            );

            const stackOrder = (series: number[][]) => {
                const f = STACK_ORDER[options.order || 'none'];
                return options.reverse ? f(series).reverse() : f(series);
            };

            // now stack the values for each index
            const series = stack()
                .order(stackOrder)
                .offset(STACK_OFFSET[options.offset])
                .keys(union(facetData.map((d) => d[GROUP]) as string[]))
                .value(([, group], key) => (group.get(key) ? group.get(key)[`__${byDim}`] : 0))(
                indexed
            );

            // and combine it all back into a flat array
            const newData = series
                .map((values) => {
                    const groupKey = values.key;
                    return values
                        .filter((d) => d.data[1].get(groupKey))
                        .map((d) => {
                            const datum = d.data[1].get(groupKey);
                            // cleanup our internal keys
                            delete datum[GROUP];
                            delete datum[FACET];
                            return { ...datum, [`__${byLow}`]: d[0], [`__${byHigh}`]: d[1] };
                        });
                })
                .flat(1);

            // which we then add to the output data
            out.push(newData);
        }

        return {
            data: out.flat(1),
            ...channels,
            [byDim]: undefined,
            ...(typeof channels[byDim] === 'string' && !channels[`__${byDim}_origField`]
                ? { [`__${byDim}_origField`]: channels[byDim] }
                : {}),
            ...{ [byLow]: `__${byLow}`, [byHigh]: `__${byHigh}` }
        };
    }
    return { data, ...channels };
}

export function stackY<T>({ data, ...channels }: T, opts: Partial<StackOptions> = {}): T {
    return stackXY('y', data, channels, applyDefaults(opts));
}

export function stackX(
    { data, ...channels }: TransformArg,
    opts: Partial<StackOptions> = {}
): TransformArg {
    return stackXY('x', data, channels, applyDefaults(opts));
}

function applyDefaults(opts: Partial<StackOptions>): StackOptions {
    if (opts.offset === 'wiggle' && opts.order === undefined) {
        return { ...DEFAULT_STACK_OPTIONS, order: 'inside-out', ...opts };
    }
    return { ...DEFAULT_STACK_OPTIONS, ...opts };
}

const X = Symbol('x'),
    X1 = Symbol('x1'),
    X2 = Symbol('x2');
const Y = Symbol('y'),
    Y1 = Symbol('y1'),
    Y2 = Symbol('y2');

export function stackMarimekko<T>(
    {
        data,
        x,
        y,
        value,
        ...rest
    }: {
        data: T[];
        x: ChannelAccessor<T>;
        y: ChannelAccessor<T>;
        value: ChannelAccessor<T>;
        fx?: ChannelAccessor<T>;
        fy?: ChannelAccessor<T>;
    },
    {
        x: xOpt,
        y: yOpt
    }: {
        x?: { percent?: boolean };
        y?: { percent?: boolean };
    } = {}
) {
    const out: T[] = [];

    groupFacetsAndZ(data, { ...rest }, (data) => {
        const total = sum(data, (d) => d[value]);
        let xPos = 0;

        const grouped = d3Groups(data, (d) => d[x]).flatMap(([k, items]) => {
            const groupValue = sum(items, (d) => d[value]);
            const x1 = xPos,
                x2 = xPos + groupValue;
            xPos = x2;

            let yPos = 0;
            return items.map((d) => {
                const y1 = yPos,
                    y2 = yPos + d[value];
                yPos = y2;

                const normX1 = xOpt?.percent ? x1 / total : x1;
                const normX2 = xOpt?.percent ? x2 / total : x2;
                const normY1 = yOpt?.percent ? y1 / groupValue : y1;
                const normY2 = yOpt?.percent ? y2 / groupValue : y2;

                return {
                    ...d,
                    [X1]: normX1,
                    [X2]: normX2,
                    [Y1]: normY1,
                    [Y2]: normY2,
                    [X]: (normX1 + normX2) / 2,
                    [Y]: (normY1 + normY2) / 2
                };
            });
        });

        out.push(...grouped);
    });

    return { ...rest, data: out, x: X, x1: X1, x2: X2, y: Y, y1: Y1, y2: Y2 };
}
