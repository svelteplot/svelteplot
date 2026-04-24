<!-- @component
    Renders two-dimensional kernel density estimation as filled or stroked
    contour paths.

    Data points with `x` and `y` channels are projected into pixel space and
    passed to d3's `contourDensity` estimator, which uses a Gaussian kernel to
    produce a density grid.  Iso-density contour bands are then drawn using the
    marching-squares algorithm.

    Styling: `fill` and `stroke` accept ordinary CSS color strings **or** the
    special keyword `"density"`, which maps each contour level's estimated
    density through the plot's color scale.  Defaults: `fill="none"`,
    `stroke="currentColor"`.

    Grouping: when a `z` channel is specified (or when `fill`/`stroke` is a
    field name or function rather than a CSS color), the mark computes a
    separate density estimate per group and renders each group independently.
    Using `fill` or `stroke` as a data accessor also maps the group value
    through the plot's color scale.

    Supports faceting via `fx`/`fy`.
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface DensityMarkProps {
        /** Input data — an array of records with x/y positions. */
        data?: Datum[] | null;
        /** x position channel (data space). */
        x?: ChannelAccessor<Datum>;
        /** y position channel (data space). */
        y?: ChannelAccessor<Datum>;
        /** Optional weight channel; defaults to 1 for each point. */
        weight?: ChannelAccessor<Datum>;
        /**
         * Grouping channel.  When specified the mark computes a separate
         * density estimate per unique z value and renders the groups
         * independently.  Unlike `fill`/`stroke` as accessors, `z` does not
         * automatically add a color channel.
         */
        z?: ChannelAccessor<Datum>;
        /**
         * Gaussian kernel bandwidth in screen pixels (default 20).
         * Larger values produce smoother, more blurred density estimates.
         */
        bandwidth?: number;
        /**
         * Density threshold levels.  Can be:
         * - a **count** (number): that many evenly-spaced levels from 0 to the
         *   maximum density (default 20)
         * - an explicit **array** of threshold values in k-scaled density units
         *   (where k = 100; values from 0 to roughly 100× the peak density)
         */
        thresholds?: number | number[];
        /**
         * Fill color for density bands.  Use `"density"` to map each band's
         * estimated density through the plot's color scale.  Default `"none"`.
         *
         * When a field name or accessor function is provided (instead of a CSS
         * color), the mark groups by the fill channel and maps group values
         * through the plot's fill color scale.
         */
        fill?: ChannelAccessor<Datum> | string;
        /**
         * Stroke color for density isolines.  Use `"density"` to map each
         * isoline's estimated density through the plot's color scale.
         * Default `"currentColor"` when fill is `"none"`, otherwise `"none"`.
         *
         * When a field name or accessor function is provided (instead of a CSS
         * color), the mark groups by the stroke channel and maps group values
         * through the plot's stroke color scale.
         */
        stroke?: ChannelAccessor<Datum> | string;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
        opacity?: number;
        strokeMiterlimit?: number;
        clipPath?: string;
        class?: string;
        /** Render using a canvas element instead of SVG paths. */
        canvas?: boolean;
        /** the horizontal facet channel */
        fx?: ChannelAccessor<Datum>;
        /** the vertical facet channel */
        fy?: ChannelAccessor<Datum>;
    }

    import type {
        DataRecord,
        ChannelAccessor,
        ScaledDataRecord,
        MarkType,
        RawValue
    } from '../types/index.js';
    import GeoPathGroup from './helpers/GeoPathGroup.svelte';
    import { SvelteMap, SvelteSet } from 'svelte/reactivity';
    import { contourDensity } from 'd3-contour';
    import { geoPath } from 'd3-geo';
    import Mark from '../Mark.svelte';
    import { usePlot } from '../hooks/usePlot.svelte.js';
    import { RAW_VALUE } from '../transforms/recordize.js';
    import { ORIGINAL_NAME_KEYS } from '../constants.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { isColorOrNull } from '../helpers/typeChecks.js';

    // Per-band fake-datum symbols — used to attach the density geometry,
    // extent, and pre-resolved facet values to the synthetic records passed
    // to <Mark> for scale-domain registration and facet filtering.
    const GEOM = Symbol('density_geom');
    const FX_VAL = Symbol('density_fx');
    const FY_VAL = Symbol('density_fy');
    const Z_VAL = Symbol('density_z');
    const X1_VAL = Symbol('density_x1');
    const X2_VAL = Symbol('density_x2');
    const Y1_VAL = Symbol('density_y1');
    const Y2_VAL = Symbol('density_y2');

    /**
     * Arbitrary scale factor matching Observable Plot's density mark.
     * Multiplying raw density values (in 1/px²) by k makes thresholds
     * human-readable integers rather than tiny floating-point numbers.
     */
    const k = 100;

    const DEFAULTS = {
        ...getPlotDefaults().density
    };

    let markProps: DensityMarkProps = $props();

    const {
        data,
        x: xAcc,
        y: yAcc,
        z: zAcc,
        weight: weightAcc,
        bandwidth = 20,
        thresholds: thresholdSpec = 20,
        fill: rawFill = 'none',
        stroke: rawStroke,
        strokeWidth,
        strokeOpacity,
        fillOpacity,
        opacity,
        strokeMiterlimit = 1,
        clipPath,
        class: className = '',
        canvas = false,
        fx: fxAcc,
        fy: fyAcc,
        ...options
    }: DensityMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    /**
     * Returns true when a fill/stroke value should be treated as a data
     * accessor (field name or function) rather than a constant color.
     */
    function isDensityAccessor(v: ChannelAccessor<Datum> | string | undefined): boolean {
        if (v == null) return false;
        if (typeof v === 'function') return true;
        // Descriptor form { value, scale } — recurse into the inner value.
        if (typeof v === 'object' && 'value' in (v as object))
            return isDensityAccessor((v as { value: any }).value);
        if (typeof v !== 'string') return false;
        const lower = v.toLowerCase();
        if (
            lower === 'none' ||
            lower === 'density' ||
            lower === 'inherit' ||
            lower === 'currentcolor'
        )
            return false;
        return !isColorOrNull(v);
    }

    // Whether fill/stroke are data accessors (trigger z-grouping + color scale)
    const fillIsAccessor = $derived(isDensityAccessor(rawFill));
    const strokeIsAccessor = $derived(isDensityAccessor(rawStroke));

    // Effective grouping accessor: explicit z > fill (if accessor) > stroke (if accessor)
    const zGroupAcc = $derived<ChannelAccessor<Datum> | null>(
        zAcc != null
            ? zAcc
            : fillIsAccessor
              ? (rawFill as ChannelAccessor<Datum>)
              : strokeIsAccessor
                ? (rawStroke as ChannelAccessor<Datum>)
                : null
    );
    const isZGrouped = $derived(zGroupAcc != null);

    // Resolved static fill/stroke strings (after extracting accessor info)
    const fill = $derived<string>(fillIsAccessor ? 'none' : ((rawFill as string) ?? 'none'));

    const fillDensity = $derived(/^density$/i.test(fill ?? ''));

    /**
     * When fill is active (not "none" or "density"), stroke defaults to "none";
     * otherwise it defaults to "currentColor".
     * fillIsAccessor also counts as "fill active" even though the static fill
     * prop is forced to "none" for GeoPathGroup — per-path fills flow via d.fill.
     */
    const effectiveStroke = $derived<string>(
        strokeIsAccessor
            ? 'currentColor'
            : ((rawStroke as string | undefined) ??
                  (fill !== 'none' || fillIsAccessor ? 'none' : 'currentColor'))
    );

    const strokeDensity = $derived(/^density$/i.test(effectiveStroke ?? ''));

    /**
     * True when fill or stroke uses the `"density"` keyword — the color scale
     * is used to encode density values.
     */
    const markUsesColorScale = $derived(fillDensity || strokeDensity);

    /** Resolve a channel accessor against a single datum. */
    function resolveAcc(acc: ChannelAccessor<any> | undefined | null, d: any): any {
        if (acc == null) return undefined;
        if (typeof acc === 'function') return (acc as (d: any) => any)(d);
        // Descriptor form { value, scale } — resolve the inner value.
        if (typeof acc === 'object' && 'value' in (acc as object))
            return resolveAcc((acc as { value: any }).value, d);
        return (d as any)[acc as string];
    }

    /** Pixel-space bounds of the current facet (or full plot if not faceted). */
    function getBounds() {
        const facetWidth = plot.facetWidth ?? 100;
        const facetHeight = plot.facetHeight ?? 100;
        const marginLeft = plot.options.marginLeft ?? 0;
        const marginTop = plot.options.marginTop ?? 0;
        return {
            bx1: marginLeft,
            by1: marginTop,
            w: Math.max(1, Math.round(facetWidth)),
            h: Math.max(1, Math.round(facetHeight))
        };
    }

    type DensityGeometry = {
        type: 'MultiPolygon';
        coordinates: number[][][][];
        /** k-scaled density threshold (value × k); used for color mapping. */
        value: number;
        /** pre-resolved fx channel value for facet filtering */
        fxVal?: RawValue;
        /** pre-resolved fy channel value for facet filtering */
        fyVal?: RawValue;
        /** pre-resolved z group value for per-group coloring */
        zVal?: RawValue;
    };

    /**
     * All density contour bands across every facet group.
     *
     * Phase 1: compute density grids per facet group, find global max density.
     * Phase 2: derive thresholds from global max (for consistent color scale).
     * Phase 3: compute contour geometries at those thresholds.
     *
     * Geometries are tagged with fxVal/fyVal/zVal so <Mark> can filter per
     * panel and apply per-group colors.
     */
    const densityResult = $derived.by((): DensityGeometry[] | null => {
        const xFn = plot.scales.x?.fn;
        const yFn = plot.scales.y?.fn;
        if (!xFn || !yFn || !data?.length) return null;

        const { bx1, by1, w, h } = getBounds();
        const isFaceted = fxAcc != null || fyAcc != null;

        // Group data by (fxVal, fyVal, zVal) — a single group when not faceted/z-grouped.
        const groups = new SvelteMap<
            string,
            { fxVal: RawValue; fyVal: RawValue; zVal: RawValue; items: any[] }
        >();
        for (const d of data as any[]) {
            const fxVal = fxAcc != null ? resolveAcc(fxAcc, d) : undefined;
            const fyVal = fyAcc != null ? resolveAcc(fyAcc, d) : undefined;
            const zVal = isZGrouped ? resolveAcc(zGroupAcc, d) : undefined;
            const key = `${fxVal}\0${fyVal}\0${zVal}`;
            if (!groups.has(key)) groups.set(key, { fxVal, fyVal, zVal, items: [] });
            groups.get(key)!.items.push(d);
        }

        // Phase 1: build a density estimator per group, record max density.
        type GroupEntry = {
            fxVal: RawValue;
            fyVal: RawValue;
            zVal: RawValue;
            /** function returned by kde.contours(data); call it with a threshold */
            contourFn: (t: number) => DensityGeometry;
            maxVal: number;
        };
        const groupEntries: GroupEntry[] = [];
        let globalMax = 0;

        for (const { fxVal, fyVal, zVal, items } of groups.values()) {
            if (!items.length) continue;

            const kde = contourDensity<any>()
                .x((d) => (xFn(resolveAcc(xAcc, d)) as number) - bx1)
                .y((d) => (yFn(resolveAcc(yAcc, d)) as number) - by1)
                .weight(weightAcc != null ? (d) => +(resolveAcc(weightAcc, d) ?? 1) : () => 1)
                .size([w, h])
                .bandwidth(bandwidth);

            // .contours() is in d3-contour v4 but not typed in @types/d3-contour
            const contourFn = (kde as any).contours(items) as {
                (t: number): DensityGeometry;
                max: number;
            };
            const maxVal = contourFn.max;
            if (maxVal > globalMax) globalMax = maxVal;
            groupEntries.push({ fxVal, fyVal, zVal, contourFn, maxVal });
        }

        if (!groupEntries.length || globalMax === 0) return null;

        // Phase 2: derive thresholds from global max density.
        let T: number[];
        if (Array.isArray(thresholdSpec)) {
            T = thresholdSpec as number[];
        } else {
            const n = thresholdSpec as number;
            // Generate n-1 levels evenly spaced over (0, globalMax × k]
            T = Array.from({ length: n - 1 }, (_, i) => (globalMax * k * (i + 1)) / n);
        }
        if (!T.length) return null;

        // Phase 3: compute contour geometries for each group at each threshold.
        const allGeoms: DensityGeometry[] = [];

        for (const { fxVal, fyVal, zVal, contourFn } of groupEntries) {
            for (const t of T) {
                // contourFn expects actual density values; t is k-scaled.
                const geom = contourFn(t / k);

                // Translate from facet-local [0, w]×[0, h] to SVG coordinates.
                for (const rings of geom.coordinates) {
                    for (const ring of rings) {
                        for (const point of ring) {
                            point[0] += bx1;
                            point[1] += by1;
                        }
                    }
                }

                geom.value = t; // k-scaled, used for color mapping
                if (isFaceted && fxVal !== undefined) geom.fxVal = fxVal;
                if (isFaceted && fyVal !== undefined) geom.fyVal = fyVal;
                if (isZGrouped && zVal !== undefined) geom.zVal = zVal;
                allGeoms.push(geom);
            }
        }

        // Anchor the color scale at zero so the first density band is
        // distinguishable from the background.  One anchor per facet group so
        // no record ever has an undefined fx/fy value, which would otherwise
        // introduce a spurious null facet panel.
        if (markUsesColorScale) {
            for (const { fxVal, fyVal, zVal } of groupEntries) {
                const anchor: DensityGeometry = {
                    type: 'MultiPolygon',
                    coordinates: [],
                    value: 0
                };
                if (isFaceted && fxVal !== undefined) anchor.fxVal = fxVal;
                if (isFaceted && fyVal !== undefined) anchor.fyVal = fyVal;
                if (isZGrouped && zVal !== undefined) anchor.zVal = zVal;
                allGeoms.push(anchor);
            }
        }

        return allGeoms.length > 0 ? allGeoms : null;
    });

    /**
     * Data-space extent used to bootstrap the x/y scale domains before
     * densityResult is available (density computation needs the scale fns,
     * which need the domain — this breaks the circular dependency).
     */
    const extent = $derived.by(() => {
        if (!data?.length) return null;
        let xMin = Infinity,
            xMax = -Infinity,
            yMin = Infinity,
            yMax = -Infinity;
        let xUsesDate = false,
            yUsesDate = false;
        for (const d of data as any[]) {
            const xv = resolveAcc(xAcc, d);
            const yv = resolveAcc(yAcc, d);
            if (xv instanceof Date) {
                xUsesDate = true;
                const ms = xv.getTime();
                if (isFinite(ms)) {
                    if (ms < xMin) xMin = ms;
                    if (ms > xMax) xMax = ms;
                }
            } else if (typeof xv === 'number' && isFinite(xv)) {
                if (xv < xMin) xMin = xv;
                if (xv > xMax) xMax = xv;
            }
            if (yv instanceof Date) {
                yUsesDate = true;
                const ms = yv.getTime();
                if (isFinite(ms)) {
                    if (ms < yMin) yMin = ms;
                    if (ms > yMax) yMax = ms;
                }
            } else if (typeof yv === 'number' && isFinite(yv)) {
                if (yv < yMin) yMin = yv;
                if (yv > yMax) yMax = yv;
            }
        }
        if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(yMin) || !isFinite(yMax)) return null;
        return {
            x1: xUsesDate ? new Date(xMin) : xMin,
            x2: xUsesDate ? new Date(xMax) : xMax,
            y1: yUsesDate ? new Date(yMin) : yMin,
            y2: yUsesDate ? new Date(yMax) : yMax
        };
    });

    /**
     * Unified mark data passed to <Mark> for scale-domain registration and
     * facet filtering.
     *
     * A bootstrap extent record is always included before densityResult is
     * computed (scatter-style circular dependency with x/y scales).  Each
     * per-band fake datum carries:
     *   [X1_VAL]..[Y2_VAL]  data-space extent → x/y scale domain
     *   [RAW_VALUE]          k-scaled density  → color scale domain (density mode)
     *   [Z_VAL]              z group value     → fill/stroke scale domain (z-group mode)
     *   [FX_VAL]/[FY_VAL]   facet values      → Mark facet filtering
     *   [GEOM]               geometry          → rendered by children snippet
     */
    const markData = $derived.by((): DataRecord[] => {
        const ext = extent;
        const records: any[] = [];
        // Bootstrap extent record(s) so x/y scales are available for density
        // computation on the first render pass.  When faceted or z-grouped, emit
        // one record per unique (fxVal, fyVal, zVal) combination so no record
        // carries an undefined fx/fy value (which would create a spurious null facet).
        if (ext && !densityResult) {
            const isFaceted = fxAcc != null || fyAcc != null;
            if ((isFaceted || isZGrouped) && data?.length) {
                const seen = new SvelteSet<string>();
                for (const d of data as any[]) {
                    const fxVal = fxAcc != null ? resolveAcc(fxAcc, d) : undefined;
                    const fyVal = fyAcc != null ? resolveAcc(fyAcc, d) : undefined;
                    const zVal = isZGrouped ? resolveAcc(zGroupAcc, d) : undefined;
                    const key = `${fxVal}\0${fyVal}\0${zVal}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        records.push({
                            [X1_VAL]: ext.x1,
                            [X2_VAL]: ext.x2,
                            [Y1_VAL]: ext.y1,
                            [Y2_VAL]: ext.y2,
                            [FX_VAL]: fxVal,
                            [FY_VAL]: fyVal,
                            [Z_VAL]: zVal
                        });
                    }
                }
            } else {
                records.push({
                    [X1_VAL]: ext.x1,
                    [X2_VAL]: ext.x2,
                    [Y1_VAL]: ext.y1,
                    [Y2_VAL]: ext.y2
                });
            }
        }

        if (densityResult) {
            for (const geom of densityResult) {
                records.push({
                    [X1_VAL]: ext?.x1,
                    [X2_VAL]: ext?.x2,
                    [Y1_VAL]: ext?.y1,
                    [Y2_VAL]: ext?.y2,
                    [RAW_VALUE]: geom.value,
                    [FX_VAL]: geom.fxVal,
                    [FY_VAL]: geom.fyVal,
                    [Z_VAL]: geom.zVal,
                    [GEOM]: geom
                });
            }
        }

        return records as DataRecord[];
    });

    const markChannels = $derived.by(() => {
        const base = ['x1', 'x2', 'y1', 'y2'] as const;
        if (markUsesColorScale || fillIsAccessor) return [...base, 'fill'] as const;
        if (strokeIsAccessor) return [...base, 'stroke'] as const;
        return base;
    });

    // fill channel accessor:
    //   density color scale (fill or stroke="density") → RAW_VALUE (registers domain)
    //   fill accessor (z-grouping)                    → Z_VAL
    //   else                                          → undefined
    const markFill = $derived(
        markUsesColorScale ? (RAW_VALUE as any) : fillIsAccessor ? (Z_VAL as any) : undefined
    );

    // stroke channel accessor: only set when stroke is a z-group accessor
    const markStroke = $derived(strokeIsAccessor ? (Z_VAL as any) : undefined);

    const markFx = $derived(fxAcc != null ? FX_VAL : undefined);
    const markFy = $derived(fyAcc != null ? FY_VAL : undefined);

    const markChannelProps = $derived({
        x1: X1_VAL as any,
        x2: X2_VAL as any,
        y1: Y1_VAL as any,
        y2: Y2_VAL as any,
        fill: markFill as any,
        stroke: markStroke as any,
        fx: markFx as any,
        fy: markFy as any,
        ...(typeof xAcc === 'string' && { [ORIGINAL_NAME_KEYS.x]: xAcc }),
        ...(typeof yAcc === 'string' && { [ORIGINAL_NAME_KEYS.y]: yAcc }),
        ...(markUsesColorScale && { [ORIGINAL_NAME_KEYS.fill]: 'Density' }),
        ...(fillIsAccessor &&
            typeof rawFill === 'string' && { [ORIGINAL_NAME_KEYS.fill]: rawFill }),
        ...(strokeIsAccessor &&
            typeof rawStroke === 'string' && { [ORIGINAL_NAME_KEYS.stroke]: rawStroke })
    });

    const path = geoPath();
</script>

<Mark
    type={'density' as MarkType}
    data={markData}
    channels={markChannels as any}
    {...options}
    {...markChannelProps}>
    {#snippet children({ scaledData }: { scaledData: ScaledDataRecord[] })}
        <GeoPathGroup
            {scaledData}
            {path}
            geomKey={GEOM}
            colorKeyword="density"
            {fill}
            stroke={effectiveStroke}
            {strokeWidth}
            {strokeOpacity}
            {fillOpacity}
            {opacity}
            {strokeMiterlimit}
            {clipPath}
            className={className || undefined}
            ariaLabel="density"
            {canvas}
            {plot}
            usePerPathFill={fillIsAccessor}
            usePerPathStroke={strokeIsAccessor} />
    {/snippet}
</Mark>
