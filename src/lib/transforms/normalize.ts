import { mapX, mapY } from './map.js';
import type { TransformArg, RawValue, MapIndexObject } from '../types/index.js';
import { min, max, mean, median, sum, deviation, extent } from 'd3-array';
import { sort } from './sort.js';

type BasisFunction = (I: number[], S: RawValue[]) => number;

type NormalizeBasis =
    | 'deviation'
    | 'first'
    | 'last'
    | 'min'
    | 'max'
    | 'mean'
    | 'median'
    | 'sum'
    | 'extent'
    | BasisFunction
    | MapIndexObject;

type NormalizeOptions = NormalizeBasis | { basis: NormalizeBasis };

/**
 * Normalizes the x values based on the specified basis. Uses mapX.
 */
export function normalizeX<T>(args: TransformArg<T>, options: NormalizeOptions) {
    return mapX(args, normalize(options));
}

/**
 * Normalizes the y values based on the specified basis. Uses mapY.
 */
export function normalizeY<T>(args: TransformArg<T>, options: NormalizeOptions) {
    return mapY(args, normalize(options));
}

function isMapIndex(obj: any): obj is MapIndexObject {
    return obj && typeof obj.mapIndex === 'function';
}

function normalize(options: NormalizeOptions): MapIndexObject {
    if (isMapIndex(options)) return options;
    if (typeof options === 'object' && isMapIndex(options?.basis)) return options?.basis;
    const basis = typeof options === 'object' ? options.basis : options;
    if (basis === undefined) return normalizeFirst;
    if (typeof basis === 'function') return normalizeBasis(basis);
    //   if (/^p\d{2}$/i.test(basis)) return normalizeAccessor(percentile(basis));
    switch (`${basis}`.toLowerCase()) {
        case 'deviation':
            return normalizeDeviation;
        case 'first':
            return normalizeFirst;
        case 'last':
            return normalizeLast;
        case 'max':
            return normalizeMax;
        case 'mean':
            return normalizeMean;
        case 'median':
            return normalizeMedian;
        case 'min':
            return normalizeMin;
        case 'sum':
            return normalizeSum;
        case 'extent':
            return normalizeExtent;
    }
    throw new Error(`invalid basis: ${basis}`);
}

function normalizeBasis(basis: BasisFunction): MapIndexObject {
    return {
        mapIndex(I: number[], S: RawValue[], T: RawValue[]) {
            const b = +basis(I, S);
            for (const i of I) {
                T[i] = S[i] === null ? NaN : (S[i] as number) / b;
            }
        }
    };
}

function normalizeAccessor(f: (I: number[], accessor: (i: number) => any) => number) {
    return normalizeBasis((I, S) => f(I, (i: number) => S[i]));
}

const normalizeExtent: MapIndexObject = {
    mapIndex(I: number[], S: RawValue[], T: RawValue[]) {
        const [s1, s2] = extent(I, (i) => S[i] as number);
        const d = (s2 ?? 0) - (s1 ?? 0);
        for (const i of I) {
            T[i] = S[i] === null ? NaN : ((S[i] as number) - (s1 ?? 0)) / d;
        }
    }
};

const normalizeFirst = normalizeBasis((I: number[], S: RawValue[]) => {
    for (let i = 0; i < I.length; ++i) {
        const s = S[I[i]];
        if (s != null && isFinite(s as number)) return s as number;
    }
    return NaN;
});

const normalizeLast = normalizeBasis((I: number[], S: RawValue[]) => {
    for (let i = I.length - 1; i >= 0; --i) {
        const s = S[I[i]];
        if (s != null && isFinite(s as number)) return s as number;
    }
    return NaN;
});

const normalizeDeviation: MapIndexObject = {
    mapIndex(I: number[], S: RawValue[], T: RawValue[]) {
        const m = mean(I, (i) => S[i] as number);
        const d = deviation(I, (i) => S[i] as number);
        for (const i of I) {
            T[i] = S[i] === null ? NaN : d ? ((S[i] as number) - (m ?? 0)) / d : 0;
        }
    }
};

const normalizeMax = normalizeAccessor(max as any);
const normalizeMean = normalizeAccessor(mean as any);
const normalizeMedian = normalizeAccessor(median as any);
const normalizeMin = normalizeAccessor(min as any);
const normalizeSum = normalizeAccessor(sum as any);

/**
 * Convenience wrapper for normalizeY for parallel coordinates.
 *
 * Channels:
 * - x: the categorical axis (e.g., 'Measurement')
 * - y: the value to normalize (e.g., 'Value')
 * - z: the grouping variable (e.g., 'Id')
 */
export function normalizeParallelY<T>(
    args: TransformArg<T>,
    basis: NormalizeBasis
): TransformArg<T> {
    return sort({
        ...normalizeY(
            {
                ...args,
                // use x as the grouping variable for normalization to normalize
                // each axis independently
                z: args.x
            },
            basis
        ),
        // restore original grouping by line
        z: args.z,
        // sort by original order
        sort: args.z as any
    } as unknown as TransformArg<T>);
}

/**
 * Convenience wrapper for normalizeY for parallel coordinates.
 *
 * Channels:
 * - x: the categorical axis (e.g., 'Measurement')
 * - y: the value to normalize (e.g., 'Value')
 * - z: the grouping variable (e.g., 'Id')
 */
export function normalizeParallelX<T>(
    args: TransformArg<T>,
    basis: NormalizeBasis
): TransformArg<T> {
    return sort({
        ...normalizeX(
            {
                ...args,
                // use x as the grouping variable for normalization to normalize
                // each axis independently
                z: args.y
            },
            basis
        ),
        // restore original grouping by line
        z: args.z,
        // sort by original order
        sort: args.z as any
    } as unknown as TransformArg<T>);
}
