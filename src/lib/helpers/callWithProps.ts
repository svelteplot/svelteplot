import type { RawValue } from '../types/index.js';

type Setter = (v: any) => void;

/**
 * Helper function to call a D3 "function class" while also calling
 * property setter functions on the result.
 */
export default function <T extends object>(
    d3func: (...args: RawValue[]) => T,
    args: RawValue[] = [],
    props: Record<string, RawValue> = {}
): T {
    const res = d3func(...args);
    const resWithKeys = res as Record<string, unknown>;
    for (const [key, val] of Object.entries(props)) {
        const setter = resWithKeys[key];
        if (typeof setter !== 'function') throw new Error(`function ${key} does not exist`);
        (setter as Setter)(val);
    }
    return res;
}
