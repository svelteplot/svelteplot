/**
 * Shared infrastructure for d3-hierarchy layout transforms.
 *
 * Provides stratification (flat data → hierarchy), a cache to avoid
 * double-computing when *Node + *Link pairs share the same data,
 * and base types reused by tree, treemap, pack, and partition.
 */

import { stratify, type HierarchyNode } from 'd3-hierarchy';

// ── Shared stratification options ──

/** Options for converting flat data into a hierarchy via d3-stratify. */
export interface StratifyOptions {
    /** Slash-delimited path accessor for stratify (e.g. "name" or `(d) => d.path`). */
    path?: string | ((d: any) => string);
    /** Path delimiter. @default "/" */
    delimiter?: string;
    /** Id accessor for stratify (alternative to path). */
    id?: string | ((d: any) => string | null | undefined);
    /** Parent-id accessor for stratify (used with id). */
    parentId?: string | ((d: any) => string | null | undefined);
}

// ── Stratify ──

/**
 * Build a d3 hierarchy from flat data using either path-based or id/parentId
 * stratification. Shared by all hierarchy layout transforms.
 */
export function buildHierarchy(
    data: Record<string, unknown>[],
    options: StratifyOptions = {}
): HierarchyNode<any> {
    const { path, delimiter = '/', id, parentId } = options;
    const strat: any = stratify();

    if (path != null) {
        const pathFn = typeof path === 'string' ? (d: any) => d[path] : path;
        // d3-stratify().path() always uses '/' as the delimiter, so we need
        // to replace custom delimiters before passing to d3
        strat.path(
            delimiter !== '/'
                ? (d: any) => {
                        const p = pathFn(d);
                        return p == null ? p : String(p).replaceAll(delimiter, '/');
                    }
                : pathFn
        );
    } else {
        strat.id(id != null ? (typeof id === 'string' ? (d: any) => d[id] : id) : (d: any) => d.id);
        strat.parentId(
            parentId != null
                ? typeof parentId === 'string'
                    ? (d: any) => d[parentId]
                    : parentId
                : (d: any) => d.parentId
        );
    }

    return strat(data);
}

// ── Layout cache ──

/**
 * Module-level cache: avoids double-computing when *Node + *Link pairs
 * are both called with the same data array reference and options.
 *
 * Structure: WeakMap<dataArray, Map<optionsRef, result>>
 * - WeakMap key = data array (GC-friendly)
 * - Map key = options object reference (distinguishes different configurations)
 *
 * Paired factories (*Node/*Link) must share the same options object
 * reference for caching to work — the natural outcome when both are
 * created from the same options variable.
 */
const _hierarchyCache = new WeakMap<readonly object[], Map<object | undefined, any>>();

/**
 * Get a cached layout result or compute it via the provided function.
 * The cache keys on (data array ref, options object ref).
 */
export function cachedLayout<TOptions extends object | undefined, TResult>(
    data: Record<string, unknown>[],
    options: TOptions,
    compute: () => TResult
): TResult {
    let byOpts = _hierarchyCache.get(data);
    if (byOpts) {
        const cached = byOpts.get(options);
        if (cached) return cached as TResult;
    }
    const result = compute();
    if (!byOpts) {
        byOpts = new Map();
        _hierarchyCache.set(data, byOpts);
    }
    byOpts.set(options, result);
    return result;
}
