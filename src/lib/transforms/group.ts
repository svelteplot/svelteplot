import { groupFacetsAndZ } from '$lib/helpers/group.js';
import { isValid, testFilter } from '$lib/helpers/index.js';
import { reduceOutputs, type ReducerName } from '$lib/helpers/reduce.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type { DataRecord, DataRow, RawValue, TransformArg } from '$lib/types/index.js';
import { groups as d3Groups } from 'd3-array';
import { omit } from '$lib/helpers/index.js';
import { maybeInterval } from '$lib/helpers/autoTicks.js';

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
export function group(
    { data, ...channels }: TransformArg<T, DataRecord>,
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

    const outputs = ['fill', 'stroke', 'r', 'opacity', 'fillOpacity', 'strokeOpacity'];

    groups.forEach(([xGroupKey, xGroups]) => {
        xGroups.forEach(([yGroupKey, items]) => {
            const baseRecord = { [xChannel]: xGroupKey, [yChannel]: yGroupKey }; // dim === 'z' ? {} : { [`__${dim}`]: groupKey };
            // copy properties from first item of each group
            options.copy?.forEach((prop) => {
                baseRecord[prop] = items[0][prop];
            });
            const newGroupChannels = groupFacetsAndZ(items, channels, (items, itemGroupProps) => {
                const item = { ...baseRecord, ...itemGroupProps };
                reduceOutputs(item, items, options, outputs, channels, newChannels);
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
export function groupX(input: TransformArg<T, DataRecord>, options: GroupXOptions = {}) {
    return groupXYZ('x', input, options);
}

/**
 * groups the dataset by the y channel and optionally reduces the group items
 * to output channels x, x1, x2, fill, stroke, r, opacity, fillOpacity, or strokeOpacity
 */
export function groupY(input: TransformArg<T, DataRecord>, options: GroupYOptions = {}) {
    return groupXYZ('y', input, options);
}

/**
 * groups the dataset by the z channel and optionally reduces the group items
 * to output channels x, x1, x2, y, y1, y2, fill, stroke, r, opacity, fillOpacity,
 * or strokeOpacity
 */
export function groupZ(input: TransformArg<T, DataRecord>, options: GroupZOptions = {}) {
    return groupXYZ('z', input, options);
}

function groupXYZ(
    dim: 'x' | 'y' | 'z',
    { data, ...channels }: TransformArg<T, DataRecord>,
    options: GroupXOptions = {}
) {
    // console.log({ dim, data, channels, options });
    if (
        (dim === 'z'
            ? channels.z || channels.fill || channels.stroke || channels.fx || channels.fy
            : channels[dim]) == null
    )
        throw new Error('you must provide a channel to group on ' + dim);

    const propName =
        options[`${dim}PropName`] != null
            ? options[`${dim}PropName`]
            : typeof channels[dim] === 'string' && !options.interval
              ? channels[dim]
              : `__${dim}`;
    const interval = options.interval ? maybeInterval(options.interval) : null;

    // group by x or y
    const groups =
        dim === 'z'
            ? [[null, data]]
            : d3Groups(
                  data
                      .filter((d) => testFilter(d, channels))
                      .map((d) => ({ ...d, [groupDimRaw]: resolveChannel(dim, d, channels) }))
                      .filter((d) => isValid(d[groupDimRaw])),
                  (d) => {
                      const v = resolveChannel(dim, d, channels);
                      return interval ? interval.round(v) : v;
                  }
              );
    const newData: DataRecord[] = [];
    let newChannels = omit({ ...channels }, 'filter');
    if (dim !== 'z') newChannels[dim] = propName;

    const outputs = [
        ...(dim === 'x'
            ? ['y', 'y1', 'y2']
            : dim === 'y'
              ? ['x', 'x1', 'x2']
              : ['x', 'x1', 'x2', 'y', 'y1', 'y2']),
        'fill',
        'stroke',
        'r',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];

    groups.forEach(([groupKey, items]) => {
        const baseRecord = dim === 'z' ? {} : { [propName]: groupKey };
        const newGroupChannels = groupFacetsAndZ(items, channels, (items, itemGroupProps) => {
            const copiedProps = {};
            // copy properties from first item of each group
            options.copy?.forEach((prop) => {
                copiedProps[prop] = items[0][prop];
            });
            const item = { ...baseRecord, ...copiedProps, ...itemGroupProps };
            reduceOutputs(item, items, options, outputs, channels, newChannels);
            newData.push(item);
        });
        newChannels = { ...newChannels, ...newGroupChannels };
    });
    return { data: newData, ...newChannels };
}
