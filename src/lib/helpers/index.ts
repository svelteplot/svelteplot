import type {
    BaseMarkProps,
    ChannelAccessor,
    ChannelName,
    DataRecord,
    RawValue
} from '$lib/types.js';
import type { Snippet } from 'svelte';
import { resolveProp } from './resolve.js';
import { isDate } from '$lib/helpers/typeChecks';
import { RAW_VALUE } from '$lib/transforms/recordize.js';

/**
 * Returns first argument that is not null or undefined
 */
export function coalesce(...args: (RawValue | undefined | null)[]) {
    for (const arg of args) {
        if (arg !== null && arg !== undefined) {
            return arg;
        }
    }
    return null; // Return null if all arguments are null or undefined
}

export function testFilter(datum: DataRecord, options: Record<ChannelName, ChannelAccessor>) {
    return (
        options.filter == null ||
        resolveProp(options.filter, datum?.hasOwnProperty(RAW_VALUE) ? datum[RAW_VALUE] : datum)
    );
}

export function randomId() {
    return Math.ceil(1e9 + Math.random() * 1e9).toString(36);
}

export function isSnippet(value: unknown): value is Snippet {
    return typeof value === 'function' && value.length === 1;
}

export function isValid(value: RawValue | undefined): value is number | Date | string {
    return value !== null && value !== undefined && !Number.isNaN(value);
}

export function maybeData(data: DataRecord[]): DataRecord[] {
    // if (data.type === 'FeatureCollection') return data.features;
    return data;
}

export function isObject(option: object | RawValue): option is object {
    // doesn't work with Proxies
    return (
        typeof option === 'object' && !isDate(option) && !Array.isArray(option) && option !== null
    );
}

export function maybeNumber(value: RawValue | null): number | null {
    return value != null ? +value : null;
}

export const constant =
    <T>(x: T) =>
    () =>
        x;

export const POSITION_CHANNELS: Set<ChannelName> = new Set(['x', 'x1', 'x2', 'y', 'y1', 'y2']);

export function parseInset(inset: number | string, width: number) {
    if (typeof inset === 'number') {
        return inset;
    }
    if (inset.endsWith('%')) {
        return (width * +inset.slice(0, -1)) / 100;
    }
    return +inset;
}

export function omit<T extends {}, K extends keyof T>(obj: T, ...keys: K[]) {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key as K))
    ) as Omit<T, K>;
}

export function identity<T>(x: T): T {
    return x;
}
