<!-- @component
    Renders contour lines (or filled contour bands) from a scalar field using
    the marching-squares algorithm.

    Supports the same three input modes as the `Raster` mark:

    **Dense grid mode** (`data` is a flat row-major array, `width`/`height` are
    set, no `x`/`y` channels): each datum is its own scalar value (unless `value`
    is specified).

    **Function sampling mode** (`data` is omitted/null, `value` is an
    `(x, y) => number` function): the function is evaluated on a pixel grid.

    **Scatter interpolation mode** (`data` is an array with `x`/`y` channels):
    each datum contributes a position and scalar value; the mark spatially
    interpolates over the grid before running marching squares.

    Styling: `fill` and `stroke` accept ordinary CSS color strings **or** the
    special keyword `"value"`, which maps each contour level's threshold through
    the plot's color scale.  Defaults: `fill="none"`, `stroke="currentColor"`.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface ContourMarkProps {
        /**
         * Input data.  For **dense grid** mode supply a flat row-major array and
         * set `width`/`height`.  Omit (or set null) for **function-sampling**
         * mode.  For **scatter interpolation** supply an array of records with
         * `x`/`y` channels.
         */
        data?: Datum[] | null;
        /** x position channel (scatter mode) */
        x?: ChannelAccessor<Datum>;
        /** y position channel (scatter mode) */
        y?: ChannelAccessor<Datum>;
        /**
         * Scalar field accessor, identity function for dense grid, or an
         * `(x, y) => number` function for function-sampling mode.
         */
        value?: ChannelAccessor<Datum> | ((x: number, y: number) => number);
        /**
         * Contour threshold levels.  Can be:
         * - a **count** (number): approximately that many nicely-spaced levels
         * - an explicit **array** of threshold values
         * - a **function** `(values, min, max) => number[]`
         * - a d3 **threshold scheme** object with `.floor()` / `.range()`
         *
         * Defaults to Sturges' formula applied to the value range.
         */
        thresholds?:
            | number
            | number[]
            | ((values: number[], min: number, max: number) => number[])
            | { floor(x: number): number; range(a: number, b: number): number[] };
        /**
         * Step interval between contour levels (alternative to `thresholds`).
         * Can be a number (constant step) or an interval object with `.floor()`
         * / `.range()`.
         */
        interval?: number | { floor(x: number): number; range(a: number, b: number): number[] };
        /**
         * Whether to apply linear interpolation when tracing contour edges
         * (default `true`).  Set to `false` for a blockier, faster appearance.
         */
        smooth?: boolean;
        /** left bound of the domain in data coordinates */
        x1?: number;
        /** top bound of the domain in data coordinates */
        y1?: number;
        /** right bound of the domain in data coordinates */
        x2?: number;
        /** bottom bound of the domain in data coordinates */
        y2?: number;
        /**
         * Explicit grid width; required for dense grid mode, overrides
         * `pixelSize` in other modes.
         */
        width?: number;
        /**
         * Explicit grid height; required for dense grid mode, overrides
         * `pixelSize` in other modes.
         */
        height?: number;
        /** pixel size in screen pixels (default 2) */
        pixelSize?: number;
        /** Gaussian blur radius applied before contouring (default 0) */
        blur?: number;
        /**
         * Spatial interpolation for scatter mode:
         * `"none"` | `"nearest"` | `"barycentric"` | `"random-walk"` or a
         * custom `(index, w, h, X, Y, V) => W` function.
         * Defaults to `"nearest"` when data is provided.
         */
        interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk' | InterpolateFunction;
        /**
         * Fill color for contour polygons.  Use `"value"` to map each
         * threshold level through the plot's color scale.  Default `"none"`.
         *
         * **Shorthand**: if `value` is omitted and `fill` is a field name or
         * accessor function (not a CSS color), it is automatically promoted to
         * the `value` channel and `fill` is set to `"value"`.
         */
        fill?: string | ChannelAccessor<Datum>;
        /**
         * Stroke color for contour lines.  Use `"value"` to map each
         * threshold level through the plot's color scale.  Default
         * `"currentColor"`.
         *
         * **Shorthand**: if `value` is omitted and `stroke` is a field name or
         * accessor function (not a CSS color), it is automatically promoted to
         * the `value` channel and `stroke` is set to `"value"`.
         */
        stroke?: string | ChannelAccessor<Datum>;
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
        DataRow,
        DataRecord,
        ChannelAccessor,
        ScaledDataRecord,
        MarkType,
        RawValue
    } from '../types/index.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { blur2, ticks, nice, range, thresholdSturges } from 'd3-array';
    import { contours } from 'd3-contour';
    import { geoPath } from 'd3-geo';
    import Mark from '../Mark.svelte';
    import GeoPathGroup from './helpers/GeoPathGroup.svelte';
    import { usePlot } from '../hooks/usePlot.svelte.js';
    import {
        interpolateNone,
        interpolateNearest,
        interpolatorBarycentric,
        interpolatorRandomWalk,
        type InterpolateFunction
    } from '../helpers/rasterInterpolate.js';
    import { RAW_VALUE } from '../transforms/recordize.js';
    import { ORIGINAL_NAME_KEYS } from '../constants.js';
    import { scaleLinear } from 'd3-scale';
    import { isColorOrNull } from '../helpers/typeChecks.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    // Per-band fake-datum symbols — used to attach the contour geometry,
    // extent, and pre-resolved facet values to the synthetic records passed
    // to <Mark> for scale-domain registration and facet filtering.
    const GEOM = Symbol('contour_geom');
    const FX_VAL = Symbol('contour_fx');
    const FY_VAL = Symbol('contour_fy');
    const X1_VAL = Symbol('contour_x1');
    const X2_VAL = Symbol('contour_x2');
    const Y1_VAL = Symbol('contour_y1');
    const Y2_VAL = Symbol('contour_y2');

    const DEFAULTS = {
        ...getPlotDefaults().contour
    };

    let markProps: ContourMarkProps = $props();

    const {
        data,
        value: rawValue,
        x: xAcc,
        y: yAcc,
        fx: fxAcc,
        fy: fyAcc,
        x1: x1Prop,
        y1: y1Prop,
        x2: x2Prop,
        y2: y2Prop,
        width: widthProp,
        height: heightProp,
        pixelSize = 4,
        blur = 0,
        smooth = true,
        thresholds,
        interval,
        interpolate,
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
        ...options
    }: ContourMarkProps = $derived({ ...DEFAULTS, ...markProps });

    /**
     * Returns true when a fill/stroke value should be treated as a data
     * accessor (field name or function) rather than a constant color.
     */
    function isContourAccessor(v: string | ChannelAccessor<Datum> | undefined): boolean {
        if (v == null) return false;
        if (typeof v === 'function') return true;
        if (typeof v !== 'string') return true;
        const lower = v.toLowerCase();
        if (lower === 'none' || lower === 'value' || lower === 'inherit') return false;
        return !isColorOrNull(v);
    }

    /**
     * Apply Observable Plot's shorthand: when `value` is omitted and `fill`
     * or `stroke` is a data accessor, promote it to the `value` channel.
     */
    const { fill, stroke, value } = $derived.by(() => {
        if (rawValue !== undefined) {
            return {
                fill: rawFill as string,
                stroke: rawStroke as string | undefined,
                value: rawValue
            };
        }
        const fillIsAccessor = isContourAccessor(rawFill);
        const strokeIsAccessor = isContourAccessor(rawStroke);
        if (fillIsAccessor && strokeIsAccessor) {
            throw new Error('ambiguous contour value: both fill and stroke are data accessors');
        }
        if (fillIsAccessor) {
            return { fill: 'value', stroke: rawStroke as string | undefined, value: rawFill };
        }
        if (strokeIsAccessor) {
            return { fill: rawFill as string, stroke: 'value', value: rawStroke };
        }
        return {
            fill: rawFill as string,
            stroke: rawStroke as string | undefined,
            value: rawValue
        };
    });

    const plot = usePlot();

    /** No data: value is an (x,y) function */
    const isSamplerMode = $derived(data == null);

    /** Dense grid: data is a flat array, width+height given, no x/y channels. */
    const isDenseGridMode = $derived(
        data != null && widthProp != null && heightProp != null && xAcc == null && yAcc == null
    );

    const interpolateFn = $derived(resolveInterpolate(interpolate));

    /** When a fill is active, stroke defaults to none; otherwise currentColor. */
    const effectiveStroke = $derived(stroke ?? (fill !== 'none' ? 'none' : 'currentColor'));

    /**
     * True when fill or stroke uses the `"value"` keyword, meaning threshold
     * levels must be mapped through the plot's color scale.
     */
    const markUsesColorScale = $derived(fill === 'value' || effectiveStroke === 'value');

    function resolveInterpolate(interp: ContourMarkProps['interpolate']): InterpolateFunction {
        if (typeof interp === 'function') return interp;
        const resolved = interp ?? (isSamplerMode || isDenseGridMode ? 'none' : 'nearest');
        switch (String(resolved).toLowerCase()) {
            case 'none':
                return interpolateNone;
            case 'nearest':
                return interpolateNearest;
            case 'barycentric':
                return interpolatorBarycentric();
            case 'random-walk':
                return interpolatorRandomWalk();
        }
        throw new Error(`invalid interpolate: ${interp}`);
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
            bx2: marginLeft + facetWidth,
            by2: marginTop + facetHeight
        };
    }

    /** Resolve the scalar value from a single datum. */
    function resolveValue(datum: any): number | null {
        if (value == null) return typeof datum === 'number' ? datum : null;
        if (typeof value === 'string') return datum[value] ?? null;
        if (typeof value === 'function') return (value as (d: any) => number)(datum);
        return null;
    }

    type ContourGeometry = {
        type: 'MultiPolygon';
        coordinates: number[][][][];
        /** threshold value that produced this band */
        value: number;
        /** pre-resolved fx channel value for facet filtering (undefined when not faceted) */
        fxVal?: RawValue;
        /** pre-resolved fy channel value for facet filtering (undefined when not faceted) */
        fyVal?: RawValue;
    };

    /**
     * Resolve a channel accessor against a single raw datum.
     * Works for string field names and function accessors.
     */
    function resolveAcc(acc: ChannelAccessor<any> | undefined, d: any): any {
        if (acc == null) return undefined;
        if (typeof acc === 'function') return (acc as (d: any) => any)(d);
        return (d as any)[acc as string];
    }

    /**
     * Compute contour bands from a scalar field.
     *
     * @param scatterData  Scatter-mode point array (uses `data` prop if omitted).
     * @param fxVal        Pre-resolved fx facet value to tag onto each geometry.
     * @param fyVal        Pre-resolved fy facet value to tag onto each geometry.
     */
    function computeContours(
        scatterData?: any[] | null,
        fxVal?: RawValue,
        fyVal?: RawValue
    ): ContourGeometry[] | null {
        const { bx1, by1, bx2, by2 } = getBounds();
        const dx = bx2 - bx1;
        const dy = by2 - by1;
        const w = widthProp ?? Math.round(Math.abs(dx) / pixelSize);
        const h = heightProp ?? Math.round(Math.abs(dy) / pixelSize);
        if (w <= 0 || h <= 0) return null;
        const n = w * h;

        // --- Build numeric value grid V ---
        let V: number[] | null = null;

        if (isDenseGridMode) {
            const Vraw = (data as any[]).map((d) => resolveValue(d) ?? NaN);
            V = new Array(n);
            for (let row = 0; row < h; ++row) {
                const srcRow = h - 1 - row;
                for (let col = 0; col < w; ++col) {
                    V[row * w + col] = Vraw[srcRow * w + col];
                }
            }
        } else if (isSamplerMode) {
            if (typeof value !== 'function') return null;
            const xScale = scaleLinear()
                .range([x1Prop as number, x2Prop as number])
                .domain([bx1, bx2]);
            const yScale = scaleLinear()
                .range([y1Prop as number, y2Prop as number])
                .domain([by1, by2]);
            const kx = dx / w;
            const ky = dy / h;
            V = new Array(n);
            let i = 0;
            for (let yi = 0.5; yi < h; ++yi) {
                for (let xi = 0.5; xi < w; ++xi, ++i) {
                    V[i] = (value as (x: number, y: number) => number)(
                        xScale(bx1 + xi * kx),
                        yScale(by1 + yi * ky)
                    );
                }
            }
        } else {
            // Scatter interpolation — use the provided subset or the full dataset.
            const pts = scatterData ?? (data as any[] | null);
            if (!pts || pts.length === 0) return null;

            const xFn = plot.scales.x?.fn;
            const yFn = plot.scales.y?.fn;
            if (!xFn || !yFn) return null;

            type ScatterPt = { px: number; py: number; v: number | null };
            const validData: ScatterPt[] = [];
            for (const d of pts) {
                const xv = resolveAcc(xAcc, d);
                const yv = resolveAcc(yAcc, d);
                if (xv == null || yv == null) continue;
                const px = xFn(xv) as number;
                const py = yFn(yv) as number;
                if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
                validData.push({ px, py, v: resolveValue(d) });
            }
            if (validData.length === 0) return null;

            const kx = w / dx;
            const ky = h / dy;
            const index = validData.map((_, i) => i);
            const IX = new Float64Array(validData.map((d) => (d.px - bx1) * kx));
            const IY = new Float64Array(validData.map((d) => (d.py - by1) * ky));
            const rawValues = validData.map((d) => d.v);
            if (rawValues.some((v) => v != null)) {
                V = Array.from(interpolateFn(index, w, h, IX, IY, rawValues));
            }
        }

        if (!V) return null;

        // --- Optional Gaussian blur ---
        if (blur > 0) blur2({ data: V, width: w, height: h }, blur);

        // --- Compute thresholds from the actual grid ---
        const T = computeThresholds(V, w, h, thresholds, interval);
        if (T.length === 0) return null;

        // --- Run marching squares ---
        const kx = w / dx;
        const ky = h / dy;
        const contourFn = contours().size([w, h]).smooth(smooth);

        return T.map((t) => {
            const geom = contourFn.contour(V!, t) as ContourGeometry;

            // Rescale from grid coordinates to SVG pixel coordinates
            for (const rings of geom.coordinates) {
                for (const ring of rings) {
                    for (const point of ring) {
                        point[0] = point[0] / kx + bx1;
                        point[1] = point[1] / ky + by1;
                    }
                }
            }

            // Tag with facet identity so the Mark can filter per panel
            if (fxVal !== undefined) geom.fxVal = fxVal;
            if (fyVal !== undefined) geom.fyVal = fyVal;

            return geom;
        });
    }

    /** Compute an array of threshold tick values from the V grid. */
    function computeThresholds(
        V: number[],
        w: number,
        h: number,
        thresholdSpec: ContourMarkProps['thresholds'],
        intervalSpec: ContourMarkProps['interval']
    ): number[] {
        let vMin = Infinity,
            vMax = -Infinity;
        for (const v of V) {
            if (isFinite(v)) {
                if (v < vMin) vMin = v;
                if (v > vMax) vMax = v;
            }
        }
        if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) return [];

        if (thresholdSpec == null && intervalSpec != null) {
            if (typeof intervalSpec === 'number') {
                const step = intervalSpec;
                return range(Math.floor(vMin / step) * step, vMax, step);
            }
            return intervalSpec.range(intervalSpec.floor(vMin), vMax);
        }

        const tSpec: any = thresholdSpec ?? thresholdSturges;

        if (typeof tSpec === 'object' && tSpec !== null && 'range' in tSpec) {
            return tSpec.range(tSpec.floor(vMin), vMax);
        }

        if (Array.isArray(tSpec)) return tSpec;

        let resolved: any = tSpec;
        if (typeof tSpec === 'function') {
            const finiteV = V.filter(isFinite);
            resolved = tSpec(finiteV, vMin, vMax);
        }

        if (Array.isArray(resolved)) return resolved;

        const count = resolved as number;
        const [nMin, nMax] = nice(vMin, vMax, count) as [number, number];
        const tz = ticks(nMin, nMax, count);
        while (tz.length > 0 && tz[tz.length - 1] >= vMax) tz.pop();
        while (tz.length > 1 && tz[1] < vMin) tz.shift();
        return tz;
    }

    const path = geoPath();

    /**
     * All contour bands across every facet group, computed from the full
     * dataset at root level.
     *
     * - Non-faceted / dense-grid / sampler: single call to `computeContours`.
     * - Faceted scatter: data is grouped by (fx, fy) value combinations and
     *   `computeContours` is called once per group; each geometry is tagged with
     *   its `fxVal`/`fyVal` so that <Mark> can filter per panel.
     */
    const contourResult = $derived.by((): ContourGeometry[] | null => {
        const isScatterFaceted =
            !isDenseGridMode && !isSamplerMode && (fxAcc != null || fyAcc != null);

        if (!isScatterFaceted) {
            return computeContours();
        }

        // Group scatter data by (fxVal, fyVal)
        if (!data || !(data as any[]).length) return null;
        const groups = new SvelteMap<string, { fxVal: RawValue; fyVal: RawValue; items: any[] }>();
        for (const d of data as any[]) {
            const fxVal = resolveAcc(fxAcc, d);
            const fyVal = resolveAcc(fyAcc, d);
            const key = `${fxVal}\0${fyVal}`;
            if (!groups.has(key)) groups.set(key, { fxVal, fyVal, items: [] });
            groups.get(key)!.items.push(d);
        }

        const allBands: ContourGeometry[] = [];
        for (const { fxVal, fyVal, items } of groups.values()) {
            const bands = computeContours(items, fxVal, fyVal);
            if (bands) allBands.push(...bands);
        }
        return allBands.length > 0 ? allBands : null;
    });

    // --- Mark registration data ---

    /**
     * Data-space extent of the mark, stored as x1/x2/y1/y2 values that are
     * attached to every per-band fake datum so <Mark> can register the x/y
     * scale domains without needing separate corner records.
     */
    const extent = $derived.by(() => {
        if (isDenseGridMode) {
            return { x1: 0, x2: widthProp! - 1, y1: 0, y2: heightProp! - 1 };
        }
        if (isSamplerMode) {
            if (x1Prop != null && x2Prop != null && y1Prop != null && y2Prop != null) {
                return {
                    x1: x1Prop as number,
                    x2: x2Prop as number,
                    y1: y1Prop as number,
                    y2: y2Prop as number
                };
            }
            return null;
        }
        // Scatter: compute from the full dataset (global extent across all facets)
        if (!data) return null;
        let xMin = Infinity,
            xMax = -Infinity,
            yMin = Infinity,
            yMax = -Infinity;
        for (const d of data as any[]) {
            const xv = resolveAcc(xAcc, d);
            const yv = resolveAcc(yAcc, d);
            if (typeof xv === 'number' && isFinite(xv)) {
                if (xv < xMin) xMin = xv;
                if (xv > xMax) xMax = xv;
            }
            if (typeof yv === 'number' && isFinite(yv)) {
                if (yv < yMin) yMin = yv;
                if (yv > yMax) yMax = yv;
            }
        }
        return isFinite(xMin) ? { x1: xMin, x2: xMax, y1: yMin, y2: yMax } : null;
    });

    /**
     * Unified mark data:
     *
     * For scatter mode, one extent-only record is always included so that the
     * x/y scale domain is bootstrapped before `contourResult` is available
     * (scatter contours depend on `plot.scales.x/y.fn`, which needs this record
     * to exist first; dense/sampler modes don't have this circular dependency
     * since they compute V without needing x/y scales).
     *
     * Each per-band fake datum carries:
     * - [X1_VAL]..[Y2_VAL]  data-space extent → x/y scale domain registration
     * - [RAW_VALUE]          threshold → color scale domain registration
     * - [FX_VAL]/[FY_VAL]   pre-resolved facet values → Mark facet filtering
     * - [GEOM]               geometry reference → rendered by children snippet
     */
    const markData = $derived.by((): DataRecord[] => {
        const ext = extent;
        const records: any[] = [];

        // Scatter mode: always include a bootstrap extent record so x/y scales
        // are initialized independently of contourResult.
        if (!isDenseGridMode && !isSamplerMode && ext && !contourResult) {
            records.push({
                [X1_VAL]: ext.x1,
                [X2_VAL]: ext.x2,
                [Y1_VAL]: ext.y1,
                [Y2_VAL]: ext.y2
            });
        }

        if (contourResult) {
            for (const geom of contourResult) {
                records.push({
                    [X1_VAL]: ext?.x1,
                    [X2_VAL]: ext?.x2,
                    [Y1_VAL]: ext?.y1,
                    [Y2_VAL]: ext?.y2,
                    [RAW_VALUE]: geom.value,
                    [FX_VAL]: geom.fxVal,
                    [FY_VAL]: geom.fyVal,
                    [GEOM]: geom
                });
            }
        }

        return records as DataRecord[];
    });

    const markChannels = $derived(
        markUsesColorScale
            ? (['x1', 'x2', 'y1', 'y2', 'fill'] as const)
            : (['x1', 'x2', 'y1', 'y2'] as const)
    );

    const markFill = $derived(markUsesColorScale ? (RAW_VALUE as any) : undefined);

    // Custom fx/fy accessors that read the pre-resolved facet values stored on
    // the fake datums.  These replace the user's original accessors (which
    // pointed to fields on the raw scatter data) so that <Mark>'s facet
    // filtering operates on the band records rather than the raw datums.
    const markFx = $derived(fxAcc != null ? FX_VAL : undefined);
    const markFy = $derived(fyAcc != null ? FY_VAL : undefined);

    // Channel overrides passed to <Mark> as a spread so TypeScript's excess-property
    // check doesn't fire (explicit named props on a component trigger that check,
    // but spreading a typed variable does not).
    const markChannelProps = $derived({
        x1: X1_VAL as unknown as ContourMarkProps['x1'],
        x2: X2_VAL as unknown as ContourMarkProps['x1'],
        y1: Y1_VAL as unknown as ContourMarkProps['y1'],
        y2: Y2_VAL as unknown as ContourMarkProps['y1'],
        fill: markFill as ContourMarkProps['fill'],
        fx: markFx as ContourMarkProps['fx'],
        fy: markFy as ContourMarkProps['fy'],
        ...(typeof xAcc === 'string' && { [ORIGINAL_NAME_KEYS.x]: xAcc }),
        ...(typeof yAcc === 'string' && { [ORIGINAL_NAME_KEYS.y]: yAcc }),
        ...(markUsesColorScale && typeof value === 'string' && { [ORIGINAL_NAME_KEYS.fill]: value })
    } satisfies Partial<ContourMarkProps>);
</script>

<Mark
    type={'contour' as MarkType}
    data={markData}
    channels={markChannels as any}
    {...options}
    {...markChannelProps}>
    {#snippet children({ scaledData }: { scaledData: ScaledDataRecord[] })}
        <GeoPathGroup
            {scaledData}
            {path}
            geomKey={GEOM}
            colorKeyword="value"
            {fill}
            stroke={effectiveStroke}
            {strokeWidth}
            {strokeOpacity}
            {fillOpacity}
            {opacity}
            {strokeMiterlimit}
            {clipPath}
            className={className || undefined}
            ariaLabel="contour"
            {canvas}
            {plot} />
    {/snippet}
</Mark>
