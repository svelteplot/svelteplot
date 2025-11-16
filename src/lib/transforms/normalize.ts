import { mapX, mapY } from './map.js';
import type { TransformArg, RawValue, MapIndexObject } from '$lib/types/index.js';
import { min, max, mean, median, sum, deviation, extent } from 'd3-array';

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
    | MapIndexObject;

export function normalizeX<T>(args: TransformArg<T>, basis: NormalizeBasis) {
    return mapX(args, normalize(basis));
}

export function normalizeY<T>(args: TransformArg<T>, basis: NormalizeBasis) {
    return mapY(args, normalize(basis));
}

function normalize(basis: NormalizeBasis): MapIndexObject {
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

function normalizeBasis(basis: (I: number[], S: RawValue[]) => number): MapIndexObject {
    return {
        mapIndex(I, S, T) {
            const b = +basis(I, S);
            for (const i of I) {
                T[i] = S[i] === null ? NaN : S[i] / b;
            }
        }
    };
}

function normalizeAccessor(f) {
    return normalizeBasis((I, S) => f(I, (i) => S[i]));
}

const normalizeExtent: MapIndexObject = {
    mapIndex(I, S, T) {
        const [s1, s2] = extent(I, (i) => S[i]);
        const d = s2 - s1;
        for (const i of I) {
            T[i] = S[i] === null ? NaN : (S[i] - s1) / d;
        }
    }
};

const normalizeFirst = normalizeBasis((I, S) => {
    for (let i = 0; i < I.length; ++i) {
        const s = S[I[i]];
        if (s != null && isFinite(s)) return s;
    }
});

const normalizeLast = normalizeBasis((I, S) => {
    for (let i = I.length - 1; i >= 0; --i) {
        const s = S[I[i]];
        if (s != null && isFinite(s)) return s;
    }
});

const normalizeDeviation = {
    mapIndex(I, S, T) {
        const m = mean(I, (i) => S[i]);
        const d = deviation(I, (i) => S[i]);
        for (const i of I) {
            T[i] = S[i] === null ? NaN : d ? (S[i] - m) / d : 0;
        }
    }
};

const normalizeMax = normalizeAccessor(max);
const normalizeMean = normalizeAccessor(mean);
const normalizeMedian = normalizeAccessor(median);
const normalizeMin = normalizeAccessor(min);
const normalizeSum = normalizeAccessor(sum);
