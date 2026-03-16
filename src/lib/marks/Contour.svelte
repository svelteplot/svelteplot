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
        /** x position channel (scatter / dense-grid mode) */
        x?: ChannelAccessor<Datum>;
        /** y position channel (scatter / dense-grid mode) */
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
    }

    import type {
        DataRow,
        DataRecord,
        ChannelAccessor,
        ScaledDataRecord,
        MarkType
    } from '../types/index.js';
    import { blur2, ticks, nice, range, thresholdSturges } from 'd3-array';
    import { contours } from 'd3-contour';
    import { geoPath } from 'd3-geo';
    import Mark from '../Mark.svelte';
    import { usePlot } from '../hooks/usePlot.svelte.js';
    import {
        interpolateNone,
        interpolateNearest,
        interpolatorBarycentric,
        interpolatorRandomWalk,
        type InterpolateFunction
    } from '../helpers/rasterInterpolate.js';
    import { X, Y, RAW_VALUE } from '../transforms/recordize.js';
    import { scaleLinear } from 'd3-scale';
    import { isColorOrNull } from '../helpers/typeChecks.js';

    let markProps: ContourMarkProps = $props();

    const {
        data,
        value: rawValue,
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
        ...options
    }: ContourMarkProps = $derived({ ...markProps });

    /**
     * Returns true when a fill/stroke value should be treated as a data
     * accessor (field name or function) rather than a constant color.
     * Strings that are CSS colors, SVG paint keywords, or SveltePlot's own
     * `"value"` keyword are constants; everything else is an accessor.
     */
    function isContourAccessor(v: string | ChannelAccessor<Datum> | undefined): boolean {
        if (v == null) return false;
        if (typeof v === 'function') return true;
        if (typeof v !== 'string') return true;
        const lower = v.toLowerCase();
        // SVG paint / SveltePlot keywords that are never data field names
        if (lower === 'none' || lower === 'value' || lower === 'inherit') return false;
        return !isColorOrNull(v);
    }

    /**
     * Apply Observable Plot's shorthand: when `value` is omitted and `fill`
     * or `stroke` is a data accessor (field name or function — not a CSS
     * color), promote it to the `value` channel and replace with `"value"`.
     * Throws if both `fill` and `stroke` are accessors (ambiguous).
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

    /**
     * Dense grid: data is a flat array, width+height are given, no x/y channels.
     */
    const isDenseGridMode = $derived(
        data != null &&
            widthProp != null &&
            heightProp != null &&
            (options as any).x == null &&
            (options as any).y == null
    );

    const interpolateFn = $derived(resolveInterpolate(interpolate));

    /** When a fill is active, stroke defaults to none; otherwise currentColor. */
    const effectiveStroke = $derived(stroke ?? (fill !== 'none' ? 'none' : 'currentColor'));

    /**
     * True when at least one of fill/stroke is the special `"value"` keyword,
     * meaning threshold levels must be mapped through the plot's color scale.
     * Only then should scalar field values be injected into the shared color
     * scale domain — injecting them unconditionally would corrupt categorical
     * or other numeric color encodings on sibling marks.
     */
    const markUsesColorScale = $derived(fill === 'value' || effectiveStroke === 'value');

    /**
     * Coarse 20×20 sample of the value function in data-space.
     * Used only to give `<Mark>` representative values for color-scale
     * domain/type detection.  The full-resolution grid is (re-)computed on
     * every render inside `computeContours`, so impure functions (closures
     * over reactive state, `performance.now()`, etc.) always reflect the
     * current render state.
     */
    const samplerSampleValues = $derived.by((): number[] | null => {
        if (!markUsesColorScale || !isSamplerMode || typeof value !== 'function') return null;
        if (x1Prop == null || x2Prop == null || y1Prop == null || y2Prop == null) return null;
        const SAMPLES = 20;
        const dx = x2Prop - x1Prop;
        const dy = y2Prop - y1Prop;
        const fn = value as (x: number, y: number) => number;
        const out: number[] = [];
        for (let yi = 0; yi < SAMPLES; yi++) {
            for (let xi = 0; xi < SAMPLES; xi++) {
                const v = fn(
                    x1Prop + ((xi + 0.5) / SAMPLES) * dx,
                    y1Prop + ((yi + 0.5) / SAMPLES) * dy
                );
                if (isFinite(v)) out.push(v);
            }
        }
        return out.length > 0 ? out : null;
    });

    function resolveInterpolate(interp: ContourMarkProps['interpolate']): InterpolateFunction {
        if (typeof interp === 'function') return interp;
        // Default to nearest for scatter mode
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

    /** Pixel-space bounds of the plot area. */
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

    /** Resolve a value accessor on a single datum. */
    function resolveValue(datum: any): number | null {
        if (value == null) return typeof datum === 'number' ? datum : null;
        if (typeof value === 'string') return datum[value] ?? null;
        if (typeof value === 'function') return (value as (d: any) => number)(datum);
        return null;
    }

    type ContourGeometry = {
        type: 'MultiPolygon';
        coordinates: number[][][][];
        value: number;
    };

    /**
     * Compute the scalar-field grid and run marching squares.
     * Returns an array of GeoJSON MultiPolygon objects in SVG pixel coordinates,
     * each carrying the threshold `value` that produced it.
     */
    function computeContours(scaledData: ScaledDataRecord[]): ContourGeometry[] | null {
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
            // Dense grid: each datum is a value; flip rows (y-up → screen y-down)
            const Vraw = (data as any[]).map((d) => resolveValue(d) ?? NaN);
            V = new Array(n);
            for (let row = 0; row < h; ++row) {
                const srcRow = h - 1 - row;
                for (let col = 0; col < w; ++col) {
                    V[row * w + col] = Vraw[srcRow * w + col];
                }
            }
        } else if (isSamplerMode) {
            // Sampler mode: evaluate (x, y) => number on the full pixel grid
            if (typeof value !== 'function') return null;
            const xScale = scaleLinear().range([x1Prop!, x2Prop!]).domain([bx1, bx2]);
            const yScale = scaleLinear().range([y1Prop!, y2Prop!]).domain([by1, by2]);
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
        } else if (scaledData.length > 0) {
            // Scatter interpolation mode
            const validData = scaledData.filter((d) => d.valid && d.x != null && d.y != null);
            if (validData.length === 0) return null;
            const kx = w / dx;
            const ky = h / dy;
            const index = validData.map((_, i) => i);
            const IX = new Float64Array(validData.map((d) => ((d.x as number) - bx1) * kx));
            const IY = new Float64Array(validData.map((d) => ((d.y as number) - by1) * ky));
            const rawValues = validData.map((d) => d.resolved?.fill);
            if (rawValues.some((v) => v != null)) {
                V = Array.from(interpolateFn(index, w, h, IX, IY, rawValues));
            }
        }

        if (!V) return null;

        // --- Optional Gaussian blur ---
        if (blur > 0) blur2({ data: V, width: w, height: h }, blur);

        // --- Compute thresholds ---
        const T = computeThresholds(V, w, h, thresholds, interval);
        if (T.length === 0) return null;

        // --- Run marching squares ---
        const kx = w / dx;
        const ky = h / dy;
        const contourFn = contours().size([w, h]).smooth(smooth);

        const contourData: ContourGeometry[] = T.map((t) => {
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

            return geom;
        });

        return contourData;
    }

    /** Compute an array of threshold tick values from the V grid. */
    function computeThresholds(
        V: number[],
        w: number,
        h: number,
        thresholdSpec: ContourMarkProps['thresholds'],
        intervalSpec: ContourMarkProps['interval']
    ): number[] {
        // Compute finite extent
        let vMin = Infinity,
            vMax = -Infinity;
        for (const v of V) {
            if (isFinite(v)) {
                if (v < vMin) vMin = v;
                if (v > vMax) vMax = v;
            }
        }
        if (!isFinite(vMin) || !isFinite(vMax) || vMin === vMax) return [];

        // Interval takes precedence when thresholds is not set
        if (thresholdSpec == null && intervalSpec != null) {
            if (typeof intervalSpec === 'number') {
                const step = intervalSpec;
                return range(Math.floor(vMin / step) * step, vMax, step);
            }
            return intervalSpec.range(intervalSpec.floor(vMin), vMax);
        }

        // Default to Sturges' formula (returns a count, handled below)
        const tSpec: any = thresholdSpec ?? thresholdSturges;

        // thresholds can itself be a d3-compatible interval object
        if (typeof tSpec === 'object' && tSpec !== null && 'range' in tSpec) {
            return tSpec.range(tSpec.floor(vMin), vMax);
        }

        // Already an array
        if (Array.isArray(tSpec)) return tSpec;

        // Function form — may return a count (number) or an array of thresholds
        let resolved: any = tSpec;
        if (typeof tSpec === 'function') {
            const finiteV = V.filter(isFinite);
            resolved = tSpec(finiteV, vMin, vMax);
        }

        if (Array.isArray(resolved)) return resolved;

        // Count form: approximately `resolved` nicely-spaced levels
        const count = resolved as number;
        const [nMin, nMax] = nice(vMin, vMax, count) as [number, number];
        const tz = ticks(nMin, nMax, count);
        while (tz.length > 0 && tz[tz.length - 1] >= vMax) tz.pop();
        while (tz.length > 1 && tz[1] < vMin) tz.shift();
        return tz;
    }

    /** Resolve a fill or stroke prop for a given contour level. */
    function resolveColor(prop: string | undefined, threshold: number): string {
        if (prop === 'value') {
            return (plot.scales.color?.fn(threshold) as string) ?? 'currentColor';
        }
        return prop ?? 'none';
    }

    /** Build the inline style string for a single contour path. */
    function contourStyle(threshold: number): string {
        const parts: string[] = [];
        parts.push(`fill:${resolveColor(fill, threshold)}`);
        parts.push(`stroke:${resolveColor(effectiveStroke, threshold)}`);
        if (strokeWidth != null) parts.push(`stroke-width:${strokeWidth}`);
        if (strokeOpacity != null) parts.push(`stroke-opacity:${strokeOpacity}`);
        if (fillOpacity != null) parts.push(`fill-opacity:${fillOpacity}`);
        if (opacity != null) parts.push(`opacity:${opacity}`);
        if (strokeMiterlimit != null) parts.push(`stroke-miterlimit:${strokeMiterlimit}`);
        return parts.join(';');
    }

    const path = geoPath();

    // --- Mark registration data ---

    /** For dense grid mode: synthetic records with symbol-keyed x/y/value. */
    const denseMarkData = $derived(
        isDenseGridMode
            ? (data as any[]).map((d, i) => ({
                  [X]: i % widthProp!,
                  [Y]: Math.floor(i / widthProp!),
                  ...(markUsesColorScale ? { [RAW_VALUE]: resolveValue(d) } : {})
              }))
            : null
    );

    /**
     * For sampler mode: corner records to establish x/y scale domains, plus
     * the coarse sample values for color-scale domain registration.
     */
    const samplerMarkData = $derived.by(() => {
        if (!isSamplerMode) return null;
        const x1 = x1Prop,
            x2 = x2Prop,
            y1 = y1Prop,
            y2 = y2Prop;
        if (x1 == null || x2 == null || y1 == null || y2 == null) return null;
        const samples = samplerSampleValues;
        const records: any[] = [
            { [X]: x1, [Y]: y1 },
            { [X]: x2, [Y]: y2 }
        ];
        if (markUsesColorScale && samples) {
            for (const v of samples) {
                records.push({ [X]: x1, [Y]: y1, [RAW_VALUE]: v });
            }
        }
        return records as DataRecord[];
    });

    // Scatter mode needs the fill channel as the delivery mechanism for scalar
    // values into computeContours (via scaledData[].resolved.fill) regardless
    // of whether threshold-based coloring is active. Dense-grid and sampler
    // modes read values directly from data/function, so the fill channel is
    // only needed there when color scale registration is required.
    const isScatterMode = $derived(!isSamplerMode && !isDenseGridMode && data != null);

    const markChannels = $derived(
        isScatterMode || markUsesColorScale ? (['x', 'y', 'fill'] as const) : (['x', 'y'] as const)
    );

    const markFill = $derived(
        isScatterMode || markUsesColorScale
            ? isDenseGridMode || isSamplerMode
                ? (RAW_VALUE as any)
                : // scatter mode: bypass color scale when "value" keyword isn't used
                  markUsesColorScale
                  ? (value as any)
                  : ({ value: value as any, scale: false } as any)
            : undefined
    );

    const markX = $derived(isDenseGridMode || isSamplerMode ? (X as any) : undefined);
    const markY = $derived(isDenseGridMode || isSamplerMode ? (Y as any) : undefined);
</script>

<Mark
    type={'contour' as MarkType}
    data={isDenseGridMode
        ? (denseMarkData as DataRecord[])
        : isSamplerMode
          ? ((samplerMarkData ?? []) as DataRecord[])
          : ((data ?? []) as DataRecord[])}
    channels={markChannels as any}
    x={markX}
    y={markY}
    fill={markFill}
    {...options}>
    {#snippet children({ scaledData })}
        {@const contourPaths = computeContours(scaledData)}
        {#if contourPaths}
            <g clip-path={clipPath} class={className || null} aria-label="contour">
                {#each contourPaths as contourGeom (contourGeom.value)}
                    <path d={path(contourGeom as any)} style={contourStyle(contourGeom.value)} />
                {/each}
            </g>
        {/if}
    {/snippet}
</Mark>
