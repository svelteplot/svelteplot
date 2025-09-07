import { testFilter } from '$lib/helpers/index.js';
import type { DataRecord, TransformArg } from '$lib/types/index.js';

export function filter<T>({ data, ...channels }: TransformArg<T>): TransformArg<T> {
    return {
        data: data.filter((d) => testFilter(d, channels)),
        ...channels,
        filter: null
    } as TransformArg<T>;
}
