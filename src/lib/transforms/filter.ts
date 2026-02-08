import { testFilter } from '../helpers/index.js';
import type { DataRecord, TransformArg } from '../types/index.js';

/**
 * Filters data based on a function provided via `filter` channels.
 */
export function filter<T>({ data, ...channels }: TransformArg<T>): TransformArg<T> {
    return {
        data: data.filter((d) => testFilter(d, channels)),
        ...channels,
        filter: null
    } as TransformArg<T>;
}
