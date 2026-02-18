import { resolveChannel } from '../helpers/resolve.js';
import type { DataRecord, RawValue } from '../types/index.js';
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

function binBy(
    byDim: 'x' | 'y',
    { data, ...channels }: TransformArg<DataRecord>,
    options: BinOptions
) {
    const { domain, thresholds = 'auto', interval } = options;
    const bin = d3Bin<DataRecord, number>();
    if (domain) bin.domain(domain);
    if (interval) {
        const [lo, hi] = extent(
            data.map((d: DataRecord) => resolveChannel(byDim, d, channels) as number)
        );
        const iv = maybeInterval(interval);
        if (iv) bin.thresholds((iv as any).range(lo, hi));
    } else if (thresholds)
        bin.thresholds(
            // use a generator
            typeof thresholds === 'string' && ThresholdGenerators[thresholds] !== undefined
                ? ThresholdGenerators[thresholds]
                : (thresholds as any)
        );

    // channels.x is the input
    bin.value((d: DataRecord) => resolveChannel(byDim, d, channels) as number);

    // y, y1, y2, fill, stroke, etc are outputs
    const outputs = [
        ...(byDim === 'x' ? ['y', 'y1', 'y2'] : ['x', 'x1', 'x2']),
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

    (((options.cumulative ?? 0) as number) < 0 ? bins.toReversed() : bins).forEach((group) => {
        const x0 = group.x0;
        const x1 = group.x1;
        const itemBinProps: DataRecord = {
            [CHANNELS[`${byDim}1`]]: x0 as RawValue,
            [CHANNELS[`${byDim}2`]]: x1 as RawValue,
            [CHANNELS[`${byDim}`]]: isDate(x0 as RawValue)
                ? new Date(Math.round(((x0 as any).getTime() + (x1 as any).getTime()) * 0.5))
                : ((x0 ?? 0) + (x1 ?? 0)) * 0.5
        };
        if (options.cumulative) passedGroups = [...passedGroups, ...group];

        const newGroupChannels = groupFacetsAndZ(
            options.cumulative ? passedGroups : (group as DataRecord[]),
            channels,
            (items, itemGroupProps) => {
                const item = { ...itemBinProps, ...itemGroupProps } as DataRecord;
                reduceOutputs(
                    item,
                    items as DataRecord[],
                    options as any,
                    outputs as any,
                    channels as any,
                    newChannels as any
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
export function binX(
    { data, ...channels }: TransformArg<DataRecord>,
    options: BinXOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<DataRecord> {
    return binBy('x', { data, ...channels }, options);
}

/**
 * Bins on y. Also groups on y and the first channel of z, fill, or stroke, if any.
 *
 * @param param0
 * @param options
 */
export function binY(
    { data, ...channels }: TransformArg<DataRecord>,
    options: BinYOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<DataRecord> {
    return binBy('y', { data, ...channels }, options);
}

/**
 * for binning in x and y dimension simultaneously
 */
export function bin(
    { data, ...channels }: TransformArg<DataRecord>,
    options: BinOptions = { thresholds: 'auto', cumulative: false }
): TransformArg<DataRecord> {
    const { domain, thresholds = 'auto', interval, cumulative = false } = options;

    const binX = d3Bin<DataRecord, number>();
    const binY = d3Bin<DataRecord, number>();

    if (domain) {
        // this really doesn't make sense...
        binX.domain(domain);
        binY.domain(domain);
    }

    // channels.x is the input
    binX.value((d: DataRecord) => resolveChannel('x', d, channels) as number);
    binY.value((d: DataRecord) => resolveChannel('y', d, channels) as number);

    let yThresholds: number[] | Date[] = [];

    if (interval) {
        const [xlo, xhi] = extent(
            data.map((d: DataRecord) => resolveChannel('x', d, channels) as number)
        );
        const [ylo, yhi] = extent(
            data.map((d: DataRecord) => resolveChannel('y', d, channels) as number)
        );
        const ivl = maybeInterval(interval);
        if (ivl) {
            binX.thresholds((ivl as any).range(xlo, xhi));
            binY.thresholds((yThresholds = (ivl as any).range(ylo, yhi)));
        }
    } else if (thresholds) {
        // when binning in x and y, we need to ensure we are using consistent thresholds
        const t =
            typeof thresholds === 'string' && ThresholdGenerators[thresholds] !== undefined
                ? ThresholdGenerators[thresholds]
                : thresholds;

        binX.thresholds(t as any);
        binY.thresholds(t as any);

        yThresholds = binY(data)
            .slice(1)
            .map((g) => g.x0) as number[];

        binY.thresholds(yThresholds as any);
    }

    // y, y1, y2, fill, stroke, etc are outputs
    const outputs = ['fill', 'stroke', 'r', 'opacity', 'fillOpacity', 'strokeOpacity'];

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

    if (groupBy !== true) (newChannels as any)[groupBy] = groupByPropName;

    // consistent intervals

    const newData: DataRecord[] = [];
    binX(data).forEach((groupX) => {
        const gx0 = groupX.x0 as number | undefined;
        const gx1 = groupX.x1 as number | undefined;
        const newRecordBaseX: DataRecord = {
            [CHANNELS.x1]: gx0 as RawValue,
            [CHANNELS.x2]: gx1 as RawValue,
            [CHANNELS.x]: isDate(gx0 as RawValue)
                ? new Date(Math.round(((gx0 as any).getTime() + (gx1 as any).getTime()) * 0.5))
                : ((gx0 ?? 0) + (gx1 ?? 0)) * 0.5
        };

        const [ylo, yhi] = extent(
            groupX.map((d: DataRecord) => resolveChannel('y', d, channels) as number)
        );

        const tExtentLo =
            (yThresholds as number[]).filter((d) => d < (ylo as number)).at(-1) ?? ylo;
        const tExtentHi = (yThresholds as number[]).filter((d) => d > (yhi as number)).at(0) ?? yhi;

        binY(groupX).forEach((groupY, i) => {
            if (groupY.length === 0) return;
            // The first bin.x0 is always equal to the minimum domain value,
            // and the last bin.x1 is always equal to the maximum domain value,
            // therefore we need to align with the thresholds
            const y1 = groupY.x0 === ylo ? tExtentLo : groupY.x0;
            const y2 = groupY.x1 === yhi ? tExtentHi : groupY.x1;
            const newRecordBaseY: DataRecord = {
                ...newRecordBaseX,
                [CHANNELS.y1]: y1 as RawValue,
                [CHANNELS.y2]: y2 as RawValue,
                [CHANNELS.y]: isDate(y1 as RawValue)
                    ? new Date(Math.round(((y1 as any).getTime() + (y2 as any).getTime()) * 0.5))
                    : ((y1 ?? 0) + (y2 ?? 0)) * 0.5
            };

            const newGroupChannels = groupFacetsAndZ(
                groupY as DataRecord[],
                channels,
                (items, itemGroupProps) => {
                    const newRecord = {
                        ...newRecordBaseY,
                        ...itemGroupProps
                    } as DataRecord;
                    reduceOutputs(
                        newRecord,
                        items as DataRecord[],
                        options as any,
                        outputs as any,
                        channels as any,
                        newChannels as any
                    );
                    newData.push(newRecord);
                }
            );

            newChannels = { ...newChannels, ...newGroupChannels };
        });
    });

    return { data: options.reverse ? newData.toReversed() : newData, ...newChannels };
}
