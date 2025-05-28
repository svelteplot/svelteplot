import type { Channels, DataRecord, TransformArg } from '$lib/types.js';
import { resolveChannel } from 'svelteplot/helpers/resolve';
import { randomUniform, randomNormal } from 'd3-random';
import { isDate } from 'svelteplot/helpers/typeChecks';
import { durations, maybeTimeInterval, parseTimeInterval } from 'svelteplot/helpers/time';

const JITTER_X = Symbol('jitterX');
const JITTER_Y = Symbol('jitterY');

type JitterOptions = {
    type: 'uniform' | 'normal';
    /** width for uniform jittering */
    width: number;
    /** standard deviation for normal jittering */
    std: number;
    /**
     * optional random number source that produces values in range [0,1)
     * useful for testing with a deterministic source
     */
    source?: () => number;
};

export function jitterX(
    { data, ...channels }: TransformArg<DataRecord>,
    options: JitterOptions
): TransformArg<DataRecord> {
    return jitter('x', data, channels, options);
}

export function jitterY(
    { data, ...channels }: TransformArg<DataRecord>,
    options: JitterOptions
): TransformArg<DataRecord> {
    return jitter('y', data, channels, options);
}

export function jitter(
    channel: 'x' | 'y',
    data: DataRecord[],
    channels: Channels,
    options: JitterOptions
): TransformArg<DataRecord> {
    if (channels[channel]) {
        const type = options?.type ?? 'uniform';
        const width = parseNumber(options?.width ?? 0.35);
        const std = parseNumber(options?.std ?? 0.15);
        // @todo support time interval strings as width/std parameters

        // Use the provided source or default to Math.random
        const rng = options?.source ?? Math.random;
        const random =
            type === 'uniform'
                ? randomUniform.source(rng)(-width, width)
                : randomNormal.source(rng)(0, std);

        const accKey = channel === 'x' ? JITTER_X : JITTER_Y;
        return {
            data: data.map((row) => {
                const value = resolveChannel(channel, row, channels);
                return {
                    ...row,
                    [accKey]:
                        typeof value === 'number'
                            ? value + random()
                            : isDate(value)
                              ? new Date(value.getTime() + random())
                              : value
                };
            }),
            ...channels,
            // point channel to new accessor symbol
            [channel]: accKey
        };
    }
    return {
        data,
        ...channels
    };
}

function parseNumber(value: number | string): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        try {
            const [name, period] = parseTimeInterval(value);
            return durations.get(name) * period;
        } catch (err) {
            return 0;
        }
    }
    return 0;
}
