import { resolveChannel } from '../helpers/resolve.js';
import { extent } from 'd3-array';
import { reduceOutputs, type ReducerName } from '../helpers/reduce.js';
import { groupFacetsAndZ } from '../helpers/group.js';
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

const sqrt3 = Math.sqrt(3);

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

    // Compute hex cell width in data units
    const dx = explicitBinWidth ?? (xMax - xMin) / Math.max(1, bins);
    // Vertical spacing between hex centers (pointy-topped hexagons)
    const dy = (dx * 1.5) / sqrt3;

    // Hex offset to avoid edge alignment
    const ox = dx * 0.5;
    const oy = 0;

    // Bin data into hex cells
    const binMap = new Map<string, HexBin>();

    for (let i = 0; i < data.length; i++) {
        const px = xValues[i];
        const py = yValues[i];
        if (px == null || py == null || isNaN(px) || isNaN(py)) continue;

        // Convert to hex grid coordinates
        let pj = Math.round((py - yMin - oy) / dy);
        let pi = Math.round((px - xMin - ox - (pj & 1) * (dx / 2)) / dx);

        // Snap to nearest hex center and check if an adjacent cell is closer
        const cx0 = (pi + (pj & 1) / 2) * dx + ox + xMin;
        const cy0 = pj * dy + oy + yMin;

        // Check the two candidate rows
        const pj1 = pj + 1;
        const pi1 = Math.round((px - xMin - ox - (pj1 & 1) * (dx / 2)) / dx);
        const cx1 = (pi1 + (pj1 & 1) / 2) * dx + ox + xMin;
        const cy1 = pj1 * dy + oy + yMin;

        const pj2 = pj - 1;
        const pi2 = Math.round((px - xMin - ox - (pj2 & 1) * (dx / 2)) / dx);
        const cx2 = (pi2 + (pj2 & 1) / 2) * dx + ox + xMin;
        const cy2 = pj2 * dy + oy + yMin;

        const d0 = (px - cx0) ** 2 + (py - cy0) ** 2;
        const d1 = (px - cx1) ** 2 + (py - cy1) ** 2;
        const d2 = (px - cx2) ** 2 + (py - cy2) ** 2;

        if (d1 < d0 && d1 < d2) {
            pj = pj1;
            pi = pi1;
        } else if (d2 < d0 && d2 < d1) {
            pj = pj2;
            pi = pi2;
        }

        const key = `${pi},${pj}`;
        let bin = binMap.get(key);
        if (!bin) {
            const cx = (pi + (pj & 1) / 2) * dx + ox + xMin;
            const cy = pj * dy + oy + yMin;
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
                ...groupProps
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
