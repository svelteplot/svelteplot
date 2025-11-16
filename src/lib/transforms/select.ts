import { groupFacetsAndZ } from '$lib/helpers/group.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type { ChannelName, DataRecord, TransformArg } from '$lib/types/index.js';

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type SelectOptions =
    | 'first'
    | 'last'
    | AtLeastOne<{
          [k in ChannelName]: 'min' | 'max';
      }>;

// let o: SelectOptions = { x: 'min'};

export function select({ data, ...channels }: TransformArg<DataRecord>, options: SelectOptions) {
    const newData: DataRecord[] = [];
    groupFacetsAndZ(data, channels, (items) => {
        if (typeof options === 'string') {
            if (options !== 'first' && options !== 'last')
                throw new Error('unknown sort option: ' + options);
            newData.push(options === 'first' ? items[0] : items.at(-1));
        } else {
            const sortOptions = Object.entries(options) as [ChannelName, 'min' | 'max'][];
            if (!sortOptions.length) throw new Error('must provide the channel to sort by');
            if (sortOptions.length > 1) throw new Error('cannot sort by more than one channel');
            if (sortOptions[0][1] !== 'min' && sortOptions[0][1] !== 'max')
                throw new Error('unknown sort option: ' + sortOptions[0][1]);
            const selected = items
                .map((item) => ({
                    ...item,
                    __sortby: resolveChannel(sortOptions[0][0], item, channels)
                }))
                .sort((a, b) => (a.__sortby > b.__sortby ? 1 : a.__sortby < b.__sortby ? -1 : 0))
                .at(sortOptions[0][1] === 'min' ? 0 : -1);
            newData.push(selected);
        }
    });
    return { data: newData, ...channels };
}

/**
 * Keeps only the first item of each group
 */
export function selectFirst(args: TransformArg<DataRecord>) {
    return select(args, 'first');
}

/**
 * Keeps only the last item of each group
 */
export function selectLast(args: TransformArg<DataRecord>) {
    return select(args, 'last');
}

export function selectMinX(args: TransformArg<DataRecord>) {
    return select(args, { x: 'min' });
}
export function selectMaxX(args: TransformArg<DataRecord>) {
    return select(args, { x: 'max' });
}
export function selectMinY(args: TransformArg<DataRecord>) {
    return select(args, { y: 'min' });
}
export function selectMaxY(args: TransformArg<DataRecord>) {
    return select(args, { y: 'max' });
}
