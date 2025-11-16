import { resolveProp } from '$lib/helpers/resolve.js';
import type { DataRecord, TransformArg } from '$lib/types/index.js';
import { geoCentroid as d3GeoCentroid } from 'd3-geo';
import type { Channels } from 'svelteplot/types';

const CENTROID = Symbol('centroid');

type WithCentroid<T> = T & {
    [CENTROID]: [number, number];
};

export function geoCentroid<Datum extends DataRecord>({
    data,
    ...options
}: { data: Datum[] } & TransformArg<Datum>): TransformArg<WithCentroid<Datum>> {
    const transformedData = data.map((d: Datum) => ({
        ...d,
        [CENTROID]: d3GeoCentroid(resolveProp(options.geometry, d, d))
    })) as WithCentroid<Datum>[];

    const newOptions = { ...options } as unknown as Channels<WithCentroid<Datum>>;

    return {
        data: transformedData,
        ...newOptions,
        x: (d: WithCentroid<Datum>) => d[CENTROID][0],
        y: (d: WithCentroid<Datum>) => d[CENTROID][1]
    };
}
