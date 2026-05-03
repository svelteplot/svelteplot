<!-- @component
    Renders a hexagonal binning of 2D scatter data: groups raw points into a
    pixel-space hex lattice, runs a reducer per bin, and draws each non-empty
    bin as a regular hexagonal cell. Cells are regular by construction because
    the lattice is computed in pixel space (after scales exist) rather than in
    data space, so they tile correctly under any axis aspect ratio.

    Pairs naturally with the data-less `<Hexgrid />` mark for an empty-cell
    backdrop — both default to `binWidth=20` (px), so a default `<Hexbin>` and
    a default `<Hexgrid>` align by convention without user coordination.

    The `fill` prop accepts a reducer name (`'count'`, `'mean'`, etc.) to map
    aggregated values through the plot's color scale, or a CSS color for a
    constant fill. Same shape for `stroke`.
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface HexbinMarkProps {
        /** Input data — array of records with x/y positions. */
        data?: Datum[] | null;
        /** x position channel (data space). */
        x?: ChannelAccessor<Datum>;
        /** y position channel (data space). */
        y?: ChannelAccessor<Datum>;
        /** horizontal facet channel — bins are computed independently per facet. */
        fx?: ChannelAccessor<Datum>;
        /** vertical facet channel — bins are computed independently per facet. */
        fy?: ChannelAccessor<Datum>;
        /**
         * Hex cell pitch in pixels (distance between adjacent cell centers
         * along x). Default 20, matching `<Hexgrid />`.
         */
        binWidth?: number;
        /**
         * Fill: a reducer name (`'count'`, `'mean'`, …) to map aggregated
         * values through the color scale, OR a CSS color for a constant fill.
         * Default `'count'` (maps bin counts through the color scale).
         */
        fill?: ReducerName | string;
        /** Stroke: same shape as `fill`. Default `'none'`. */
        stroke?: ReducerName | string;
        strokeWidth?: number;
        fillOpacity?: number;
        strokeOpacity?: number;
        opacity?: number;
        clipPath?: string;
        class?: string;
    }

    import Mark from '../Mark.svelte';
    import { usePlot } from '../hooks/usePlot.svelte.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { reduceOutputs, type ReducerName } from '../helpers/reduce.js';
    import { resolveProp } from '../helpers/resolve.js';
    import { isColorOrNull } from '../helpers/typeChecks.js';
    import {
        hexLattice,
        pointToHex,
        hexagonSubpath,
        HEX_DEFAULT_BIN_WIDTH
    } from '../helpers/hexLattice.js';
    import type {
        ChannelAccessor,
        DataRecord,
        MarkType,
        ScaledDataRecord
    } from '../types/index.js';

    // Per-record symbols for the synthetic data passed to <Mark>. Density
    // uses the same pattern (Density.svelte:108-115) — the scale system reads
    // channel values via Symbol-keyed accessors, so user data fields can't
    // collide with our internal channels. Hexbin uses x/y point channels
    // (not Density's x1/x2/y1/y2 range channels) because a bin IS a point;
    // CHANNEL_SCALE maps both to the same x/y scale (see constants.ts:110).
    const GEOM = Symbol('hexbin_geom');
    const X_VAL = Symbol('hexbin_x');
    const Y_VAL = Symbol('hexbin_y');
    const FILL_VAL = Symbol('hexbin_fill');
    const STROKE_VAL = Symbol('hexbin_stroke');
    const FX_VAL = Symbol('hexbin_fx');
    const FY_VAL = Symbol('hexbin_fy');

    const DEFAULTS = {
        ...getPlotDefaults().hexbin
    };

    let markProps: HexbinMarkProps = $props();

    const {
        data,
        x: xAcc,
        y: yAcc,
        fx: fxAcc,
        fy: fyAcc,
        binWidth = HEX_DEFAULT_BIN_WIDTH,
        fill: rawFill = 'count',
        stroke: rawStroke = 'none',
        strokeWidth,
        fillOpacity,
        strokeOpacity,
        opacity,
        clipPath,
        class: className = 'hexbin',
        ...options
    }: HexbinMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    // A fill/stroke value is a reducer when it's a function or a string that
    // looks like a reducer name rather than a CSS color. Mirrors Density's
    // isDensityAccessor logic (Density.svelte:159-175).
    function isReducer(v: unknown): boolean {
        if (typeof v === 'function') return true;
        if (typeof v !== 'string') return false;
        const lower = v.toLowerCase();
        if (lower === 'none' || lower === 'inherit' || lower === 'currentcolor') return false;
        return !isColorOrNull(v);
    }

    const fillIsReducer = $derived(isReducer(rawFill));
    const strokeIsReducer = $derived(isReducer(rawStroke));

    // Raw data extent in data units, used to bootstrap x/y scale domains
    // before bins are computed (the chicken-and-egg: bins need pixel-space
    // scales, scales need a domain). Same approach as Density.svelte:385-426.
    const extent = $derived.by(() => {
        if (!data?.length || xAcc == null || yAcc == null) return null;
        let xMin = Infinity,
            xMax = -Infinity,
            yMin = Infinity,
            yMax = -Infinity;
        for (const d of data as any[]) {
            const xv = resolveProp(xAcc as any, d);
            const yv = resolveProp(yAcc as any, d);
            if (typeof xv === 'number' && Number.isFinite(xv)) {
                if (xv < xMin) xMin = xv;
                if (xv > xMax) xMax = xv;
            }
            if (typeof yv === 'number' && Number.isFinite(yv)) {
                if (yv < yMin) yMin = yv;
                if (yv > yMax) yMax = yv;
            }
        }
        if (!isFinite(xMin) || !isFinite(yMin)) return null;
        return { x1: xMin, x2: xMax, y1: yMin, y2: yMax };
    });

    // Pixel-space binning. Builds a regular hex lattice from binWidth (px),
    // projects each raw point through the live x/y scales to pixel space,
    // and snaps to the nearest hex center via pointToHex. Returns null on
    // the bootstrap pass (before scales are computable).
    //
    // Faceting: when fx/fy accessors are provided, raw records are partitioned
    // by (fxVal, fyVal) before binning so each facet panel gets independent
    // bin counts. The lattice itself stays single-source — Mark.svelte applies
    // the per-facet group transform at render time, and pointToHex outputs in
    // plot-global pixel space (same as scales.x/y.fn). Mirrors Density's
    // group-by-facet pattern (Density.svelte:272-286).
    type Bin = {
        i: number;
        j: number;
        cx: number;
        cy: number;
        items: any[];
        fxVal: any;
        fyVal: any;
    };
    const binResult = $derived.by(() => {
        if (!data?.length || xAcc == null || yAcc == null) return null;
        const sx = plot.scales.x?.fn as ((v: any) => number) | undefined;
        const sy = plot.scales.y?.fn as ((v: any) => number) | undefined;
        if (!sx || !sy) return null;

        const ml = plot.options.marginLeft ?? 0;
        const mt = plot.options.marginTop ?? 0;
        // Origin matches Hexgrid (Hexgrid.svelte:53) and the existing hexbin
        // transform (transforms/hexbin.ts:85) so a default Hexbin and a default
        // Hexgrid tile the same lattice without coordination. Cell (0,0)
        // straddles the top-left corner — symmetric with the X half-pitch
        // offset, which puts the cell half-inside the left edge.
        const lattice = hexLattice(binWidth, ml + binWidth / 2, mt);

        // Two-level map: (fxVal, fyVal) → (i, j) → bin. Single outer entry
        // when not faceted.
        const groups = new Map<string, Map<string, Bin>>();
        const facetKeys: { key: string; fxVal: any; fyVal: any }[] = [];
        for (const d of data as any[]) {
            const xv = resolveProp(xAcc as any, d);
            const yv = resolveProp(yAcc as any, d);
            const px = sx(xv);
            const py = sy(yv);
            if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
            const fxVal = fxAcc != null ? resolveProp(fxAcc as any, d) : undefined;
            const fyVal = fyAcc != null ? resolveProp(fyAcc as any, d) : undefined;
            const groupKey = `${String(fxVal)}\0${String(fyVal)}`;
            let group = groups.get(groupKey);
            if (!group) {
                group = new Map();
                groups.set(groupKey, group);
                facetKeys.push({ key: groupKey, fxVal, fyVal });
            }
            const { i, j, cx, cy } = pointToHex(px, py, lattice);
            const binKey = `${i},${j}`;
            let bin = group.get(binKey);
            if (!bin) {
                bin = { i, j, cx, cy, items: [], fxVal, fyVal };
                group.set(binKey, bin);
            }
            bin.items.push(d);
        }
        const bins: Bin[] = [];
        for (const g of groups.values()) for (const bin of g.values()) bins.push(bin);
        return { lattice, bins, facetKeys };
    });

    // Synthetic records for <Mark>. Bootstrap pass emits corner records so
    // x/y scales compute a domain before bins exist; result pass emits the
    // persistent corner records plus one per bin carrying:
    //   X_VAL / Y_VAL  raw data extent → x/y scale domain (one value per record;
    //                  two records together span the extent)
    //   FILL_VAL       reducer output  → color scale domain (when fill is a reducer)
    //   STROKE_VAL     reducer output  → color scale domain (when stroke is a reducer)
    //   FX_VAL / FY_VAL facet values   → Mark facet filtering (when faceted)
    //   GEOM           pixel-space hex geometry → rendered by children snippet
    //
    // When faceted, we emit one corner-pair per unique (fxVal, fyVal) so no
    // record carries an undefined facet value (which would create a spurious
    // null facet panel). Mirrors Density.svelte:441-497.
    const markData = $derived.by((): DataRecord[] => {
        const ext = extent;
        const br = binResult;
        const isFaceted = fxAcc != null || fyAcc != null;
        if (!ext) return [];

        // Build the list of (fxVal, fyVal) pairs the corner records should be
        // emitted for. binResult.facetKeys is the authoritative list once
        // binning has happened; on the bootstrap pass we walk data ourselves
        // since binResult is null.
        type FK = { fxVal: any; fyVal: any };
        let facetKeys: FK[];
        if (br) {
            facetKeys = br.facetKeys.map(({ fxVal, fyVal }) => ({ fxVal, fyVal }));
            if (facetKeys.length === 0) facetKeys = [{ fxVal: undefined, fyVal: undefined }];
        } else if (isFaceted && data?.length) {
            const seen = new Set<string>();
            facetKeys = [];
            for (const d of data as any[]) {
                const fxVal = fxAcc != null ? resolveProp(fxAcc as any, d) : undefined;
                const fyVal = fyAcc != null ? resolveProp(fyAcc as any, d) : undefined;
                const key = `${String(fxVal)}\0${String(fyVal)}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    facetKeys.push({ fxVal, fyVal });
                }
            }
        } else {
            facetKeys = [{ fxVal: undefined, fyVal: undefined }];
        }

        const records: any[] = [];
        // Persistent corner records (one pair per facet) keep x/y scale domains
        // anchored at [x1,x2]/[y1,y2] across re-derivations and ensure each
        // facet panel registers a domain even when no data lands in some bin.
        for (const { fxVal, fyVal } of facetKeys) {
            const c1: any = { [X_VAL]: ext.x1, [Y_VAL]: ext.y1 };
            const c2: any = { [X_VAL]: ext.x2, [Y_VAL]: ext.y2 };
            if (isFaceted) {
                if (fxAcc != null) {
                    c1[FX_VAL] = fxVal;
                    c2[FX_VAL] = fxVal;
                }
                if (fyAcc != null) {
                    c1[FY_VAL] = fyVal;
                    c2[FY_VAL] = fyVal;
                }
            }
            records.push(c1, c2);
        }

        if (!br) return records;

        const reducerOpts: any = {};
        const outputs: string[] = [];
        if (fillIsReducer) {
            reducerOpts.fill = rawFill;
            outputs.push('fill');
        }
        if (strokeIsReducer) {
            reducerOpts.stroke = rawStroke;
            outputs.push('stroke');
        }

        for (const bin of br.bins) {
            const item: any = {
                // Channel values irrelevant for rendering (GEOM drives that),
                // but must be inside the extent so they don't expand the domain.
                [X_VAL]: ext.x1,
                [Y_VAL]: ext.y1,
                [GEOM]: {
                    cx: bin.cx,
                    cy: bin.cy,
                    rx: br.lattice.rx,
                    ry: br.lattice.ry
                }
            };
            if (isFaceted) {
                if (fxAcc != null) item[FX_VAL] = bin.fxVal;
                if (fyAcc != null) item[FY_VAL] = bin.fyVal;
            }

            // reduceOutputs writes item.__fill = countValue etc. (note the
            // `__` prefix — see reduce.ts:113); copy onto Symbol keys so the
            // channel accessors below resolve them and user-data field names
            // can't collide.
            if (outputs.length > 0) {
                reduceOutputs(
                    item,
                    bin.items,
                    reducerOpts,
                    outputs as any,
                    { x: xAcc, y: yAcc } as any,
                    {} as any
                );
                if (fillIsReducer) item[FILL_VAL] = item['__fill'];
                if (strokeIsReducer) item[STROKE_VAL] = item['__stroke'];
            }

            records.push(item);
        }
        return records;
    });

    const markChannels = $derived([
        'x',
        'y',
        ...(fillIsReducer ? ['fill'] : []),
        ...(strokeIsReducer ? ['stroke'] : []),
        ...(fxAcc != null ? ['fx'] : []),
        ...(fyAcc != null ? ['fy'] : [])
    ] as const);

    const markChannelProps = $derived({
        x: X_VAL as any,
        y: Y_VAL as any,
        ...(fillIsReducer ? { fill: FILL_VAL as any } : {}),
        ...(strokeIsReducer ? { stroke: STROKE_VAL as any } : {}),
        ...(fxAcc != null ? { fx: FX_VAL as any } : {}),
        ...(fyAcc != null ? { fy: FY_VAL as any } : {})
    });
</script>

<Mark
    type={'hexbin' as MarkType}
    data={markData}
    channels={markChannels as any}
    {...options}
    {...markChannelProps}>
    {#snippet children({ scaledData }: { scaledData: ScaledDataRecord[] })}
        <g class={className} clip-path={clipPath}>
            {#each scaledData as d, i (i)}
                {@const geom = (d.datum as any)?.[GEOM]}
                {#if geom}
                    <path
                        d={hexagonSubpath(geom.cx, geom.cy, geom.rx, geom.ry)}
                        fill={fillIsReducer ? ((d as any).fill ?? 'currentColor') : rawFill}
                        stroke={strokeIsReducer ? ((d as any).stroke ?? 'none') : rawStroke}
                        stroke-width={strokeWidth}
                        fill-opacity={fillOpacity}
                        stroke-opacity={strokeOpacity}
                        {opacity} />
                {/if}
            {/each}
        </g>
    {/snippet}
</Mark>
