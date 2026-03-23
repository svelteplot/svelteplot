/**
 * Tree layout transforms — d3-hierarchy tree/cluster wrapper.
 *
 * treeNode and treeLink produce TransformArg-compatible output from
 * hierarchical data, following Observable Plot's two-transform pattern.
 *
 * @example
 * ```svelte
 * <script>
 *   import { treeNode, treeLink } from 'svelteplot/transforms';
 *   const opts = { path: 'name', delimiter: '/' };
 * </script>
 * <Link data={flat} {...treeLink(opts)({ data: flat })} />
 * <Dot  data={flat} {...treeNode(opts)({ data: flat })} />
 * ```
 */

import {
    tree as d3Tree,
    cluster as d3Cluster,
    type HierarchyPointNode,
    type HierarchyPointLink
} from 'd3-hierarchy';

import { buildHierarchy, cachedLayout, type StratifyOptions } from './hierarchy.js';

// ── Types ──

/** Configuration for tree/cluster layout transforms. */
export interface TreeOptions extends StratifyOptions {
    /** Layout algorithm. @default "tree" */
    layout?: 'tree' | 'cluster';
    /** Explicit layout size [width, height]. @default [1, 1] */
    size?: [number, number];
    /** Node separation function. */
    separation?: (a: HierarchyPointNode<any>, b: HierarchyPointNode<any>) => number;
    /** Swap x/y for horizontal layout. @default false */
    horizontal?: boolean;
}

/** A positioned tree node record with layout coordinates. */
export interface TreeNodeRecord {
    x: number;
    y: number;
    depth: number;
    height: number;
    [key: string]: any;
    [key: symbol]: any;
}

/** A tree link record with source/target endpoint coordinates. */
export interface TreeLinkRecord {
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

function _computeTree(data: Record<string, unknown>[], options: TreeOptions = {}) {
    return cachedLayout(data, options, () => {
        const { layout = 'tree', size = [1, 1], separation } = options;
        const hierarchy = buildHierarchy(data, options);

        const layoutFn: any = layout === 'cluster' ? d3Cluster() : d3Tree();
        layoutFn.size(size);
        if (separation) layoutFn.separation(separation);

        return { root: layoutFn(hierarchy) as HierarchyPointNode<any> };
    });
}

// ── TransformArg-compatible wrappers ──

/**
 * Transform factory for tree-positioned nodes.
 *
 * Returns a transform function that takes `{data, ...channels}` and
 * produces `{data: TreeNodeRecord[], x: 'x', y: 'y', ...channels}`.
 *
 * When used alongside `treeLink()` on the same data, the layout runs
 * only once (results are cached by input array reference).
 *
 * @example
 * ```svelte
 * <Dot data={flat} {...treeNode({ path: 'name' })({ data: flat })} />
 * ```
 */
export function treeNode(options: TreeOptions = {}) {
    const { horizontal = false } = options;

    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): { data: TreeNodeRecord[]; x: string; y: string; [key: string]: unknown } => {
        const { root } = _computeTree(args.data, options);

        const nodes: TreeNodeRecord[] = root.descendants().map((node: HierarchyPointNode<any>) => ({
            ...node.data,
            x: horizontal ? node.y : node.x,
            y: horizontal ? node.x : node.y,
            depth: node.depth,
            height: node.height
        }));

        return { ...args, data: nodes, x: 'x', y: 'y' };
    };
}

/**
 * Transform factory for tree-positioned links.
 *
 * Returns a transform function that takes `{data, ...channels}` and
 * produces `{data: TreeLinkRecord[], x1, y1, x2, y2, ...channels}` with
 * link endpoint coordinates embedded on each record.
 *
 * When used alongside `treeNode()` on the same data, the layout runs
 * only once (results are cached by input array reference).
 *
 * @example
 * ```svelte
 * <Link data={flat} {...treeLink({ path: 'name' })({ data: flat })} />
 * ```
 */
export function treeLink(options: TreeOptions = {}) {
    const { horizontal = false } = options;

    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): {
        data: TreeLinkRecord[];
        x1: string;
        y1: string;
        x2: string;
        y2: string;
        [key: string]: unknown;
    } => {
        const { root } = _computeTree(args.data, options);

        const links: TreeLinkRecord[] = root.links().map((link: HierarchyPointLink<any>) => ({
            ...link.target.data,
            source: link.source.data,
            target: link.target.data,
            x1: horizontal ? link.source.y : link.source.x,
            y1: horizontal ? link.source.x : link.source.y,
            x2: horizontal ? link.target.y : link.target.x,
            y2: horizontal ? link.target.x : link.target.y
        }));

        return { ...args, data: links, x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' };
    };
}
