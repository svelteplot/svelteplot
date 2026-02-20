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
import { isValid } from '../helpers';
import { maybeInterval } from '../helpers/autoTicks';
import { groupFacetsAndZ } from '../helpers/group';
import isDataRecord from '../helpers/isDataRecord';
import { resolveChannel } from '../helpers/resolve';
import type { DataRecord, TransformArg } from '../types';
import { ORIGINAL_NAME_KEYS } from '../constants.js';

export type KernelName =
    | 'uniform'
    | 'triangular'
    | 'epanechnikov'
    | 'quartic'
    | 'triweight'
    | 'gaussian'
    | 'cosine';

export type Kernel = KernelName | ((u: number) => number);

export type DensityOptions<T> = {
    /**
     * The kernel function to use for smoothing.
     */
    kernel?: Kernel;

    /**
     * The bandwidth to use for smoothing. Can be a fixed number or a function that computes the bandwidth based on the data.
     */
    bandwidth?: number | ((data: number[]) => number);
    /**
     * If an interval is provided, the smoothing will be computed over that interval instead of the raw data points.
     */
    interval?: number | string;
    /**
     * If true, the density values will be trimmed to the range of the data.
     */
    trim?: boolean;
    /**
     * If true, the density values will be cumulative.
     */
    cumulative?: false | 1 | -1;
};

// see https://github.com/jasondavies/science.js/blob/master/src/stats/kernel.js
const KERNEL: Record<KernelName, (u: number) => number> = {
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
    options: DensityOptions<T> & { channel?: 'y' | 'y1' | 'y2' }
): TransformArg<T> {
    return density1d('x', args, options);
}

/**
 * One-dimensional kernel density estimation
 */
export function densityY<T>(
    args: TransformArg<T>,
    options: DensityOptions<T> & { channel?: 'x' | 'x1' | 'x2' }
): TransformArg<T> {
    return density1d('y', args, options);
}

const CHANNELS = {
    x: Symbol('x'),
    y: Symbol('y')
};

const BANDWIDTH_FACTOR: Record<KernelName, number> = {
    gaussian: 0.9,
    epanechnikov: 2.34,
    uniform: 1.06,
    triangular: 1.34,
    quartic: 2.78,
    triweight: 3.15,
    cosine: 1.06
};

function isKernelName(value: string): value is KernelName {
    return value in KERNEL;
}

function bandwidthSilverman(x: number[]) {
    const iqr = quantileSorted(x, 0.75)! - quantileSorted(x, 0.25)!;
    const xvar = variance(x);

    const hi = Math.sqrt(xvar!);
    let lo: number;
    if (!(lo = Math.min(hi, iqr / 1.34))) {
        (lo = hi) || (lo = Math.abs(x[1])) || (lo = 1);
    }
    return lo * Math.pow(x.length, -0.2);
}

const VALUE = Symbol('value');
const WEIGHT = Symbol('weight');

function roundToTerminating(x: number, sig = 2) {
    if (!isFinite(x) || x === 0) return x;
    const exp = Math.floor(Math.log10(Math.abs(x)));
    const decimals = Math.max(0, sig - 1 - exp);
    const factor = 10 ** decimals; // denominator 10^decimals → terminating decimal
    return Math.round(x * factor) / factor;
}

function density1d<T>(
    independent: 'x' | 'y',
    { data, weight, ...channels }: TransformArg<T>,
    options: DensityOptions<T> = {}
): TransformArg<T> {
    const densityChannel = independent === 'x' ? 'y' : 'x';

    const { kernel, bandwidth, interval, trim, channel, cumulative } = {
        kernel: 'epanechnikov' as Kernel,
        bandwidth: bandwidthSilverman as number | ((data: number[]) => number),
        interval: undefined as number | string | undefined,
        trim: false,
        cumulative: false as false | 1 | -1,
        channel: densityChannel,
        ...options
    };
    // one-dimensional kernel density estimation
    const k = maybeKernel(kernel || KERNEL.epanechnikov);

    const outData: DataRecord[] = [];

    const isRawDataArray =
        Array.isArray(data) && !isDataRecord(data[0]) && channels[independent] == null;

    // compute bandwidth before grouping
    const resolvedData = (
        isRawDataArray
            ? data.map(
                  (d: any) =>
                      ({
                          [VALUE]: d,
                          [WEIGHT]: typeof weight === 'function' ? (weight as any)(d) : 1
                      }) as any
              )
            : data.map((d: any) => ({
                  [VALUE]: resolveChannel(independent, d, channels),
                  [WEIGHT]: typeof weight === 'function' ? (weight as any)(d) : 1,
                  ...d
              }))
    ).filter(
        (d: any) => isValid(d[VALUE]) && isValid(d[WEIGHT]) && (d[WEIGHT] as number) >= 0
    ) as DataRecord[];

    const values = resolvedData.map((d: any) => d[VALUE] as number);

    // compute bandwidth from full data
    const kernelName = typeof kernel === 'string' && isKernelName(kernel) ? kernel : null;
    const bw =
        typeof bandwidth === 'function'
            ? ((kernelName ? BANDWIDTH_FACTOR[kernelName] : null) ?? 1) *
              bandwidth(values.toSorted((a: number, b: number) => a - b))
            : bandwidth;

    const I = maybeInterval(interval ?? roundToTerminating(bw / 5))!;
    let [min, max] = extent(values) as [number | undefined, number | undefined];
    if (!trim) {
        const r = (max ?? 0) - (min ?? 0);
        min = (I as any).floor((min ?? 0) - r * 0.2);
        max = (I as any).floor((max ?? 0) + r * 0.2);
    }
    const atValues = (I as any)
        .range((I as any).floor(min), (I as any).offset(max))
        .map((d: number) => +d.toFixed(5));
    // let minX = Infinity;
    // let maxX = -Infinity;

    const res = groupFacetsAndZ(resolvedData, channels as any, (items: any[], groupProps) => {
        const values = items.map((d: any) => d[VALUE] as number);
        const weights = items.map((d: any) => d[WEIGHT] as number);

        let kdeValues = kde1d(values, weights, atValues, k, bw, cumulative)
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
        [ORIGINAL_NAME_KEYS[densityChannel]]: cumulative === false ? 'Density' : 'CDF',
        [ORIGINAL_NAME_KEYS[independent]]:
            typeof channels[independent] === 'string' ? channels[independent] : undefined,
        sort: [{ channel: CHANNELS[independent], order: 'ascending' }],
        data: outData
    } as any;
}

function kde1d(
    values: number[],
    weights: number[],
    atValues: number[],
    kernel: (u: number) => number,
    bw: number,
    cumulative: false | 1 | -1
) {
    const n = values.length;
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const densities = atValues.map((x) => {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const u = (x - values[i]) / bw;
            sum += weights[i] * kernel(u);
        }
        return [x, sum / (weightSum * bw)] as [number, number];
    });

    if (!cumulative) return densities;

    const totalArea = densities.reduce((acc, curr, i) => {
        if (i === 0) return acc;
        const dx = densities[i][0] - densities[i - 1][0];
        return acc + ((densities[i - 1][1] + curr[1]) / 2) * dx;
    }, 0);
    if (totalArea === 0) return densities;

    if (cumulative === -1) {
        let area = 0;
        const cdf: [number, number][] = new Array(densities.length);
        for (let i = densities.length - 1; i >= 0; i--) {
            if (i < densities.length - 1) {
                const dx = densities[i + 1][0] - densities[i][0];
                area += ((densities[i + 1][1] + densities[i][1]) / 2) * dx;
            }
            cdf[i] = [densities[i][0], area / totalArea];
        }
        return cdf;
    }

    let area = 0;
    const cdf: [number, number][] = new Array(densities.length);
    for (let i = 0; i < densities.length; i++) {
        if (i > 0) {
            const dx = densities[i][0] - densities[i - 1][0];
            area += ((densities[i - 1][1] + densities[i][1]) / 2) * dx;
        }
        cdf[i] = [densities[i][0], area / totalArea];
    }
    return cdf;
}

function maybeKernel(kernel: Kernel | string): (u: number) => number {
    if (typeof kernel === 'function') return kernel;
    return isKernelName(kernel) ? KERNEL[kernel] : KERNEL.epanechnikov;
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
