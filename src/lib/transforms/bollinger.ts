import { resolveChannel } from '$lib/helpers/resolve.js';
import type { DataRecord, TransformArg } from '$lib/types/index.js';

export type BollingerOptions = {
    /**
     * the window size (the window transform’s k option), an integer; defaults to 20
     */
    n?: number;
    /**
     * the band radius, a number representing a multiple of standard deviations; defaults to 2
     */
    k?: number;
};

export function bollingerX(
    args: TransformArg<DataRecord>,
    options: BollingerOptions = {}
): TransformArg<DataRecord> {
    return bollingerDim('x', args, options);
}

export function bollingerY(
    args: TransformArg<DataRecord>,
    options: BollingerOptions = {}
): TransformArg<DataRecord> {
    return bollingerDim('y', args, options);
}

export function bollingerDim(
    dim: 'x' | 'y',
    { data, ...channels }: TransformArg<DataRecord>,
    options: BollingerOptions = {}
) {
    const { n = 20, k = 2 } = options;
    const bands = bollinger(
        data.map((datum: DataRecord) => resolveChannel(dim, datum, channels)) as number[],
        n,
        [-k, 0, k]
    );
    const otherDim = dim === 'x' ? 'y' : 'x';
    return {
        data: data.map((datum: DataRecord, i: number) => ({
            __x: resolveChannel(otherDim, datum, channels),
            __lo: bands[0][i],
            __avg: bands[1][i],
            __hi: bands[2][i]
        })),
        ...channels,
        [otherDim]: '__x',
        [dim]: '__avg',
        [`${otherDim}1`]: '__x',
        [`${dim}1`]: '__lo',
        [`${dim}2`]: '__hi'
    };
}

/**
 * taken from https://observablehq.com/@d3/bollinger-bands/
 */
function bollinger(values: number[], N: number, K: number[]) {
    let i = 0;
    let sum = 0;
    let sumSquared = 0;
    // initialize bands
    const bands = K.map(() => new Float64Array(values.length).fill(NaN));
    // compute sum and square of sums
    for (let n = Math.min(N - 1, values.length); i < n; ++i) {
        const value = values[i];
        ((sum += value), (sumSquared += value ** 2));
    }
    for (let n = values.length, m = bands.length; i < n; ++i) {
        const value = values[i];
        ((sum += value), (sumSquared += value ** 2));
        const mean = sum / N;
        const deviation = Math.sqrt((sumSquared - sum ** 2 / N) / (N - 1));
        for (let j = 0; j < K.length; ++j) {
            bands[j][i] = mean + deviation * K[j];
        }
        const value0 = values[i - N + 1];
        ((sum -= value0), (sumSquared -= value0 ** 2));
    }
    return bands;
}
