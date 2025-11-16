import type { RawValue } from '$lib/types/index.js';

type Setter = (v: any) => void;

/**
 * Helper function to call a D3 "function class" while also calling
 * property setter functions on the result.
 */
export default function (
    d3func: () => Record<string, Setter>,
    args: RawValue[],
    props: Record<string, RawValue> = {}
) {
    const res = d3func(...args);
    for (const [key, val] of Object.entries(props)) {
        if (typeof res[key] !== 'function') throw new Error(`function ${key} does not exist`);
        res[key](val);
    }
    return res;
}
