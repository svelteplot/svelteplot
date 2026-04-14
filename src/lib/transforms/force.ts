/**
 * forceLayout — d3-force simulation for graph layout.
 *
 * Takes pre-built nodes and links arrays, runs a force simulation,
 * returns positioned data with x/y coordinates for use with Arrow + Dot marks.
 *
 * Layout utility (not a composable pipeline transform): pure function, no DOM, no Svelte.
 *
 * @example
 * ```ts
 * import { forceLayout } from 'svelteplot/transforms';
 *
 * const { nodes, links } = forceLayout(graph.nodes, graph.links);
 * ```
 */

import {
    forceSimulation,
    forceLink as d3ForceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    forceX,
    forceY,
    forceRadial,
    type Simulation,
    type SimulationNodeDatum
} from 'd3-force';

// ── Types ──

/** A node with computed force-layout positions. */
export interface ForceNode {
    id: string;
    x: number;
    y: number;
    index?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
    [key: string]: any;
    [key: symbol]: any;
}

/** A link between two positioned nodes. */
export interface ForceLayoutLink {
    source: ForceNode;
    target: ForceNode;
    [key: string]: any;
    [key: symbol]: any;
}

/** A link with pre-embedded endpoint coordinates for use with Link/Arrow marks. */
export interface ForceLayoutLinkRecord extends ForceLayoutLink {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

// ── Per-force option types ──

/** Options for forceManyBody (charge). Number shorthand = strength. */
export interface ChargeForceDef {
    /** Attraction (+) or repulsion (−) strength. @default -30 */
    strength?: number;
    /** Barnes–Hut approximation threshold. Lower = more accurate. @default 0.9 */
    theta?: number;
    /** Minimum inter-node distance. Prevents infinite forces. @default 1 */
    distanceMin?: number;
    /** Maximum inter-node distance. Finite values improve perf. @default Infinity */
    distanceMax?: number;
}

/** Options for forceCenter. Number shorthand = strength. */
export interface CenterForceDef {
    /** Center x coordinate. @default 0 */
    x?: number;
    /** Center y coordinate. @default 0 */
    y?: number;
    /** Centering strength. @default 1 */
    strength?: number;
}

/** Options for forceLink. Number shorthand = distance. */
export interface LinkForceDef {
    /** Target link distance. @default 30 */
    distance?: number;
    /** Link strength. @default auto (inverse of min degree) */
    strength?: number;
    /** Constraint iterations per tick. Higher = more rigid. @default 1 */
    iterations?: number;
}

/** Options for forceCollide. Number shorthand = radius. */
export interface CollideForceDef {
    /** Collision radius. @default 1 */
    radius?: number;
    /** Collision strength in [0,1]. @default 1 */
    strength?: number;
    /** Constraint iterations per tick. @default 1 */
    iterations?: number;
}

/** Options for forceX. Number shorthand = target x value. */
export interface XForceDef {
    /** Target x position (or accessor). @default 0 */
    x?: number | ((d: ForceNode) => number);
    /** Force strength in [0,1]. @default 0.1 */
    strength?: number;
}

/** Options for forceY. Number shorthand = target y value. */
export interface YForceDef {
    /** Target y position (or accessor). @default 0 */
    y?: number | ((d: ForceNode) => number);
    /** Force strength in [0,1]. @default 0.1 */
    strength?: number;
}

/** Options for forceRadial. Number shorthand = radius. */
export interface RadialForceDef {
    /** Target radius (or accessor). */
    radius?: number | ((d: ForceNode) => number);
    /** Circle center x. @default 0 */
    x?: number;
    /** Circle center y. @default 0 */
    y?: number;
    /** Force strength in [0,1]. @default 0.1 */
    strength?: number;
}

/** Force simulation configuration. */
export interface ForceLayoutOptions {
    /** Node id field name. @default "id" */
    nodeId?: string;
    /** Maximum number of simulation ticks. @default 300 */
    ticks?: number;
    /** Cooling rate — higher values converge faster with less precision. @default ~0.0228 */
    alphaDecay?: number;
    /** Simulation stops when alpha drops below this. @default 0.001 */
    alphaMin?: number;
    /** Friction/damping in [0,1]. Higher = faster settling, less oscillation. @default 0.4 */
    velocityDecay?: number;

    /** Many-body charge force. Number = strength shorthand. false to disable. @default { strength: -30 } */
    charge?: number | ChargeForceDef | false;
    /** Centering force. Number = strength shorthand. false to disable. @default { strength: 1 } */
    center?: number | CenterForceDef | false;
    /** Link distance force. Number = distance shorthand. false to disable. @default { distance: 30 } */
    link?: number | LinkForceDef | false;
    /** Collision force. Number = radius shorthand. false to disable. Not applied by default. */
    collide?: number | CollideForceDef | false;
    /** X position force. Number = target x value. Not applied by default. */
    x?: number | XForceDef;
    /** Y position force. Number = target y value. Not applied by default. */
    y?: number | YForceDef;
    /** Radial position force. Number = radius. Not applied by default. */
    radial?: number | RadialForceDef;

    /**
     * Customize the simulation after all forces are applied.
     * Use for custom forces or parameters not covered above.
     *
     * @example
     * ```ts
     * forceLayout(nodes, links, {
     *     setup: (sim) => {
     *         // Remove default charge and add a custom one
     *         sim.force('charge', null);
     *     }
     * });
     * ```
     */
    setup?: (sim: Simulation<SimulationNodeDatum, undefined>) => void;
}

/** Result of the force layout transform. */
export interface ForceResult {
    nodes: ForceNode[];
    links: ForceLayoutLink[];
}

// ── Transform ──

/**
 * Run a d3-force simulation on graph data.
 *
 * Clones input nodes and links, resolves link source/target strings to node
 * references, then runs the simulation synchronously until convergence or
 * the tick limit is reached.
 *
 * **Performance:** Runs synchronously on the main thread. Complexity is
 * O(ticks × (n log n + m)) where n = nodes, m = links. For graphs with
 * 500+ nodes, set `charge.distanceMax` to limit charge calculations and
 * reduce `ticks` to avoid blocking the UI.
 */
export function forceLayout(
    nodes: Record<string, unknown>[],
    links: Record<string, unknown>[],
    options: ForceLayoutOptions = {}
): ForceResult {
    const {
        nodeId: idField = 'id',
        ticks = 300,
        alphaDecay: alphaDecayOpt,
        alphaMin: alphaMinOpt,
        velocityDecay: velocityDecayOpt,
        charge,
        center,
        link,
        collide,
        x: xOpt,
        y: yOpt,
        radial: radialOpt,
        setup
    } = options;

    if (!nodes.length) return { nodes: [], links: [] };

    // Clone nodes, adding id and initial positions
    const nCopy: ForceNode[] = nodes.map((n) => {
        const raw = n[idField];
        return { ...n, id: typeof raw === 'string' ? raw : String(raw ?? '') } as ForceNode;
    });

    const byId = new Map<string, ForceNode>();
    for (const n of nCopy) byId.set(n.id, n);

    // Clone links, resolving source/target strings to node references.
    const lCopy: ForceLayoutLink[] = [];
    for (const l of links) {
        const rawSrc = l.source;
        const rawTgt = l.target;
        const source = byId.get(typeof rawSrc === 'string' ? rawSrc : String(rawSrc ?? ''));
        const target = byId.get(typeof rawTgt === 'string' ? rawTgt : String(rawTgt ?? ''));
        if (source && target) lCopy.push({ ...l, source, target });
    }

    const sim: any = forceSimulation(nCopy);
    sim.stop();
    if (alphaDecayOpt != null) sim.alphaDecay(alphaDecayOpt);
    if (alphaMinOpt != null) sim.alphaMin(alphaMinOpt);
    if (velocityDecayOpt != null) sim.velocityDecay(velocityDecayOpt);

    // ── Link force (d3 default: distance=30, strength=auto, iterations=1) ──
    if (link !== false) {
        const opts = link == null ? {} : typeof link === 'number' ? { distance: link } : link;
        const f: any = d3ForceLink(lCopy).id((d: any) => d.id);
        if (opts.distance != null) f.distance(opts.distance);
        if (opts.strength != null) f.strength(opts.strength);
        if (opts.iterations != null) f.iterations(opts.iterations);
        sim.force('link', f);
    }

    // ── Charge force (d3 default: strength=-30, theta=0.9, distanceMin=1, distanceMax=Infinity) ──
    if (charge !== false) {
        const opts =
            charge == null ? {} : typeof charge === 'number' ? { strength: charge } : charge;
        const f: any = forceManyBody();
        if (opts.strength != null) f.strength(opts.strength);
        if (opts.theta != null) f.theta(opts.theta);
        if (opts.distanceMin != null) f.distanceMin(opts.distanceMin);
        if (opts.distanceMax != null) f.distanceMax(opts.distanceMax);
        sim.force('charge', f);
    }

    // ── Center force (d3 default: x=0, y=0, strength=1) ──
    if (center !== false) {
        const opts =
            center == null ? {} : typeof center === 'number' ? { strength: center } : center;
        const f: any = forceCenter(opts.x ?? 0, opts.y ?? 0);
        if (opts.strength != null) f.strength(opts.strength);
        sim.force('center', f);
    }

    // ── Collide force (opt-in, like x/y/radial) ──
    if (collide != null && collide !== false) {
        const opts = typeof collide === 'number' ? { radius: collide } : collide;
        const f = forceCollide(opts.radius);
        if (opts.strength != null) f.strength(opts.strength);
        if (opts.iterations != null) f.iterations(opts.iterations);
        sim.force('collide', f);
    }

    // ── X position force ──
    if (xOpt != null) {
        const opts = typeof xOpt === 'number' ? { x: xOpt } : xOpt;
        const f = forceX(opts.x ?? 0);
        if (opts.strength != null) f.strength(opts.strength);
        sim.force('x', f);
    }

    // ── Y position force ──
    if (yOpt != null) {
        const opts = typeof yOpt === 'number' ? { y: yOpt } : yOpt;
        const f = forceY(opts.y ?? 0);
        if (opts.strength != null) f.strength(opts.strength);
        sim.force('y', f);
    }

    // ── Radial position force ──
    if (radialOpt != null) {
        const opts = typeof radialOpt === 'number' ? { radius: radialOpt } : radialOpt;
        const f = forceRadial(opts.radius ?? 0, opts.x ?? 0, opts.y ?? 0);
        if (opts.strength != null) f.strength(opts.strength);
        sim.force('radial', f);
    }

    if (setup) setup(sim);

    for (let i = 0; i < ticks; i++) {
        sim.tick();
        if (sim.alpha() < sim.alphaMin()) break;
    }

    return { nodes: nCopy, links: lCopy };
}

// ── *Node / *Link transform pair (Observable Plot convention) ──

/**
 * Module-level cache: avoids double-computing when forceNode + forceLink
 * are both called with the same (nodes, links, options) combination.
 *
 * Structure: WeakMap<nodesArray, Map<optionsRef, {links, result}>>
 * - WeakMap key = nodes array (GC-friendly)
 * - Map key = options object reference (distinguishes different configurations)
 * - links validated by reference (same graph = same links array)
 *
 * The paired factories (forceNode/forceLink) must share the same options
 * object reference for caching to work. This is the natural outcome when
 * both are created from the same options variable.
 */
const _forceCache = new WeakMap<
    readonly object[],
    Map<ForceLayoutOptions | undefined, { links: readonly object[]; result: ForceResult }>
>();

function _getOrRun(
    nodes: Record<string, unknown>[],
    links: Record<string, unknown>[],
    options?: ForceLayoutOptions
): ForceResult {
    let byOpts = _forceCache.get(nodes);
    if (byOpts) {
        const cached = byOpts.get(options);
        if (cached && cached.links === links) {
            return cached.result;
        }
    }
    const result = forceLayout(nodes, links, options);
    if (!byOpts) {
        byOpts = new Map();
        _forceCache.set(nodes, byOpts);
    }
    byOpts.set(options, { links, result });
    return result;
}

/**
 * Transform factory for force-positioned nodes.
 *
 * Follows the same convention as `treeNode` — any layout that produces
 * nodes + links gets a `*Node` / `*Link` transform pair. The node
 * transform returns `{data, x: 'x', y: 'y'}` for use with Dot marks.
 *
 * When used alongside `forceLink()` on the same data, the simulation
 * runs only once (cached by input array reference).
 *
 * @example
 * ```ts
 * const nodeArgs = forceNode(graph.links)({ data: graph.nodes });
 * // → { data: ForceNode[], x: 'x', y: 'y' }
 * ```
 */
export function forceNode(links: Record<string, unknown>[], options?: ForceLayoutOptions) {
    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): { data: ForceNode[]; x: string; y: string; [key: string]: unknown } => {
        const result = _getOrRun(args.data, links, options);
        return { ...args, data: result.nodes, x: 'x', y: 'y' };
    };
}

/**
 * Transform factory for force-positioned links.
 *
 * Follows the same convention as `treeLink` — returns
 * `{data, x1, y1, x2, y2}` with accessor functions for use with
 * Arrow or Link marks.
 *
 * When used alongside `forceNode()` on the same data, the simulation
 * runs only once (cached by input array reference).
 *
 * @example
 * ```ts
 * const linkArgs = forceLink(graph.nodes)({ data: graph.links });
 * // → { data: ForceLayoutLinkRecord[], x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' }
 * ```
 */
export function forceLink(nodes: Record<string, unknown>[], options?: ForceLayoutOptions) {
    return <T extends Record<string, unknown>>(args: {
        data: T[];
        [key: string]: unknown;
    }): {
        data: ForceLayoutLinkRecord[];
        x1: string;
        y1: string;
        x2: string;
        y2: string;
        [key: string]: unknown;
    } => {
        const result = _getOrRun(nodes, args.data, options);
        const links: ForceLayoutLinkRecord[] = result.links.map((l) => ({
            ...l,
            x1: l.source.x,
            y1: l.source.y,
            x2: l.target.x,
            y2: l.target.y
        }));
        return {
            ...args,
            data: links,
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2'
        };
    };
}
