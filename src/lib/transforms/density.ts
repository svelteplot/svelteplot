/**
 * implementation based on science.js by Jason Davies
 */

/**
 * Observable Density mark is relying on d3.densityContours which implements 2D KDE
 * with an box blur from d3.blur2, which represents the uniform kernel.
 *
 * This implementation provides a more general approach to 2D KDE with different kernels.
 *
 */

import { extent, quantileSorted, variance } from 'd3-array';
import { isValid } from 'svelteplot/helpers';
import { maybeInterval } from 'svelteplot/helpers/autoTicks';
import { groupFacetsAndZ } from 'svelteplot/helpers/group';
import isDataRecord from 'svelteplot/helpers/isDataRecord';
import { resolveChannel } from 'svelteplot/helpers/resolve';
import type { TransformArg } from 'svelteplot/types';

// 2D Gaussian kernel function
function gaussian2D(dx, dy, bwX, bwY) {
    return (
        Math.exp(-0.5 * ((dx * dx) / (bwX * bwX) + (dy * dy) / (bwY * bwY))) /
        (2 * Math.PI * bwX * bwY)
    );
}

// kde2d function
function kde2d(data, evalXs, evalYs, bwX, bwY) {
    const n = data.length;
    const density = [];
    for (let xi = 0; xi < evalXs.length; xi++) {
        for (let yi = 0; yi < evalYs.length; yi++) {
            let sum = 0;
            for (let i = 0; i < n; i++) {
                const dx = evalXs[xi] - data[i][0];
                const dy = evalYs[yi] - data[i][1];
                sum += gaussian2D(dx, dy, bwX, bwY);
            }
            // Store: [x, y, density]
            density.push([evalXs[xi], evalYs[yi], sum / n]);
        }
    }
}

type DensityOptions = {
    /**
     * The kernel function to use for smoothing.
     */
    kernel?:
        | 'uniform'
        | 'triangular'
        | 'epanechnikov'
        | 'quartic'
        | 'triweight'
        | 'gaussian'
        | 'cosine'
        | ((u: number) => number);
    /**
     * The bandwidth to use for smoothing. Can be a fixed number or a function that computes the bandwidth based on the data.
     */
    bandwidth?: number | ((data: number[]) => number);
    /**
     * If an interval is provided, the smoothing will be computed over that interval instead of the raw data points.
     */
    interval?: number | string;
    /**
     *
     */
    trim?: boolean;
};

// see https://github.com/jasondavies/science.js/blob/master/src/stats/kernel.js
const KERNEL = {
    uniform(u: number): number {
        if (u <= 1 && u >= -1) return 0.5;
        return 0;
    },
    triangular(u: number): number {
        if (u <= 1 && u >= -1) return 1 - Math.abs(u);
        return 0;
    },
    epanechnikov(u: number): number {
        if (u <= 1 && u >= -1) return 0.75 * (1 - u * u);
        return 0;
    },
    quartic(u: number): number {
        if (u <= 1 && u >= -1) {
            const tmp = 1 - u * u;
            return (15 / 16) * tmp * tmp;
        }
        return 0;
    },
    triweight(u: number): number {
        if (u <= 1 && u >= -1) {
            const tmp = 1 - u * u;
            return (35 / 32) * tmp * tmp * tmp;
        }
        return 0;
    },
    gaussian(u: number): number {
        return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
    },
    cosine(u: number): number {
        if (u <= 1 && u >= -1) return (Math.PI / 4) * Math.cos((Math.PI / 2) * u);
        return 0;
    }
};

/**
 * One-dimensional kernel density estimation
 */
export function densityX<T>(
    args: TransformArg<T>,
    options: DensityOptions & { channel: 'y' | 'y1' | 'y2' }
): TransformArg<T> {
    return density1d('x', args, options);
}

/**
 * One-dimensional kernel density estimation
 */
export function densityY<T>(
    args: TransformArg<T>,
    options: DensityOptions & { channel: 'x' | 'x1' | 'x2' }
): TransformArg<T> {
    return density1d('y', args, options);
}

const CHANNELS = {
    x: Symbol('x'),
    y: Symbol('y')
};

const BANDWIDTH_FACTOR = {
    gaussian: 0.9,
    epanechnikov: 2.34,
    uniform: 1.06,
    triangular: 1.34,
    quartic: 2.78,
    triweight: 3.15,
    cosine: 1.06
};

function bandwidthSilverman(x: number[]) {
    const iqr = quantileSorted(x, 0.75) - quantileSorted(x, 0.25);
    const xvar = variance(x);

    const hi = Math.sqrt(xvar);
    let lo;
    if (!(lo = Math.min(hi, iqr / 1.34))) {
        (lo = hi) || (lo = Math.abs(x[1])) || (lo = 1);
    }
    return lo * Math.pow(x.length, -0.2);
}

const VALUE = Symbol('value');

function roundToTerminating(x: number, sig = 2) {
    if (!isFinite(x) || x === 0) return x;
    const exp = Math.floor(Math.log10(Math.abs(x)));
    const decimals = Math.max(0, sig - 1 - exp);
    const factor = 10 ** decimals; // denominator 10^decimals → terminating decimal
    return Math.round(x * factor) / factor;
}

function density1d<T>(
    independent: 'x' | 'y',
    { data, ...channels }: TransformArg<T>,
    options: DensityOptions = {}
): TransformArg<T> {
    const densityChannel = independent === 'x' ? 'y' : 'x';

    const { kernel, bandwidth, interval, trim, channel } = {
        kernel: 'epanechnikov',
        bandwidth: bandwidthSilverman,
        interval: undefined,
        trim: false,
        channel: densityChannel,
        ...options
    };
    // one-dimensional kernel density estimation
    const k = maybeKernel(kernel || KERNEL.epanechnikov);

    const outData = [];

    const isRawDataArray =
        Array.isArray(data) && !isDataRecord(data[0]) && channels[independent] == null;

    // compute bandwidth before grouping
    const resolvedData = (
        isRawDataArray
            ? data.map((d) => ({ [VALUE]: d }) as any)
            : data.map((d) => ({ [VALUE]: resolveChannel(independent, d, channels), ...d }))
    ).filter((d) => isValid(d[VALUE]));

    const values = resolvedData.map((d) => d[VALUE]);

    // compute bandwidth from full data
    const bw =
        typeof bandwidth === 'function'
            ? (BANDWIDTH_FACTOR[kernel] ?? 1) * bandwidth(values.toSorted((a, b) => a - b))
            : bandwidth;

    const I = maybeInterval(interval ?? roundToTerminating(bw / 5));
    let [min, max] = extent(values);
    if (!trim) {
        const r = max - min;
        min = I.floor(min - r * 0.2);
        max = I.floor(max + r * 0.2);
    }
    const atValues = I.range(I.floor(min), I.offset(max)).map((d) => +d.toFixed(5));
    // let minX = Infinity;
    // let maxX = -Infinity;

    const res = groupFacetsAndZ(resolvedData, channels, (items, groupProps) => {
        const values = items.map((d) => d[VALUE]);

        let kdeValues = kde1d(values as number[], atValues, k, bw)
            .filter(([x, density]) => x != null && !isNaN(density))
            .sort((a, b) => a[0] - b[0]);

        if (!trim) {
            // trim zero values at begin and end except first and last
            const firstNonZero = kdeValues.findIndex(([x, v]) => v > 0);

            // if (firstNonZero > 0) minX = Math.min(minX, kdeValues[firstNonZero - 1][0]);
            const lastNonZero =
                kdeValues.length - 1 - [...kdeValues].reverse().findIndex(([x, v]) => v > 0);

            // if (lastNonZero > -1 && lastNonZero < kdeValues.length - 1)
            //     maxX = Math.max(maxX, kdeValues[lastNonZero + 1][0]);

            kdeValues = kdeValues.slice(
                firstNonZero < 1 ? 0 : firstNonZero - 1,
                lastNonZero < 0 ? kdeValues.length : lastNonZero + 1
            );
        }

        outData.push(
            ...kdeValues.map(([x, density]) => ({
                ...groupProps,
                [CHANNELS.x]: independent === 'x' ? x : density,
                [CHANNELS.y]: independent === 'y' ? x : density
            }))
        );
    });

    return {
        [independent]: CHANNELS[independent],
        [channel]: CHANNELS[densityChannel],
        ...res,
        data: outData
    };
}

/**
 * TODO: Two-dimensional kernel density estimation
 *
 */
export function density<T>(
    { data, ...options }: TransformArg<T>,
    { kernel, bandwidth }: DensityOptions
): TransformArg<T> {}

function kde1d(values: number[], atValues: number[], kernel: (u: number) => number, bw: number) {
    const n = values.length;
    return atValues.map((x) => {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += kernel((x - values[i]) / bw);
        }
        return [x, sum / (n * bw)];
    });
}

function maybeKernel(kernel: DensityOptions['kernel']): (u: number) => number {
    if (typeof kernel === 'function') return kernel;
    return KERNEL[kernel] || KERNEL.epanechnikov;
}

// See <http://en.wikipedia.org/wiki/Kernel_(statistics)>.
// science.stats.kernel = {
//   uniform: function(u) {
//     if (u <= 1 && u >= -1) return .5;
//     return 0;
//   },
//   triangular: function(u) {
//     if (u <= 1 && u >= -1) return 1 - Math.abs(u);
//     return 0;
//   },
//   epanechnikov: function(u) {
//     if (u <= 1 && u >= -1) return .75 * (1 - u * u);
//     return 0;
//   },
//   quartic: function(u) {
//     if (u <= 1 && u >= -1) {
//       var tmp = 1 - u * u;
//       return (15 / 16) * tmp * tmp;
//     }
//     return 0;
//   },
//   triweight: function(u) {
//     if (u <= 1 && u >= -1) {
//       var tmp = 1 - u * u;
//       return (35 / 32) * tmp * tmp * tmp;
//     }
//     return 0;
//   },
//   gaussian: function(u) {
//     return 1 / Math.sqrt(2 * Math.PI) * Math.exp(-.5 * u * u);
//   },
//   cosine: function(u) {
//     if (u <= 1 && u >= -1) return Math.PI / 4 * Math.cos(Math.PI / 2 * u);
//     return 0;
//   }
// };
