/**
 * Treemap layout transform — d3-hierarchy wrapper for treemap diagrams.
 *
 * treemapNode produces rectangular regions (x0, y0, x1, y1) from
 * hierarchical data, suitable for use with RectXY or Cell marks.
 *
 * @example
 * ```svelte
 * <script>
 *   import { treemapNode } from 'svelteplot/transforms';
 * </script>
 * <RectXY data={flat} {...treemapNode({ path: 'name' })({ data: flat })} />
 * ```
 */

import {
    treemap as d3Treemap,
    treemapSquarify,
    treemapBinary,
    treemapDice,
    treemapSlice,
    treemapSliceDice
} from 'd3-hierarchy';
import type { HierarchyRectangularNode, RatioSquarifyTilingFactory } from 'd3-hierarchy';
import { buildHierarchy, cachedLayout, type StratifyOptions } from './hierarchy.js';

// ── Types ──

/** Tiling strategy for treemap layout. */
export type TreemapTile = 'squarify' | 'binary' | 'dice' | 'slice' | 'sliceDice';

/** Configuration for treemap layout transforms. */
export interface TreemapOptions extends StratifyOptions {
    /** Layout size [width, height]. @default [1, 1] */
    size?: [number, number];
    /** Inner padding between siblings. @default 0 */
    padding?: number;
    /** Outer padding around the treemap. @default 0 */
    paddingOuter?: number;
    /** Padding between parent and children. @default 0 */
    paddingTop?: number;
    /** Tiling algorithm. @default "squarify" */
    tile?: TreemapTile;
    /** Target aspect ratio for squarify tiling. @default golden ratio */
    ratio?: number;
    /** Whether to round coordinates to integers. @default false */
    round?: boolean;
    /** Value accessor for sizing rectangles. @default "value" */
    value?: string | ((d: any) => number);
}

/** A positioned treemap node record with rectangular bounds. */
export interface TreemapNodeRecord {
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

// ── Tile strategy resolution ──

function _resolveTile(tile: TreemapTile = 'squarify', ratio?: number) {
    switch (tile) {
        case 'squarify': {
            const fn = treemapSquarify as RatioSquarifyTilingFactory;
            return ratio != null ? fn.ratio(ratio) : fn;
        }
        case 'binary':
            return treemapBinary;
        case 'dice':
            return treemapDice;
        case 'slice':
            return treemapSlice;
        case 'sliceDice':
            return treemapSliceDice;
        default:
            return treemapSquarify;
    }
}

// ── Layout ──

/**
 * Run a treemap layout on flat data.
 *
 * Returns the d3 hierarchy root with rectangular bounds (x0/y0/x1/y1)
 * assigned. Results are cached by (data, options) reference.
 *
 * Use `treemapNode` for the TransformArg-compatible wrapper.
 */
export function treemapLayout(data: Record<string, unknown>[], options: TreemapOptions = {}) {
    return cachedLayout(data, options, () => {
        const {
            size = [1, 1],
            padding,
            paddingOuter,
            paddingTop,
            tile,
            ratio,
            round = false,
            value: valueProp = 'value'
        } = options;

        const hierarchy = buildHierarchy(data, options);

        // Sum values for sizing
        const valueAccessor =
            typeof valueProp === 'function' ? valueProp : (d: any) => +(d?.[valueProp] ?? 0);
        hierarchy.sum(valueAccessor);

        const layout = d3Treemap<any>().size(size).round(round);
        // Normalize padding as a fraction of layout size so padding: 0.01
        // always means 1% regardless of whether size is [1,1] or [500,500]
        const scale = Math.min(size[0], size[1]);
        if (padding != null) layout.padding(padding * scale);
        if (paddingOuter != null) layout.paddingOuter(paddingOuter * scale);
        if (paddingTop != null) layout.paddingTop(paddingTop * scale);
        layout.tile(_resolveTile(tile, ratio));

        return { root: layout(hierarchy) as HierarchyRectangularNode<any> };
    });
}

// ── Transform ──

/**
 * Transform factory for treemap-positioned nodes.
 *
 * Returns a transform function that produces rectangular regions
 * `{data: TreemapNodeRecord[], x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1'}`
 * for use with RectXY or Cell marks.
 *
 * @example
 * ```svelte
 * <RectXY data={flat} {...treemapNode({ path: 'name', value: 'size' })({ data: flat })} />
 * ```
 */
export function treemapNode(options: TreemapOptions = {}) {
    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): {
        data: TreemapNodeRecord[];
        x1: string;
        y1: string;
        x2: string;
        y2: string;
        [key: string]: unknown;
    } => {
        const { root } = treemapLayout(args.data, options);

        const nodes: TreemapNodeRecord[] = root
            .descendants()
            .map((node: HierarchyRectangularNode<any>) => ({
                ...node.data,
                x0: node.x0,
                y0: node.y0,
                x1: node.x1,
                y1: node.y1,
                depth: node.depth,
                height: node.height,
                value: node.value ?? 0
            }));

        return { ...args, data: nodes, x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1' };
    };
}
