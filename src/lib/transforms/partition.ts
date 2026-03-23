/**
 * Partition layout transform — d3-hierarchy wrapper for icicle/sunburst diagrams.
 *
 * partitionNode and partitionLink produce rectangular regions and parent-child
 * links from hierarchical data, following the *Node/*Link paired convention.
 *
 * @example
 * ```svelte
 * <script>
 *   import { partitionNode, partitionLink } from 'svelteplot/transforms';
 *   const opts = { path: 'name', value: 'size' };
 * </script>
 * <RectXY data={flat} {...partitionNode(opts)({ data: flat })} fill="depth" />
 * ```
 */

import { partition as d3Partition, type HierarchyRectangularNode } from 'd3-hierarchy';
import type { HierarchyRectangularLink } from 'd3-hierarchy';
import { buildHierarchy, cachedLayout, type StratifyOptions } from './hierarchy.js';

// ── Types ──

/** Configuration for partition layout transforms. */
export interface PartitionOptions extends StratifyOptions {
    /** Layout size [width, height]. @default [1, 1] */
    size?: [number, number];
    /** Padding between nodes. @default 0 */
    padding?: number;
    /** Whether to round coordinates to integers. @default false */
    round?: boolean;
    /** Value accessor for sizing partitions. @default "value" */
    value?: string | ((d: any) => number);
    /** Swap x/y for horizontal layout. @default false */
    horizontal?: boolean;
}

/** A positioned partition node record with rectangular bounds. */
export interface PartitionNodeRecord {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    depth: number;
    height: number;
    value: number;
    [key: string]: any;
    [key: symbol]: any;
}

/** A partition link record with source/target endpoint coordinates. */
export interface PartitionLinkRecord {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    source: any;
    target: any;
    [key: string]: any;
    [key: symbol]: any;
}

// ── Internal layout ──

function _computePartition(data: Record<string, unknown>[], options: PartitionOptions = {}) {
    return cachedLayout(data, options, () => {
        const { size = [1, 1], padding, round = false, value: valueProp = 'value' } = options;

        const hierarchy = buildHierarchy(data, options);

        const valueAccessor =
            typeof valueProp === 'function' ? valueProp : (d: any) => +(d?.[valueProp] ?? 0);
        hierarchy.sum(valueAccessor);

        const layout = d3Partition<any>().size(size).round(round);
        if (padding != null) layout.padding(padding);

        return { root: layout(hierarchy) as HierarchyRectangularNode<any> };
    });
}

// ── Transforms ──

/**
 * Transform factory for partition-positioned nodes.
 *
 * Returns a transform function that produces rectangular regions
 * `{data: PartitionNodeRecord[], x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1'}`
 * for use with RectXY or Cell marks.
 *
 * When used alongside `partitionLink()` on the same data, the layout runs
 * only once (results are cached by input array reference).
 *
 * @example
 * ```svelte
 * <RectXY data={flat} {...partitionNode({ path: 'name', value: 'size' })({ data: flat })} />
 * ```
 */
export function partitionNode(options: PartitionOptions = {}) {
    const { horizontal = false } = options;

    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): {
        data: PartitionNodeRecord[];
        x1: string;
        y1: string;
        x2: string;
        y2: string;
        [key: string]: unknown;
    } => {
        const { root } = _computePartition(args.data, options);

        const nodes: PartitionNodeRecord[] = root
            .descendants()
            .map((node: HierarchyRectangularNode<any>) => ({
                ...node.data,
                x0: horizontal ? node.y0 : node.x0,
                y0: horizontal ? node.x0 : node.y0,
                x1: horizontal ? node.y1 : node.x1,
                y1: horizontal ? node.x1 : node.y1,
                depth: node.depth,
                height: node.height,
                value: node.value ?? 0
            }));

        return { ...args, data: nodes, x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1' };
    };
}

/**
 * Transform factory for partition-positioned links.
 *
 * Returns a transform function that produces parent-child link records
 * with midpoint coordinates for use with Link marks.
 *
 * When used alongside `partitionNode()` on the same data, the layout runs
 * only once (results are cached by input array reference).
 *
 * @example
 * ```svelte
 * <Link data={flat} {...partitionLink({ path: 'name', value: 'size' })({ data: flat })} />
 * ```
 */
export function partitionLink(options: PartitionOptions = {}) {
    const { horizontal = false } = options;

    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): {
        data: PartitionLinkRecord[];
        x1: string;
        y1: string;
        x2: string;
        y2: string;
        [key: string]: unknown;
    } => {
        const { root } = _computePartition(args.data, options);

        const links: PartitionLinkRecord[] = (root.links() as HierarchyRectangularLink<any>[]).map(
            (link) => {
                const s = link.source;
                const t = link.target;
                // Link from center of parent to center of child
                const sx = (s.x0 + s.x1) / 2;
                const sy = (s.y0 + s.y1) / 2;
                const tx = (t.x0 + t.x1) / 2;
                const ty = (t.y0 + t.y1) / 2;
                return {
                    ...t.data,
                    source: s.data,
                    target: t.data,
                    x1: horizontal ? sy : sx,
                    y1: horizontal ? sx : sy,
                    x2: horizontal ? ty : tx,
                    y2: horizontal ? tx : ty
                };
            }
        );

        return { ...args, data: links, x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' };
    };
}
