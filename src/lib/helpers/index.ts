import type {
    ChannelAccessor,
    ChannelName,
    Channels,
    ConstantAccessor,
    DataRecord,
    RawValue
} from '../types/index.js';
import type { Snippet } from 'svelte';
import { resolveProp } from './resolve.js';
import { isDate } from './typeChecks.js';

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

export function testFilter<T>(datum: T, options: Channels<T>) {
    return options.filter == null || resolveProp(options.filter as ConstantAccessor<T>, datum);
}

export function randomId() {
    return Math.ceil(1e9 + Math.random() * 1e9).toString(36);
}

export function isSnippet(value: unknown): value is Snippet {
    return typeof value === 'function' && value.length === 1;
}

export function isValid(value: RawValue | undefined): value is number | Date | string {
    return (
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value) &&
        (typeof value !== 'number' || Number.isFinite(value))
    );
}

export function isObject<T>(option: object | T): option is object {
    // doesn't work with Proxies
    return (
        typeof option === 'object' && !isDate(option) && !Array.isArray(option) && option !== null
    );
}

const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function maybeNumber(value: any): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        // only accept numeric strings
        if (NUMERIC.test(value.trim())) {
            return parseFloat(value);
        }
    }
    return null;
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

export const GEOJSON_PREFER_STROKE = new Set(['MultiLineString', 'LineString']);
