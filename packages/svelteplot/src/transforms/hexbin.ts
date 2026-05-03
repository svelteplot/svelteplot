import { resolveChannel } from '../helpers/resolve.js';
import { extent } from 'd3-array';
import { reduceOutputs, type ReducerName } from '../helpers/reduce.js';
import { groupFacetsAndZ } from '../helpers/group.js';
import { hexLattice, pointToHex } from '../helpers/hexLattice.js';
import type { DataRecord, RawValue, TransformArg } from '../types/index.js';

type ReducerOption = ReducerName | ((group: DataRecord[]) => RawValue);

type HexbinOutputChannels = Partial<{
    fill: ReducerOption;
    stroke: ReducerOption;
    r: ReducerOption;
    opacity: ReducerOption;
    fillOpacity: ReducerOption;
    strokeOpacity: ReducerOption;
}>;

export type HexbinOptions = HexbinOutputChannels & {
    /**
     * Approximate number of hex bins along the x-axis.
     * The actual bin width is computed from the data extent.
     * Default: 20.
     */
    bins?: number;
    /**
     * Explicit bin width in data units. Overrides `bins` if set.
     */
    binWidth?: number;
};

const CHANNELS = {
    x: Symbol('hexbin_x'),
    y: Symbol('hexbin_y')
};

interface HexBin {
    /** data indices belonging to this bin */
    index: number[];
    /** bin center x in data units */
    cx: number;
    /** bin center y in data units */
    cy: number;
}

/**
 * Bins data points into hexagonal cells and applies reducers to produce
 * aggregated output channels (e.g. fill="count", r="count").
 *
 * Usage:
 * ```svelte
 * <Dot {...hexbin(
 *     { data: penguins, x: "culmen_length_mm", y: "culmen_depth_mm" },
 *     { fill: "count", r: "count", bins: 15 }
 * )} symbol="hexagon" />
 * ```
 */
export function hexbin(
    { data, ...channels }: TransformArg<DataRecord>,
    options: HexbinOptions = {}
): TransformArg<DataRecord> {
    const { bins = 20, binWidth: explicitBinWidth, ...reducerOptions } = options;

    if (channels.x == null || channels.y == null) {
        throw new Error('hexbin requires both x and y channels');
    }

    // Resolve x, y values from data
    const xValues = data.map((d) => resolveChannel('x', d, channels) as number);
    const yValues = data.map((d) => resolveChannel('y', d, channels) as number);

    const [xMin, xMax] = extent(xValues) as [number, number];
    const [yMin, yMax] = extent(yValues) as [number, number];

    if (xMin == null || yMin == null) {
        return { data: [], ...channels, x: CHANNELS.x, y: CHANNELS.y };
    }

    // Cell pitch in data units. Pointy-topped hex with regular geometry — dy
    // derived from dx, so dy is in the same data units as dx. Cells are visually
    // regular only when the data units happen to match across axes; for
    // pixel-correct cells under arbitrary data extents, use the <Hexbin> mark
    // instead, which builds its lattice in pixel space after scales exist.
    const dx = explicitBinWidth ?? (xMax - xMin) / Math.max(1, bins);
    const lattice = hexLattice(dx, xMin + dx / 2, yMin);

    const binMap = new Map<string, HexBin>();

    for (let i = 0; i < data.length; i++) {
        const px = xValues[i];
        const py = yValues[i];
        if (px == null || py == null || isNaN(px) || isNaN(py)) continue;

        const { i: pi, j: pj, cx, cy } = pointToHex(px, py, lattice);
        const key = `${pi},${pj}`;
        let bin = binMap.get(key);
        if (!bin) {
            bin = { index: [], cx, cy };
            binMap.set(key, bin);
        }
        bin.index.push(i);
    }

    // Build output data from bins
    const xChannel = typeof channels.x === 'string' ? channels.x : '__hexbin_x';
    const yChannel = typeof channels.y === 'string' ? channels.y : '__hexbin_y';

    let newChannels = {
        ...channels,
        x: xChannel,
        y: yChannel
    };

    const outputs = ['fill', 'stroke', 'r', 'opacity', 'fillOpacity', 'strokeOpacity'];
    const newData: DataRecord[] = [];

    for (const [, bin] of binMap) {
        const items = bin.index.map((i) => data[i]);

        const newGroupChannels = groupFacetsAndZ(items, channels, (groupItems, groupProps) => {
            const item: DataRecord = {
                [xChannel]: bin.cx as RawValue,
                [yChannel]: bin.cy as RawValue,
                ...(groupProps as Record<string | symbol, RawValue>)
            };
            reduceOutputs(
                item,
                groupItems,
                reducerOptions as any,
                outputs as any,
                channels as any,
                newChannels as any
            );
            newData.push(item);
        });

        newChannels = { ...newChannels, ...newGroupChannels };
    }

    return { data: newData, ...newChannels };
}
