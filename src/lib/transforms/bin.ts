import { resolveChannel } from '../helpers/resolve.js';
import type { ChannelName, DataRecord, RawValue } from '../types/index.js';
import type { TransformArg } from '../types/index.js';
import { maybeInterval } from '../helpers/autoTicks.js';
import {
    bin as d3Bin,
    extent,
    thresholdFreedmanDiaconis,
    thresholdScott,
    thresholdSturges,
    type ThresholdCountGenerator
} from 'd3-array';
import { reduceOutputs, type ReducerName } from '../helpers/reduce.js';
import { groupFacetsAndZ } from '../helpers/group.js';
import { isDate } from '../helpers/typeChecks.js';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants';

type NamedThresholdsGenerator = 'auto' | 'scott' | 'sturges' | 'freedman-diaconis';

type BinBaseOptions = {
    domain?: [number, number];
    thresholds?: NamedThresholdsGenerator | number | number[] | ThresholdCountGenerator;
    interval?: number | string;
    cumulative?: false | 1 | -1;
    reverse?: boolean;
};

type ReducerOption = ReducerName | ((group: DataRecord[]) => RawValue);

type AdditionalOutputChannels = Partial<{
    fill: ReducerOption;
    stroke: ReducerOption;
    r: ReducerOption;
    opacity: ReducerOption;
    fillOpacity: ReducerOption;
    strokeOpacity: ReducerOption;
}>;

const CHANNELS = {
    x: Symbol('x'),
    x1: Symbol('x1'),
    x2: Symbol('x2'),
    y: Symbol('y'),
    y1: Symbol('y1'),
    y2: Symbol('y2')
};

export type BinXOptions = BinBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        y: ReducerOption;
        y1: ReducerOption;
        y2: ReducerOption;
    }>;

export type BinYOptions = BinBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        x: ReducerOption;
        x1: ReducerOption;
        x2: ReducerOption;
    }>;

type BinOptions = BinBaseOptions & AdditionalOutputChannels;

const ThresholdGenerators: { [k in NamedThresholdsGenerator]: ThresholdCountGenerator } = {
    auto: thresholdScott,
    scott: thresholdScott,
    sturges: thresholdSturges,
    'freedman-diaconis': thresholdFreedmanDiaconis
};

function binBy<T extends DataRecord>(
    byDim: 'x' | 'y',
    { data, ...channels }: TransformArg<T>,
    options: BinOptions
) {
    const { domain, thresholds = 'auto', interval } = options;
    const bin = d3Bin<T, number>();
    if (domain) bin.domain(domain);
    if (interval) {
        const [lo, hi] = extent(data.map((d) => resolveChannel(byDim, d, channels) as number));
        bin.thresholds(
            (maybeInterval(interval) as { range: (lo: number, hi: number) => number[] }).range(
                lo!,
                hi!
            )
        );
    } else if (thresholds) {
        // use a generator
        const t =
            typeof thresholds === 'string' && ThresholdGenerators[thresholds] !== undefined
                ? ThresholdGenerators[thresholds]
                : thresholds;
        if (typeof t === 'number' || typeof t === 'function') {
            bin.thresholds(t as ThresholdCountGenerator);
        } else {
            bin.thresholds(t as number[]);
        }
    }

    // channels.x is the input
    bin.value((d) => resolveChannel(byDim, d, channels) as number);

    // y, y1, y2, fill, stroke, etc are outputs
    const outputs: ChannelName[] = [
        ...(byDim === 'x'
            ? (['y', 'y1', 'y2'] as ChannelName[])
            : (['x', 'x1', 'x2'] as ChannelName[])),
        'fill',
        'stroke',
        'r',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];

    let newChannels = {
        [byDim === 'x' ? 'insetLeft' : 'insetTop']: 0.5,
        [byDim === 'x' ? 'insetRight' : 'insetBottom']: 0.5,
        ...channels,
        [`${byDim}`]: CHANNELS[byDim], // `__${byDim}`,
        [`${byDim}1`]: CHANNELS[`${byDim}1`],
        [`${byDim}2`]: CHANNELS[`${byDim}2`],
        [ORIGINAL_NAME_KEYS[byDim]]: typeof channels[byDim] === 'string' ? channels[byDim] : null
    };

    const newData: DataRecord[] = [];

    let passedGroups: DataRecord[] = [];

    const bins = bin(data);

    (options.cumulative && options.cumulative < 0 ? bins.toReversed() : bins).forEach((group) => {
        const x0 = group.x0!;
        const x1 = group.x1!;
        const itemBinProps: DataRecord = {
            [CHANNELS[`${byDim}1`]]: x0,
            [CHANNELS[`${byDim}2`]]: x1,
            [CHANNELS[`${byDim}`]]: isDate(x0 as unknown as RawValue)
                ? new Date(
                      Math.round(
                          ((x0 as unknown as Date).getTime() + (x1 as unknown as Date).getTime()) *
                              0.5
                      )
                  )
                : (x0 + x1) * 0.5
        };
        if (options.cumulative) passedGroups = [...passedGroups, ...(group as DataRecord[])];

        const newGroupChannels = groupFacetsAndZ(
            options.cumulative ? passedGroups : (group as DataRecord[]),
            channels as never,
            (items, itemGroupProps) => {
                const item: DataRecord = { ...itemBinProps, ...itemGroupProps } as DataRecord;
                reduceOutputs(
                    item,
                    items as DataRecord[],
                    options as never,
                    outputs,
                    channels as never,
                    newChannels as never
                );
                newData.push(item);
            }
        );

        newChannels = { ...newChannels, ...newGroupChannels };
    });

    return { data: options.reverse ? newData.toReversed() : newData, ...newChannels };
}

/**
 * Bins on x. Also groups on y and the first channel of z, fill, or stroke, if any.
 *
 * @param param0
 * @param options
 */
export function binX<T extends DataRecord>(
    { data, ...channels }: TransformArg<T>,
    options: BinXOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<T> {
    return binBy('x', { data, ...channels }, options) as TransformArg<T>;
}

/**
 * Bins on y. Also groups on y and the first channel of z, fill, or stroke, if any.
 *
 * @param param0
 * @param options
 */
export function binY<T extends DataRecord>(
    { data, ...channels }: TransformArg<T>,
    options: BinYOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<T> {
    return binBy('y', { data, ...channels }, options) as TransformArg<T>;
}

/**
 * for binning in x and y dimension simultaneously
 */
export function bin<T extends DataRecord>(
    { data, ...channels }: TransformArg<T>,
    options: BinOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<T> {
    const { domain, thresholds = 'auto', interval, cumulative = false } = options;

    const binX = d3Bin<T, number>();
    const binY = d3Bin<T, number>();

    if (domain) {
        // this really doesn't make sense...
        binX.domain(domain);
        binY.domain(domain);
    }

    // channels.x is the input
    binX.value((d) => resolveChannel('x', d, channels) as number);
    binY.value((d) => resolveChannel('y', d, channels) as number);

    let yThresholds: number[] = [];

    if (interval) {
        const [xlo, xhi] = extent(data.map((d) => resolveChannel('x', d, channels) as number));
        const [ylo, yhi] = extent(data.map((d) => resolveChannel('y', d, channels) as number));
        const mi = maybeInterval(interval) as { range: (lo: number, hi: number) => number[] };
        binX.thresholds(mi.range(xlo!, xhi!));
        binY.thresholds((yThresholds = mi.range(ylo!, yhi!)));
    } else if (thresholds) {
        // when binning in x and y, we need to ensure we are using consistent thresholds
        const t =
            typeof thresholds === 'string' && ThresholdGenerators[thresholds] !== undefined
                ? ThresholdGenerators[thresholds]
                : thresholds;
        if (typeof t === 'number' || typeof t === 'function') {
            binX.thresholds(t as ThresholdCountGenerator);
            binY.thresholds(t as ThresholdCountGenerator);
        } else {
            binX.thresholds(t as number[]);
            binY.thresholds(t as number[]);
        }

        yThresholds = binY(data)
            .slice(1)
            .map((g) => g.x0 as number);

        binY.thresholds(yThresholds);
    }

    // y, y1, y2, fill, stroke, etc are outputs
    const outputs: ChannelName[] = [
        'fill',
        'stroke',
        'r',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];

    let newChannels = {
        inset: 0.5,
        ...channels,
        x: CHANNELS.x,
        x1: CHANNELS.x1,
        x2: CHANNELS.x2,
        y: CHANNELS.y,
        y1: CHANNELS.y1,
        y2: CHANNELS.y2,
        [ORIGINAL_NAME_KEYS.x]: typeof channels.x === 'string' ? channels.x : null,
        [ORIGINAL_NAME_KEYS.y]: typeof channels.y === 'string' ? channels.y : null
    };

    const groupBy = channels.z ? 'z' : channels.fill ? 'fill' : channels.stroke ? 'stroke' : true;
    const groupByPropName =
        groupBy !== true && typeof channels[groupBy] === 'string' ? channels[groupBy] : '__group';

    if (groupBy !== true) (newChannels as Record<string, unknown>)[groupBy] = groupByPropName;

    // consistent intervals

    const newData: DataRecord[] = [];
    binX(data).forEach((groupX) => {
        const gx0 = groupX.x0!;
        const gx1 = groupX.x1!;
        const newRecordBaseX = {
            [CHANNELS.x1]: gx0,
            [CHANNELS.x2]: gx1,
            [CHANNELS.x]: isDate(gx0 as unknown as RawValue)
                ? new Date(
                      Math.round(
                          ((gx0 as unknown as Date).getTime() +
                              (gx1 as unknown as Date).getTime()) *
                              0.5
                      )
                  )
                : (gx0 + gx1) * 0.5
        };

        const [ylo, yhi] = extent(groupX.map((d) => resolveChannel('y', d, channels) as number));

        const tExtentLo = yThresholds.filter((d) => d < (ylo as number)).at(-1);
        const tExtentHi = yThresholds.filter((d) => d > (yhi as number)).at(0);

        binY(groupX).forEach((groupY) => {
            if (groupY.length === 0) return;
            // The first bin.x0 is always equal to the minimum domain value,
            // and the last bin.x1 is always equal to the maximum domain value,
            // therefore we need to align with the thresholds
            const y1 = (groupY.x0 === ylo ? tExtentLo : groupY.x0) as number;
            const y2 = (groupY.x1 === yhi ? tExtentHi : groupY.x1) as number;
            const newRecordBaseY = {
                ...newRecordBaseX,
                [CHANNELS.y1]: y1,
                [CHANNELS.y2]: y2,
                [CHANNELS.y]: isDate(y1 as RawValue)
                    ? new Date(
                          Math.round(
                              ((y1 as unknown as Date).getTime() +
                                  (y2 as unknown as Date).getTime()) *
                                  0.5
                          )
                      )
                    : ((y1 as number) + (y2 as number)) * 0.5
            };

            const newGroupChannels = groupFacetsAndZ(
                groupY as DataRecord[],
                channels as never,
                (items, itemGroupProps) => {
                    const newRecord: DataRecord = {
                        ...newRecordBaseY,
                        ...itemGroupProps
                    } as DataRecord;
                    reduceOutputs(
                        newRecord,
                        items as DataRecord[],
                        options as never,
                        outputs,
                        channels as never,
                        newChannels as never
                    );
                    newData.push(newRecord);
                }
            );

            newChannels = { ...newChannels, ...newGroupChannels };
        });
    });

    return {
        data: options.reverse ? newData.toReversed() : newData,
        ...newChannels
    } as unknown as TransformArg<T>;
}
