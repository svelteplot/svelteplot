import isDataRecord from '../helpers/isDataRecord.js';
import { resolveChannel } from '../helpers/resolve.js';
import type { DataRecord, DataRow, TransformArg } from '../types/index.js';
import { shuffler } from 'd3-array';
import { randomLcg } from 'd3-random';

export const SORT_KEY = Symbol('sortKey');
export const IS_SORTED = Symbol('isSorted');

/**
 * sorts the data according to the sort channel option; supports channel
 * accessors, comparator functions, and `{channel, order}` objects
 */
export function sort<T>(
    { data, ...channels }: TransformArg<T>,
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
        // if sort is a function that does not take exactly one argument, we treat it
        // as comparator function, as you would pass to array.sort
        const isComparator = typeof channels.sort === 'function' && channels.sort.length !== 1;
        // sort data
        return {
            data: isComparator
                ? data.toSorted(channels.sort as (a: T, b: T) => number)
                : data
                      .map((d) => ({
                          ...d,
                          [SORT_KEY]: resolveChannel('sort', d, { ...channels, sort }) as
                              | number
                              | Date
                              | string
                      }))
                      .map((d) => ({
                          ...d,
                          [SORT_KEY]:
                              typeof d[SORT_KEY] === 'number' && !Number.isFinite(d[SORT_KEY])
                                  ? Number.POSITIVE_INFINITY
                                  : d[SORT_KEY]
                      }))
                      .toSorted(
                          (a, b) =>
                              (typeof a[SORT_KEY] === 'string' && typeof b[SORT_KEY] === 'string'
                                  ? a[SORT_KEY].localeCompare(b[SORT_KEY])
                                  : a[SORT_KEY] > b[SORT_KEY]
                                    ? 1
                                    : a[SORT_KEY] < b[SORT_KEY]
                                      ? -1
                                      : 0) *
                              (options.reverse ||
                              (isDataRecord(sort) && sort?.order === 'descending')
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
 * shuffles the data row order
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
        sort: null,
        [IS_SORTED]: true
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
        sort: null,
        [IS_SORTED]: true
    };
}
