import type { RawValue, ScaleType } from '../types/index.js';
import { maybeTimeInterval, maybeUtcInterval } from './time.js';
import { extent, range as rangei } from 'd3-array';

export type IntervalLike = {
    floor: (d: number) => number;
    round?: (d: number) => number;
    offset: (d: number, step?: number) => number;
    range: (lo: number, hi: number) => number[];
};

export function maybeInterval(interval: null | number | string | IntervalLike, scaleType?: string) {
    if (interval == null) return;
    if (typeof interval === 'number') {
        if (0 < interval && interval < 1 && Number.isInteger(1 / interval))
            interval = -1 / interval;
        const n = Math.abs(interval);
        return interval < 0
            ? {
                  floor: (d: number) => Math.floor(d * n) / n,
                  round: (d: number) => Math.round(d * n) / n,
                  offset: (d: number) => (d * n + 1) / n, // note: no optional step for simplicity
                  range: (lo: number, hi: number) =>
                      rangei(Math.ceil(lo * n), hi * n).map((x) => x / n)
              }
            : {
                  floor: (d: number) => Math.floor(d / n) * n,
                  round: (d: number) => Math.round(d / n) * n,
                  offset: (d: number) => d + n, // note: no optional step for simplicity
                  range: (lo: number, hi: number) =>
                      rangei(Math.ceil(lo / n), hi / n).map((x) => x * n)
              };
    }
    if (typeof interval === 'string')
        return scaleType === 'utc' ? maybeUtcInterval(interval) : maybeTimeInterval(interval);
    if (typeof interval.floor !== 'function')
        throw new Error('invalid interval; missing floor method');
    if (typeof interval.offset !== 'function')
        throw new Error('invalid interval; missing offset method');
    return interval;
}

export function autoTicks(
    type: ScaleType,
    ticks: RawValue[] | undefined,
    interval: string | number | null | undefined,
    domain: RawValue[],
    scaleFn: { ticks?: (count: number) => RawValue[] },
    count: number
) {
    if (ticks) return ticks;
    if (interval) {
        const [lo, hi] = extent(domain as number[]);
        if (lo == null || hi == null) return [];
        const I = maybeInterval(interval, type) as IntervalLike | undefined;
        if (!I) return [];
        return I.range(lo, I.offset(hi)).filter((d) => d >= lo && d <= hi);
    }
    return typeof scaleFn.ticks === 'function' ? scaleFn.ticks(count) : [];
}
