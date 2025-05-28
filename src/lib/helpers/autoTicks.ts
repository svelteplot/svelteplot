import type { RawValue, ScaleType } from '$lib/types.js';
import { maybeTimeInterval } from './time.js';
import { extent, range as rangei } from 'd3-array';

export function maybeInterval(interval: null | number | string | (<T>(d: T) => T)) {
    if (interval == null) return;
    if (typeof interval === 'number') {
        if (0 < interval && interval < 1 && Number.isInteger(1 / interval))
            interval = -1 / interval;
        const n = Math.abs(interval);
        return interval < 0
            ? {
                  floor: (d) => Math.floor(d * n) / n,
                  round: (d) => Math.round(d * n) / n,
                  offset: (d) => (d * n + 1) / n, // note: no optional step for simplicity
                  range: (lo, hi) => rangei(Math.ceil(lo * n), hi * n).map((x) => x / n)
              }
            : {
                  floor: (d) => Math.floor(d / n) * n,
                  round: (d) => Math.round(d / n) * n,
                  offset: (d) => d + n, // note: no optional step for simplicity
                  range: (lo, hi) => rangei(Math.ceil(lo / n), hi / n).map((x) => x * n)
              };
    }
    if (typeof interval === 'string') return maybeTimeInterval(interval);
    if (typeof interval.floor !== 'function')
        throw new Error('invalid interval; missing floor method');
    if (typeof interval.offset !== 'function')
        throw new Error('invalid interval; missing offset method');
    return interval;
}

export function autoTicks(
    type: ScaleType,
    ticks: RawValue[],
    interval: string | number | null,
    domain: RawValue[],
    scaleFn,
    count: number
) {
    if (ticks) return ticks;
    if (interval) {
        const [lo, hi] = extent(domain);
        const I = maybeInterval(interval, type);
        return I.range(lo, I.offset(hi));
    }
    return typeof scaleFn.ticks === 'function' ? scaleFn.ticks(count) : [];
}
