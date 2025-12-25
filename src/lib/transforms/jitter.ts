import type { TransformArg, TransformReturn } from '$lib/types/index.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import { randomUniform, randomNormal } from 'd3-random';
import { isDate } from '$lib/helpers/typeChecks.js';
import { durations, parseTimeInterval } from '$lib/helpers/time.js';

const JITTER = {
    x: Symbol('jitterX'),
    x1: Symbol('jitterX1'),
    x2: Symbol('jitterX2'),
    y: Symbol('jitterY'),
    y1: Symbol('jitterY1'),
    y2: Symbol('jitterY2')
};

type JitterOptions = {
    /**
     * optional random number source that produces values in range [0,1)
     * useful for testing with a deterministic source
     */
    source?: () => number;
} & ({ type: 'uniform'; width?: number | string } | { type: 'normal'; std?: number | string });

export function jitterX<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'x'> {
    return jitter(args, { x: options });
}

export function jitterY<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'y'> {
    return jitter(args, { y: options });
}

type PositionalScale = 'x' | 'x1' | 'x2' | 'y' | 'y1' | 'y2';

export function jitter<T, C extends TransformArg<T>>(
    { data, ...channels }: C,
    options: Partial<Record<PositionalScale, JitterOptions>>
): TransformReturn<C, T> {
    const jitterChannels = (Object.keys(options) as PositionalScale[]).filter((ch) => channels[ch]);
    // if no jitter channels are defined return early
    if (!jitterChannels.length)
        return {
            data,
            ...channels
        };

    // construct jitter functions
    const jitterFns: Record<PositionalScale, () => number> = Object.fromEntries(
        Object.entries(options).map(([key, opts]) => {
            opts.type = opts.type ?? 'uniform';
            const width = opts?.type === 'uniform' ? parseNumber(opts?.width ?? 0.35) : 0;
            const std = opts?.type === 'normal' ? parseNumber(opts?.std ?? 0.15) : 0;
            // @todo support time interval strings as width/std parameters

            // Use the provided source or default to Math.random
            const rng = opts?.source ?? Math.random;
            const random =
                opts?.type === 'uniform'
                    ? randomUniform.source(rng)(-width, width)
                    : randomNormal.source(rng)(0, std);

            return [key, random];
        })
    ) as Record<PositionalScale, () => number>;

    return {
        data: data.map((row) => {
            let newRow: T = { ...row };
            jitterChannels.forEach((channel) => {
                const value = resolveChannel(channel, row, channels);
                const random = jitterFns[channel];
                const accKey = JITTER[channel as PositionalScale];
                newRow = {
                    ...newRow,
                    [accKey]:
                        typeof value === 'number'
                            ? value + random()
                            : isDate(value)
                              ? new Date(value.getTime() + random())
                              : value
                };
            });
            return newRow;
        }),
        ...channels,
        // point the jittered channels to new accessor symbols
        ...Object.fromEntries(
            jitterChannels.map((channel) => [channel, JITTER[channel as PositionalScale]])
        )
    };
}

function parseNumber(value: number | string): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        try {
            const [name, period] = parseTimeInterval(value);
            return (durations.get(name) ?? 0) * period;
        } catch (err) {
            return 0;
        }
    }
    return 0;
}
