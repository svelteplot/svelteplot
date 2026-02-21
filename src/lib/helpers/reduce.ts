import type { ChannelName, Channels, DataRecord, DataRow } from '../types/index.js';
import { min, max, mode, sum, mean, median, variance, deviation, quantile } from 'd3-array';
import { resolveChannel } from './resolve.js';
import { POSITION_CHANNELS } from './index.js';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

// Permissive to accept d3-array functions which have overloaded signatures
// with optional accessor params and may return undefined
type ReducerFunc = (group: Iterable<any>, ...rest: any[]) => any;
type ReducerOption = ReducerName | ReducerFunc;

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// For internal use.
export type ReducerPercentile =
    | (`p${Digit}${Digit}` & Record<never, never>) // see https://github.com/microsoft/TypeScript/issues/29729
    | 'p25'
    | 'p50'
    | 'p75';

export type ReducerName =
    | 'count'
    | 'deviation'
    | 'difference'
    | 'first'
    | 'last'
    | 'max'
    | 'mean'
    | 'median'
    | 'min'
    | 'mode'
    | 'ratio'
    | 'sum'
    | 'variance'
    | ReducerPercentile;

const niceReduceNames: Record<string, string> = {
    count: 'Frequency',
    deviation: 'Standard Deviation',
    mean: 'Average'
};

// Typed as Record<string, ...> because the Proxy wrapper adds virtual
// percentile keys (p00–p99) that don't exist on the static object
const StaticReducer: Record<string, ReducerFunc> = {
    count: (d) => Array.from(d).length,
    min,
    max,
    mode,
    sum,
    mean,
    median,
    identity: (d: Iterable<DataRow>) => d,
    variance,
    deviation,
    first: ((d: any[]) => d[0]) as ReducerFunc,
    last: ((d: any[]) => d.at(-1)) as ReducerFunc,
    difference: ((d: any[]) => d.at(-1) - d[0]) as ReducerFunc,
    ratio: ((d: any[]) => d.at(-1) / d[0]) as ReducerFunc
    // TODO: proportion
    // TODO: proportion-facet
    // TODO: min-index
    // TODO: max-index
};

// use proxy to allow for percentile reducers
export const Reducer = new Proxy(StaticReducer, {
    get(target, prop) {
        if (String(prop).charAt(0) === 'p' && String(prop).length === 3) {
            const p = +String(prop).slice(1) / 100;
            return percentile(p);
        }
        return Reflect.get(target, prop);
    },
    has(target, prop) {
        if (String(prop).charAt(0) === 'p' && String(prop).length === 3) {
            return true;
        }
        return Reflect.has(target, prop);
    }
});

function percentile(p: number) {
    return (I: Iterable<number>, f: (d: number) => number) => quantile(I, p, f);
}

function isReducerName(r: ReducerOption): r is ReducerName {
    return typeof r === 'string' && r in Reducer;
}

export function mayberReducer(r: ReducerOption): ReducerFunc {
    if (typeof r === 'function') return r;
    if (typeof r === 'string' && isReducerName(r)) {
        return Reducer[r] as ReducerFunc;
    }
    throw new Error('unknown reducer ' + r);
}

export function reduceOutputs(
    newDatum: DataRecord,
    data: DataRecord[],
    options: Record<ChannelName, ReducerOption>,
    outputs: Iterable<ChannelName>,
    channels: Channels<any>,
    newChannels: Channels<any>
) {
    for (const k of outputs) {
        if (options[k] != null) {
            const values =
                channels[k] == null ? data : data.map((d) => resolveChannel(k, d, channels));
            const reducer = mayberReducer(options[k]);

            newDatum[`__${k}`] = reducer(values);
            newChannels[k] = `__${k}`;

            if (typeof options[k] === 'string') {
                const reducerName =
                    niceReduceNames[options[k] as string] ??
                    `${String(options[k]).charAt(0).toUpperCase()}${String(options[k]).slice(1)}`;
                // we have a named reducer like 'count', so let's try to preserve the
                // source channel mapping for axis labels
                if (POSITION_CHANNELS.has(k)) {
                    if (typeof channels[k] === 'string') {
                        // the named reducer is applied to a column name, so we can use a combination
                        // of both as axis labels, e.g. MEAN(weight)
                        newChannels[ORIGINAL_NAME_KEYS[k]] = `${reducerName} ( ${channels[k]} )`;
                    } else {
                        newChannels[ORIGINAL_NAME_KEYS[k]] = reducerName;
                    }
                }
            }
        }
    }
}
