<!-- @component
    Renders a raster image in one of three modes:

    **Dense grid mode** (`data` is an array, `width` and `height` are set, no
    `x`/`y` channels): the data is treated as a row-major grid of fill values.
    `fill` defaults to the identity function (each datum is its own value).

    **Function sampling mode** (`data` is omitted/null, `fill` and/or
    `fillOpacity` are `(x, y) => value` functions): the mark evaluates the
    function on a pixel grid, converting pixel coords to data coords via scale
    inversion, then maps results through the color scale.

    **Scatter interpolation mode** (`data` is an array with `x`/`y` channels):
    each datum contributes a position and fill value; the mark spatially
    interpolates over the grid using the chosen `interpolate` method.
-->
<script lang="ts" generics="Datum extends DataRow">
    interface RasterMarkProps {
        /**
         * Input data. For **dense grid** mode supply a flat row-major array and
         * set `width`/`height`. Omit (or set null) for **function-sampling**
         * mode. For **scatter interpolation** supply an array of records with
         * `x`/`y` channels.
         */
        data?: Datum[] | null;
        /** x position channel (scatter interpolation mode) */
        x?: ChannelAccessor<Datum>;
        /** y position channel (scatter interpolation mode) */
        y?: ChannelAccessor<Datum>;
        /**
         * fill color channel, identity function for dense grid, or an
         * `(x, y) => value` function for function-sampling mode
         */
        fill?: ChannelAccessor<Datum> | ((x: number, y: number) => any);
        /**
         * fill opacity channel or an `(x, y) => number` function for
         * function-sampling mode
         */
        fillOpacity?: ChannelAccessor<Datum> | ((x: number, y: number) => number);
        /** left bound of the raster in data coordinates */
        x1?: number;
        /** top bound of the raster in data coordinates */
        y1?: number;
        /** right bound of the raster in data coordinates */
        x2?: number;
        /** bottom bound of the raster in data coordinates */
        y2?: number;
        /**
         * explicit pixel-grid width; required for dense grid mode, also used
         * to set the canvas resolution in other modes (overrides `pixelSize`)
         */
        width?: number;
        /**
         * explicit pixel-grid height; required for dense grid mode, also used
         * to set the canvas resolution in other modes (overrides `pixelSize`)
         */
        height?: number;
        /** pixel size in screen pixels (default 1); ignored when `width`/`height` are set */
        pixelSize?: number;
        /** Gaussian blur radius in grid pixels (default 0) */
        blur?: number;
        /**
         * spatial interpolation for scatter mode:
         * `"none"` | `"nearest"` | `"barycentric"` | `"random-walk"` or a
         * custom `(index, w, h, X, Y, V) => W` function
         */
        interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk' | InterpolateFunction;
        /** CSS image-rendering property (default `"auto"`) */
        imageRendering?: string;
        clipPath?: string;
    }

    import type {
        DataRow,
        DataRecord,
        ChannelAccessor,
        ScaledDataRecord,
        MarkType
    } from '../types/index.js';
    import { blurImage, extent } from 'd3-array';
    import { rgb } from 'd3-color';
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
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    const DEFAULTS = {
        ...getPlotDefaults().raster
    };

    let markProps: RasterMarkProps = $props();

    const {
        data,
        fill,
        fillOpacity,
        x1: x1Prop,
        y1: y1Prop,
        x2: x2Prop,
        y2: y2Prop,
        width: widthProp,
        height: heightProp,
        pixelSize = 1,
        blur = 0,
        interpolate,
        imageRendering = 'auto',
        ...options
    }: RasterMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    /** No data: fill/fillOpacity are (x,y) functions */
    const isSamplerMode = $derived(data == null);

    /**
     * Dense grid: data is a flat array, width+height are given, no x/y
     * channels. Each datum is its own fill value (unless fill is specified).
     */
    const isDenseGridMode = $derived(
        data != null &&
            widthProp != null &&
            heightProp != null &&
            (options as any).x == null &&
            (options as any).y == null
    );

    const interpolateFn = $derived(resolveInterpolate(interpolate));

    function resolveInterpolate(interp: RasterMarkProps['interpolate']): InterpolateFunction {
        if (typeof interp === 'function') return interp;
        if (interp == null) return interpolateNone;
        switch (String(interp).toLowerCase()) {
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

    /** Pixel-space bounds of the raster image. */
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

    /** Build the off-screen canvas and return it together with its bounds. */
    function computeCanvas(scaledData: ScaledDataRecord[]): {
        canvas: HTMLCanvasElement;
        bx1: number;
        by1: number;
        dx: number;
        dy: number;
    } | null {
        if (typeof document === 'undefined') return null;

        const { bx1, by1, bx2, by2 } = getBounds();
        const dx = bx2 - bx1;
        const dy = by2 - by1;
        // Canvas pixel dimensions
        const w = widthProp ?? Math.round(Math.abs(dx) / pixelSize);
        const h = heightProp ?? Math.round(Math.abs(dy) / pixelSize);
        if (w <= 0 || h <= 0) return null;
        const n = w * h;

        // --- Populate fill value array F (and optional opacity array FO) ---
        let F: any[] | null = null;
        let FO: number[] | null = null;

        if (isDenseGridMode) {
            // Build the value array in data order, then flip rows so that
            // data row 0 (y=0) renders at the bottom of the canvas, matching
            // the standard y-up chart convention.
            let Fraw: any[];
            if (typeof fill === 'function') {
                Fraw = (data as any[]).map(fill as (d: any) => any);
            } else if (fill != null && typeof fill !== 'string') {
                Fraw = (data as any[]).map((d) =>
                    typeof fill === 'string' ? d[fill] : (fill as (d: any) => any)(d)
                );
            } else {
                Fraw = data as any[];
            }
            // Flip vertically: canvas row 0 (top) = data row h-1 (highest y).
            F = new Array(n);
            for (let row = 0; row < h; ++row) {
                const srcRow = h - 1 - row;
                for (let col = 0; col < w; ++col) {
                    F[row * w + col] = Fraw[srcRow * w + col];
                }
            }
        } else if (isSamplerMode) {
            // Evaluate f(x,y) for every grid pixel
            const xScale = scaleLinear().range([x1Prop!, x2Prop!]).domain([bx1, bx2]);
            const yScale = scaleLinear().range([y1Prop!, y2Prop!]).domain([by1, by2]);
            const kx = dx / w;
            const ky = dy / h;
            if (typeof fill === 'function') {
                F = new Array(n);
                let i = 0;
                for (let yi = 0.5; yi < h; ++yi) {
                    for (let xi = 0.5; xi < w; ++xi, ++i) {
                        const xData = xScale(bx1 + xi * kx);
                        const yData = yScale(by1 + yi * ky);
                        F[i] = (fill as (x: any, y: any) => any)(xData, yData);
                    }
                }
            }
            if (typeof fillOpacity === 'function') {
                FO = new Array(n);
                let i = 0;
                for (let yi = 0.5; yi < h; ++yi) {
                    for (let xi = 0.5; xi < w; ++xi, ++i) {
                        const xData = xScale(bx1 + xi * kx);
                        const yData = yScale(by1 + yi * ky);
                        FO[i] = (fillOpacity as (x: any, y: any) => number)(xData, yData);
                    }
                }
            }
        } else if (scaledData.length > 0) {
            // Scatter interpolation: map data points onto grid
            const validData = scaledData.filter((d) => d.valid && d.x != null && d.y != null);

            if (validData.length > 0) {
                const kx = w / dx;
                const ky = h / dy;
                const index = validData.map((_, i) => i);
                const IX = new Float64Array(validData.map((d) => ((d.x as number) - bx1) * kx));
                const IY = new Float64Array(validData.map((d) => ((d.y as number) - by1) * ky));
                // Use raw pre-color-scale fill values so we can interpolate
                // numerically, then apply the color scale after interpolation.
                const rawFill = validData.map((d) => d.resolved?.fill);
                if (rawFill.some((v) => v != null)) {
                    F = Array.from(interpolateFn(index, w, h, IX, IY, rawFill));
                }
                if (fillOpacity !== undefined) {
                    const rawFO = validData.map((d) => d.resolved?.fillOpacity);
                    if (rawFO.some((v) => v != null)) {
                        FO = Array.from(interpolateFn(index, w, h, IX, IY, rawFO)) as number[];
                    }
                }
            }
        }

        // --- Rasterize: map value array to RGBA pixel data ---
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(w, h);
        const imgData = imageData.data;

        // For sampler mode the fill function values are not registered with the
        // Plot's mark data (to avoid reactive cycles), so the color scale may
        // not have a domain set.  In that case we compute the F extent here and
        // rescale through the plot color scale using a normalised [0,1] input.
        let colorFn: (v: any) => any = plot.scales.color?.fn ?? ((x: any) => x);
        if (isSamplerMode && F && plot.scales.color?.fn) {
            const [fMin, fMax] = extent(F.filter((v) => v != null) as number[]);
            const colorDomain = plot.scales.color.fn.domain?.() ?? [];
            const domainIsEmpty =
                colorDomain.length === 0 || colorDomain[0] === colorDomain[colorDomain.length - 1];
            if (domainIsEmpty && fMin != null && fMax != null && fMin !== fMax) {
                // Remap raw F values into the color scale's current domain range
                const [dMin, dMax] =
                    colorDomain.length >= 2
                        ? [colorDomain[0] as number, colorDomain[colorDomain.length - 1] as number]
                        : [0, 1];
                const span = fMax - fMin;
                colorFn = (v: any) =>
                    plot.scales.color!.fn(dMin + ((v - fMin) / span) * (dMax - dMin));
            }
        }

        const defColor = typeof fill === 'string' ? rgb(fill) : null;
        const defR = defColor?.r ?? 0;
        const defG = defColor?.g ?? 0;
        const defB = defColor?.b ?? 0;
        const defA = typeof fillOpacity === 'number' ? fillOpacity * 255 : F ? 255 : 0;

        for (let i = 0; i < n; ++i) {
            const j = i << 2;
            let r = defR,
                g = defG,
                b = defB,
                a = defA;

            if (F) {
                const colorVal = colorFn(F[i]);
                if (colorVal == null) {
                    imgData[j + 3] = 0;
                    continue;
                }
                const c = rgb(String(colorVal));
                if (c) ({ r, g, b } = c);
                a = 255;
            }

            if (FO != null) a = (FO[i] ?? 0) * 255;

            imgData[j + 0] = r;
            imgData[j + 1] = g;
            imgData[j + 2] = b;
            imgData[j + 3] = a;
        }

        if (blur > 0) blurImage(imageData, blur);
        ctx.putImageData(imageData, 0, 0);

        return { canvas, bx1, by1, dx, dy };
    }

    /**
     * Resolves the fill value for a single datum in dense grid mode.
     * The datum may be a raw primitive or a record; `fill` may be a
     * field name, accessor, or omitted (identity).
     */
    function resolveFillValue(datum: any): any {
        if (fill == null) return datum; // identity: datum IS the value
        if (typeof fill === 'string') return datum[fill];
        if (typeof fill === 'function') return (fill as (d: any) => any)(datum);
        return datum;
    }

    /**
     * For dense grid mode, fold the flat array into records keyed by Symbols
     * (like recordizeXY). Symbol keys survive `{ ...d, [INDEX]: i }` spreading
     * in Mark.svelte, so scale domains are computed from the actual values.
     * The grid column/row indices become x/y channels so the x and y scale
     * domains are also registered (0..width-1 and 0..height-1).
     */
    const denseMarkData = $derived(
        isDenseGridMode
            ? (data as any[]).map((d, i) => ({
                  [X]: i % widthProp!,
                  [Y]: Math.floor(i / widthProp!),
                  [RAW_VALUE]: resolveFillValue(d)
              }))
            : null
    );

    /**
     * For sampler mode, pass two corner records so the Plot can register the
     * x/y scale domains from x1/y1/x2/y2.  We intentionally do NOT pre-evaluate
     * the fill function here — doing so inside a $derived creates a reactive
     * cycle because the resulting array (new reference each evaluation) feeds
     * back through Mark → plot.scales → scaledData → effect → mark.data.
     * The color scale domain is handled directly inside computeCanvas instead.
     */
    const samplerMarkData = $derived.by(() => {
        if (!isSamplerMode) return null;
        const x1 = x1Prop,
            x2 = x2Prop,
            y1 = y1Prop,
            y2 = y2Prop;
        if (x1 == null || x2 == null || y1 == null || y2 == null) return null;
        return [
            { [X]: x1, [Y]: y1 },
            { [X]: x2, [Y]: y2 }
        ] as unknown as DataRecord[];
    });

    const markChannels = $derived(
        isDenseGridMode
            ? (['x', 'y', 'fill'] as const)
            : isSamplerMode
              ? (['x', 'y'] as const)
              : (['x', 'y', 'fill', 'fillOpacity'] as const)
    );

    const markFill = $derived(
        isDenseGridMode ? (RAW_VALUE as any) : !isSamplerMode ? (fill as any) : undefined
    );

    const markX = $derived(isDenseGridMode || isSamplerMode ? (X as any) : undefined);
    const markY = $derived(isDenseGridMode || isSamplerMode ? (Y as any) : undefined);
</script>

<Mark
    type={'raster' as MarkType}
    data={isDenseGridMode
        ? (denseMarkData as DataRecord[])
        : isSamplerMode
          ? ((samplerMarkData ?? []) as DataRecord[])
          : ((data ?? []) as DataRecord[])}
    channels={markChannels as any}
    x={markX}
    y={markY}
    fill={markFill}
    fillOpacity={!isSamplerMode && !isDenseGridMode ? (fillOpacity as any) : undefined}
    {...options}>
    {#snippet children({ scaledData })}
        {@const result = computeCanvas(scaledData)}
        {#if result}
            <image
                transform="translate({plot.options.marginLeft},{plot.options
                    .marginTop}) scale({Math.sign(result.dx)},{Math.sign(result.dy)})"
                width={Math.abs(result.dx)}
                height={Math.abs(result.dy)}
                preserveAspectRatio="none"
                clip-path={options.clipPath}
                image-rendering={imageRendering}
                href={result.canvas.toDataURL()} />
        {/if}
    {/snippet}
</Mark>
