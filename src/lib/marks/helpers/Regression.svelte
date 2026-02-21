<script module lang="ts">
    import type { BaseMarkProps, ChannelAccessor } from '../../types/index.js';

    export type RegressionType = 'linear' | 'quad' | 'poly' | 'exp' | 'log' | 'pow' | 'loess';

    export type RegressionOptions = BaseMarkProps & {
        /** the horizontal position channel; bound to the x scale */
        x: ChannelAccessor;
        /** the vertical position channel; bound to the y scale */
        y: ChannelAccessor;
        /** the regression model type */
        type?: RegressionType;
        /**
         * If order is specified, sets the regression's order to the specified number.
         * For example, if order is set to 4, the regression generator will perform a
         * fourth-degree polynomial regression. Likewise, if order is set to 2, the
         * regression generator will perform a quadratic regression. Be careful about
         * attempting to fit your data with higher order polynomials; though the
         * regression line will fit your data with a high determination coefficient,
         * it may have little predictive power for data outside of your domain.
         */
        order?: number;
        /** the base for logarithmic regression */
        base?: number;
        /** the bandwidth for LOESS regression, as a fraction of the data range (0 to 1) */
        span?: number;
        /** the confidence level for confidence bands (e.g. 0.95 for 95% confidence) */
        confidence?: number | false;
    };
</script>

<script lang="ts">
    import { getContext } from 'svelte';
    import { Line, Area } from '../../index.js';

    import {
        regressionLinear,
        regressionQuad,
        regressionPoly,
        regressionExp,
        regressionLog,
        regressionPow,
        regressionLoess
    } from '../../regression/index.js';
    import { resolveChannel } from '../../helpers/resolve.js';
    import { confidenceInterval } from '../../helpers/math.js';
    import callWithProps from '../../helpers/callWithProps.js';
    import type { DataRecord, FacetContext, RawValue } from 'svelteplot/types/index.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    type RegressionData = { x: number; y: number };
    type RegressionOutput = [number, number][] & {
        predict?: (x: number) => number;
        predictMany?: (points: number[]) => number[];
    };
    type RegressionGenerator = ((data: RegressionData[]) => RegressionOutput) & {
        x: (fn: (d: RegressionData) => number) => RegressionGenerator;
        y: (fn: (d: RegressionData) => number) => RegressionGenerator;
        domain?: (domain: [number, number]) => RegressionGenerator;
        order?: (order: number) => RegressionGenerator;
        base?: (base: number) => RegressionGenerator;
        bandwidth?: (span: number) => RegressionGenerator;
    };
    type RegressionFactory = () => RegressionGenerator;

    interface RegressionProps extends RegressionOptions {
        data: DataRecord[];
        dependent: 'x' | 'y';
    }

    // Normalize all regression constructors behind one callable adapter shape.
    const regressions: Record<RegressionType, RegressionFactory> = {
        linear: regressionLinear as RegressionFactory,
        quad: regressionQuad as RegressionFactory,
        poly: regressionPoly as RegressionFactory,
        exp: regressionExp as RegressionFactory,
        log: regressionLog as RegressionFactory,
        pow: regressionPow as RegressionFactory,
        loess: regressionLoess as RegressionFactory
    };

    function maybeRegression(name: RegressionType): RegressionFactory {
        const fn = regressions[name];
        if (fn) return fn;
        throw new Error(`unknown regression ${name}`);
    }

    // Regression engines operate on numeric domains; convert Date channels to epoch ms.
    function toNumeric(value: RawValue): number {
        return value instanceof Date ? value.valueOf() : Number(value);
    }

    // Convert generated points back to Date for time scales so downstream marks render correctly.
    function toOutputX(value: number, scaleType: string): RawValue {
        return scaleType === 'time' ? new Date(value) : value;
    }

    function makeTicks(domain: [number, number], count = 40): number[] {
        const [start, end] = domain;
        if (start === end) return [start];
        const tickCount = Math.max(1, count);
        const step = (end - start) / tickCount;
        return Array.from({ length: tickCount + 1 }, (_, i) => start + i * step);
    }

    const plot = usePlot();

    let {
        data,
        dependent,
        type = 'linear',
        order = 3,
        base = Math.E,
        span = 0.3,
        confidence = 0.99,
        class: className = '',
        ...options
    }: RegressionProps = $props();

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    const testFacet = $derived(getTestFacet());

    const filteredData = $derived(data.filter((d) => testFacet(d, options as any)));

    const independent: 'x' | 'y' = $derived(dependent === 'x' ? 'y' : 'x');

    const regressionFn = $derived(maybeRegression(type));

    // Build a clean numeric input set for regression fitting, dropping invalid rows early.
    const regressionInput = $derived(
        filteredData
            .map((d) => ({
                x: toNumeric(resolveChannel(independent, d, options as any)),
                y: toNumeric(resolveChannel(dependent, d, options as any))
            }))
            .filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y))
    );

    const independentDomain = $derived.by(() => {
        // Prefer the active scale domain, but fall back to observed data when the scale
        // is still initializing (common in tests and first render passes).
        const scaleDomain = plot.scales[independent].domain;
        const scaleStart = toNumeric(scaleDomain[0]);
        const scaleEnd = toNumeric(scaleDomain.at(-1) ?? scaleDomain[0]);
        if (Number.isFinite(scaleStart) && Number.isFinite(scaleEnd)) {
            return scaleStart <= scaleEnd
                ? ([scaleStart, scaleEnd] as [number, number])
                : ([scaleEnd, scaleStart] as [number, number]);
        }
        if (regressionInput.length === 0) return null;
        let min = Infinity;
        let max = -Infinity;
        for (const point of regressionInput) {
            if (point.x < min) min = point.x;
            if (point.x > max) max = point.x;
        }
        if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
        return min <= max ? ([min, max] as [number, number]) : ([max, min] as [number, number]);
    });

    const regression = $derived(
        callWithProps(regressionFn, [], {
            x: (d: RegressionData) => d.x,
            y: (d: RegressionData) => d.y,
            ...(type === 'poly' ? { order } : {}),
            ...(type === 'log' ? { base } : {}),
            ...(type !== 'loess' && independentDomain != null ? { domain: independentDomain } : {}),
            ...(type === 'loess' ? { bandwidth: span } : {})
        })(regressionInput)
    );

    const regrPoints = $derived.by(() => {
        if (independentDomain == null) return [] as number[];
        // Use scale ticks when available; otherwise synthesize evenly spaced samples.
        const ticks = plot.scales[independent].fn
            .ticks(40)
            .map(toNumeric)
            .filter((value): value is number => Number.isFinite(value));
        const points = ticks.length > 0 ? ticks : makeTicks(independentDomain, 40);
        return [
            ...new Set(
                [independentDomain[0], ...points, independentDomain[1]].filter(
                    (value): value is number => Number.isFinite(value)
                )
            )
        ].sort((a, b) => a - b);
    });

    const regrData = $derived.by(() => {
        // Prefer batch prediction when supported, then per-point predict, then raw curve output.
        if (typeof regression.predictMany === 'function') {
            return regression.predictMany(regrPoints).map((__y, i) => ({
                __x: toOutputX(regrPoints[i], plot.scales[independent].type),
                __y
            }));
        }
        if (typeof regression.predict === 'function') {
            return regrPoints.map((point) => ({
                __x: toOutputX(point, plot.scales[independent].type),
                __y: regression.predict!(point)
            }));
        }
        return regression.map(([__x, __y]) => ({
            __x: toOutputX(__x, plot.scales[independent].type),
            __y
        }));
    });

    const stroke = $derived(
        options.stroke != null && filteredData.length
            ? resolveChannel('stroke', filteredData[0], options as any)
            : null
    );

    const confBandGen = $derived(
        // Confidence bands require a predictor function and at least 3 points.
        confidence !== false &&
            typeof confidence === 'number' &&
            typeof regression.predict === 'function' &&
            regressionInput.length > 2
            ? confidenceInterval(regressionInput, regression.predict, 1 - confidence)
            : null
    );

    const confBandData = $derived.by(() => {
        if (confBandGen == null) return [];
        return regrPoints.map((x) => {
            const { x: __x, left, right } = confBandGen(x);
            return {
                __x: toOutputX(__x, plot.scales[independent].type),
                __y1: left,
                __y2: right
            };
        });
    });
</script>

{#if filteredData.length}
    <g class="regression-{independent} {className || ''}">
        <Line
            data={regrData}
            {...{
                ...options,
                fx: null,
                fy: null,
                stroke,
                x: dependent === 'y' ? '__x' : '__y',
                y: dependent === 'y' ? '__y' : '__x'
            }} />
        {#if confBandData.length}
            <Area
                data={confBandData}
                {...dependent === 'y'
                    ? { x1: '__x', y1: '__y1', y2: '__y2' }
                    : { y1: '__x', x1: '__y1', x2: '__y2' }}
                fill={stroke || 'currentColor'}
                opacity={0.15} />
        {/if}
    </g>
{/if}
