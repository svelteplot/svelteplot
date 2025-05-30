import isDataRecord from '$lib/helpers/isDataRecord.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type { DataRecord, DataRow, TransformArg } from '$lib/types.js';
import { shuffler } from 'd3-array';
import { randomLcg } from 'd3-random';

export const SORT_KEY = Symbol('sortKey');
export const IS_SORTED = Symbol('isSorted');

export function sort(
    { data, ...channels }: TransformArg<DataRecord>,
    options: { reverse?: boolean } = {}
) {
    if (!Array.isArray(data)) return { data, ...channels };
    if (channels.sort) {
        const { sort } = channels;
        if (
            isDataRecord(sort) &&
            typeof sort.channel === 'string' &&
            sort.channel.charAt(0) === '-'
        ) {
            sort.channel = sort.channel.substring(1);
            sort.order = 'descending';
        }
        // sort data
        return {
            data: data
                .map((d) => ({
                    ...d,
                    [SORT_KEY]: resolveChannel('sort', d, { ...channels, sort })
                }))
                .toSorted(
                    (a, b) =>
                        (a[SORT_KEY] > b[SORT_KEY] ? 1 : a[SORT_KEY] < b[SORT_KEY] ? -1 : 0) *
                        (options.reverse || (isDataRecord(sort) && sort?.order === 'descending')
                            ? -1
                            : 1)
                )
                .map(({ [SORT_KEY]: a, ...rest }) => rest),

            ...channels,
            [IS_SORTED]: sort,
            // set the sort channel to null to disable the implicit alphabetical
            // ordering of ordinal domains, and also to avoid double sorting in case
            // this transform is used "outside" a mark
            sort: null
        };
    }
    return {
        data,
        ...channels
    };
}

/**
 * reverses the data row order
 */
export function shuffle(
    { data, ...channels }: TransformArg<DataRow[]>,
    options: { seed?: number } = {}
) {
    const random = randomLcg(options.seed);
    const shuffle = shuffler(random);
    return {
        data: shuffle([...data]),
        ...channels,
        // set the sort channel to null to disable the implicit
        // alphabetical ordering of ordinal domains
        sort: null
    };
}

/**
 * reverses the data row order
 */
export function reverse({ data, ...channels }: TransformArg<DataRow[]>) {
    return {
        data: data.toReversed(),
        ...channels,
        // set the sort channel to null to disable the implicit
        // alphabetical ordering of ordinal domains
        sort: null
    };
}
