import { resolveChannel } from '$lib/helpers/resolve.js';
import type { ChannelName, Channels, DataRecord, RawValue } from '$lib/types/index.js';
import { groups as d3Groups } from 'd3-array';

/**
 * Groups the data by the fx, fy and z channels and calls the reduce function
 * for each group. Returns the new channels to be added in the transform.
 */
export function groupFacetsAndZ<T>(
    items: T[],
    channels: Channels<T>,
    reduce: (items: T[], groupProps?: Record<string, unknown>) => any
) {
    const groupBy: Array<
        [ChannelName | null, string | null, (d: DataRecord<T>) => RawValue | boolean]
    > = (['fx', 'fy', 'z'] as ChannelName[]).map((groupChannel) => {
        let groupByChannel: ChannelName | null = null;
        if (groupChannel === 'z') {
            if (channels.z) groupByChannel = 'z';
            else if (channels.fill) groupByChannel = 'fill';
            else if (channels.stroke) groupByChannel = 'stroke';
        } else if (channels[groupChannel]) {
            groupByChannel = groupChannel;
        }
        if (groupByChannel) {
            const groupByPropName =
                typeof channels[groupByChannel] === 'string'
                    ? (channels[groupByChannel] as string)
                    : `__group_${groupByChannel}`;
            return [
                groupByChannel,
                groupByPropName,
                (d: DataRecord<T>) => resolveChannel(groupByChannel, d, channels)
            ];
        } else {
            return [null, null, () => true];
        }
    });

    const groups = d3Groups(items, ...groupBy.map((d) => d[2])) as [
        RawValue,
        [RawValue, [RawValue, T[]][]][]
    ][];

    for (const [fxKey, fxGroups] of groups) {
        const newItemGroupProps: Record<string, unknown> = {};
        if (groupBy[0][0] !== null && groupBy[0][1])
            newItemGroupProps[groupBy[0][1] as string] = fxKey;
        for (const [fyKey, fyGroups] of fxGroups) {
            if (groupBy[1][0] !== null && groupBy[1][1])
                newItemGroupProps[groupBy[1][1] as string] = fyKey;
            for (const [zKey, zGroups] of fyGroups) {
                if (groupBy[2][0] !== null && groupBy[2][1])
                    newItemGroupProps[groupBy[2][1] as string] = zKey;
                reduce(zGroups, newItemGroupProps);
            }
        }
    }
    // return the new channel accessors to be added in the transform
    return Object.fromEntries(
        groupBy
            .filter(([groupByChannel]) => groupByChannel !== null)
            .map(([groupByChannel, groupByProp]) => [groupByChannel, groupByProp])
    );
}
