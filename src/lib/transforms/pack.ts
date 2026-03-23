/**
 * Pack layout transform — d3-hierarchy circle-packing wrapper.
 *
 * packNode produces positioned circles (x, y, r) from hierarchical data,
 * suitable for use with Dot marks (using the r channel).
 *
 * @example
 * ```svelte
 * <script>
 *   import { packNode } from 'svelteplot/transforms';
 * </script>
 * <Dot data={flat} {...packNode({ path: 'name', value: 'size' })({ data: flat })} />
 * ```
 */

import { pack as d3Pack, type HierarchyCircularNode } from 'd3-hierarchy';
import { buildHierarchy, cachedLayout, type StratifyOptions } from './hierarchy.js';

// ── Types ──

/** Configuration for pack layout transforms. */
export interface PackOptions extends StratifyOptions {
    /** Layout size [width, height]. @default [1, 1] */
    size?: [number, number];
    /** Padding between circles. @default 0 */
    padding?: number;
    /** Value accessor for sizing circles. @default "value" */
    value?: string | ((d: any) => number);
}

/** A positioned pack node record with circle coordinates. */
export interface PackNodeRecord {
    x: number;
    y: number;
    r: number;
    depth: number;
    height: number;
    value: number;
    [key: string]: any;
    [key: symbol]: any;
}

// ── Internal layout ──

function _computePack(data: Record<string, unknown>[], options: PackOptions = {}) {
    return cachedLayout(data, options, () => {
        const { size = [1, 1], padding, value: valueProp = 'value' } = options;

        const hierarchy = buildHierarchy(data, options);

        const valueAccessor =
            typeof valueProp === 'function' ? valueProp : (d: any) => +(d?.[valueProp] ?? 0);
        hierarchy.sum(valueAccessor);

        const layout = d3Pack<any>().size(size);
        if (padding != null) layout.padding(padding);

        return { root: layout(hierarchy) as HierarchyCircularNode<any> };
    });
}

// ── Transform ──

/**
 * Transform factory for pack-positioned nodes.
 *
 * Returns a transform function that produces positioned circles
 * `{data: PackNodeRecord[], x: 'x', y: 'y', r: 'r'}` for use with Dot marks.
 *
 * @example
 * ```svelte
 * <Dot data={flat} {...packNode({ path: 'name', value: 'size' })({ data: flat })} r="r" />
 * ```
 */
export function packNode(options: PackOptions = {}) {
    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): { data: PackNodeRecord[]; x: string; y: string; r: string; [key: string]: unknown } => {
        const { root } = _computePack(args.data, options);

        const nodes: PackNodeRecord[] = root
            .descendants()
            .map((node: HierarchyCircularNode<any>) => ({
                ...node.data,
                x: node.x,
                y: node.y,
                r: node.r,
                depth: node.depth,
                height: node.height,
                value: node.value ?? 0
            }));

        return { ...args, data: nodes, x: 'x', y: 'y', r: 'r' };
    };
}
