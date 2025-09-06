import { resolveChannel } from '$lib/helpers/resolve.js';
import type { ChannelName, Channels, DataRecord } from '$lib/types/index.js';
import { groups as d3Groups } from 'd3-array';

/**
 * Groups the data by the fx, fy and z channels and calls the reduce function
 * for each group. Returns the new channels to be added in the transform.
 */
export function groupFacetsAndZ<T>(
    items: T[],
    channels: Channels,
    reduce: (items: DataRecord[]) => any
) {
    const groupBy = (['fx', 'fy', 'z'] as ChannelName[]).map((groupChannel) => {
        const groupByChannel =
            groupChannel === 'z'
                ? channels.z
                    ? 'z'
                    : channels.fill
                      ? 'fill'
                      : channels.stroke
                        ? 'stroke'
                        : false
                : channels[groupChannel]
                  ? groupChannel
                  : false;
        if (groupByChannel) {
            const groupByPropName =
                typeof channels[groupByChannel] === 'string'
                    ? channels[groupByChannel]
                    : `__group_${groupByChannel}`;
            return [
                groupByChannel,
                groupByPropName,
                (d: DataRecord) => resolveChannel(groupByChannel, d, channels)
            ];
        } else {
            return [null, null, () => true];
        }
    });

    const groups = d3Groups(items, ...groupBy.map((d) => d[2]));

    for (const [fxKey, fxGroups] of groups) {
        const newItemGroupProps = {};
        if (groupBy[0][0] !== null) newItemGroupProps[groupBy[0][1]] = fxKey;
        for (const [fyKey, fyGroups] of fxGroups) {
            if (groupBy[1][0] !== null) newItemGroupProps[groupBy[1][1]] = fyKey;
            for (const [zKey, zGroups] of fyGroups) {
                if (groupBy[2][0] !== null) newItemGroupProps[groupBy[2][1]] = zKey;
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
