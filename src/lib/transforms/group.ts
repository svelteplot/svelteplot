import { groupFacetsAndZ } from '../helpers/group.js';
import { isValid, testFilter } from '../helpers/index.js';
import { reduceOutputs, type ReducerName } from '../helpers/reduce.js';
import { resolveChannel } from '../helpers/resolve.js';
import type { ChannelName, DataRecord, DataRow, RawValue, TransformArg } from '../types/index.js';
import { groups as d3Groups, type ThresholdCountGenerator } from 'd3-array';
import { omit } from '../helpers/index.js';
import { maybeInterval } from '../helpers/autoTicks.js';

type NamedThresholdsGenerator = 'auto' | 'scott' | 'sturges' | 'freedman-diaconis';

type ReducerFunc = (group: DataRow[]) => RawValue;
type ReducerOption = ReducerName | ReducerFunc;

type GroupBaseOptions = {
    domain?: [number, number];
    thresholds?: NamedThresholdsGenerator | number | number[] | ThresholdCountGenerator;
    interval?: number | string;
    cumulative?: false | 1 | -1;
    reverse?: boolean;
    /**
     * copy properties from the first element of each group
     */
    copy?: string[];
};

type AdditionalOutputChannels = Partial<{
    fill: ReducerOption;
    stroke: ReducerOption;
    r: ReducerOption;
    opacity: ReducerOption;
    fillOpacity: ReducerOption;
    strokeOpacity: ReducerOption;
}>;

type GroupXOptions = GroupBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        y: ReducerOption;
        y1: ReducerOption;
        y2: ReducerOption;
        xPropName: string;
    }>;

type GroupYOptions = GroupBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        x: ReducerOption;
        x1: ReducerOption;
        x2: ReducerOption;
        yPropName: string;
    }>;

type GroupZOptions = GroupXOptions | GroupYOptions;

/**
 * groups the dataset by x and y channel and optionally reduces the group items
 * to output channels fill, stroke, r, opacity, fillOpacity, or strokeOpacity
 */
export function group<T extends DataRecord>(
    { data, ...channels }: TransformArg<T>,
    options: GroupXOptions = {}
) {
    if (channels.x == null || channels.y == null)
        throw new Error('you must provide an x and y channel to group on');
    // group by x or y
    const groups = d3Groups(
        data.filter((d) => testFilter(d, channels)),
        (d) => resolveChannel('x', d, channels),
        (d) => resolveChannel('y', d, channels)
    );
    const newData: DataRecord[] = [];
    const xChannel = typeof channels.x === 'string' ? channels.x : '__x';
    const yChannel = typeof channels.y === 'string' ? channels.y : '__y';
    let newChannels = omit({ ...channels, x: xChannel, y: yChannel }, 'filter');

    const outputs: ChannelName[] = [
        'fill',
        'stroke',
        'r',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];

    groups.forEach(([xGroupKey, xGroups]) => {
        xGroups.forEach(([yGroupKey, items]) => {
            const baseRecord = { [xChannel]: xGroupKey, [yChannel]: yGroupKey }; // dim === 'z' ? {} : { [`__${dim}`]: groupKey };
            // copy properties from first item of each group
            options.copy?.forEach((prop: string) => {
                baseRecord[prop] = (items[0] as DataRecord)[prop];
            });
            const newGroupChannels = groupFacetsAndZ(items, channels, (items, itemGroupProps) => {
                const item: DataRecord = { ...baseRecord, ...itemGroupProps } as DataRecord;
                reduceOutputs(item, items, options as never, outputs, channels, newChannels);
                newData.push(item);
            });
            newChannels = { ...newChannels, ...newGroupChannels };
        });
    });
    return { data: newData, ...newChannels };
}

/**
 * groups the dataset by the x channel and optionally reduces the group items
 * to output channels y, y1, y2, fill, stroke, r, opacity, fillOpacity, or strokeOpacity
 */
export function groupX<T extends DataRecord>(input: TransformArg<T>, options: GroupXOptions = {}) {
    return groupXYZ('x', input, options);
}

/**
 * groups the dataset by the y channel and optionally reduces the group items
 * to output channels x, x1, x2, fill, stroke, r, opacity, fillOpacity, or strokeOpacity
 */
export function groupY<T extends DataRecord>(input: TransformArg<T>, options: GroupYOptions = {}) {
    return groupXYZ('y', input, options);
}

/**
 * groups the dataset by the z channel and optionally reduces the group items
 * to output channels x, x1, x2, y, y1, y2, fill, stroke, r, opacity, fillOpacity,
 * or strokeOpacity
 */
export function groupZ<T extends DataRecord>(input: TransformArg<T>, options: GroupZOptions = {}) {
    return groupXYZ('z', input, options);
}

const groupDimRaw = Symbol('groupDimRaw');

function groupXYZ<T extends DataRecord>(
    dim: 'x' | 'y' | 'z',
    { data, ...channels }: TransformArg<T>,
    options: GroupZOptions = {}
) {
    // console.log({ dim, data, channels, options });
    if (
        (dim === 'z'
            ? channels.z || channels.fill || channels.stroke || channels.fx || channels.fy
            : channels[dim]) == null
    )
        throw new Error('you must provide a channel to group on ' + dim);

    const opts = options as Record<string, unknown>;
    const propName =
        opts[`${dim}PropName`] != null
            ? (opts[`${dim}PropName`] as string)
            : typeof channels[dim] === 'string' && !options.interval
              ? channels[dim]
              : `__${dim}`;
    const interval = options.interval ? maybeInterval(options.interval) : null;

    // group by x or y
    const groups =
        dim === 'z'
            ? ([[null, data]] as [RawValue, DataRecord[]][])
            : d3Groups(
                  data
                      .filter((d) => testFilter(d, channels))
                      .map((d) => ({
                          ...(d as DataRecord),
                          [groupDimRaw]: resolveChannel(dim, d, channels)
                      }))
                      .filter((d) => isValid(d[groupDimRaw])),
                  (d): RawValue => {
                      return interval
                          ? (interval as { floor: (d: number) => number }).floor(
                                d[groupDimRaw] as number
                            )
                          : d[groupDimRaw];
                  }
              );
    const newData: DataRecord[] = [];
    let newChannels = omit({ ...channels }, 'filter');
    if (dim !== 'z') newChannels[dim] = propName;

    const outputs: ChannelName[] = [
        ...(dim === 'x'
            ? (['y', 'y1', 'y2'] as ChannelName[])
            : dim === 'y'
              ? (['x', 'x1', 'x2'] as ChannelName[])
              : (['x', 'x1', 'x2', 'y', 'y1', 'y2'] as ChannelName[])),
        'fill',
        'stroke',
        'r',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];

    groups.forEach(([groupKey, items]) => {
        const baseRecord = dim === 'z' ? {} : { [propName]: groupKey };
        const newGroupChannels = groupFacetsAndZ(
            items,
            channels as never,
            (items, itemGroupProps) => {
                const copiedProps: DataRecord = {};
                // copy properties from first item of each group
                options.copy?.forEach((prop: string) => {
                    copiedProps[prop] = (items[0] as DataRecord)[prop];
                });
                const item: DataRecord = {
                    ...baseRecord,
                    ...copiedProps,
                    ...itemGroupProps
                } as DataRecord;
                reduceOutputs(
                    item,
                    items as DataRecord[],
                    options as never,
                    outputs,
                    channels,
                    newChannels
                );
                newData.push(item);
            }
        );
        newChannels = { ...newChannels, ...newGroupChannels };
    });
    return { data: newData, ...newChannels };
}
