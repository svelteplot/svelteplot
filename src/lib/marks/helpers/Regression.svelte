<script module lang="ts">
    import type { BaseMarkProps, ChannelAccessor, FacetContext } from '../../types/index.js';

    type RegressionType = 'linear' | 'quad' | 'poly' | 'exp' | 'log' | 'pow' | 'loess';

    export type RegressionMarkProps = BaseMarkProps & {
        /** the horizontal position channel; bound to the x scale */
        x: ChannelAccessor;
        /** the vertical position channel; bound to the y scale */
        y: ChannelAccessor;
        /** the regression model type */
        type: RegressionType;
        /**
         * If order is specified, sets the regression's order to the specified number.
         * For example, if order is set to 4, the regression generator will perform a
         * fourth-degree polynomial regression. Likewise, if order is set to 2, the
         * regression generator will perform a quadratic regression. Be careful about
         * attempting to fit your data with higher order polynomials; though the
         * regression line will fit your data with a high determination coefficient,
         * it may have little predictive power for data outside of your domain.
         */
        order: number;
        /** the base for logarithmic regression */
        base: number;
        /** the bandwidth for LOESS regression, as a fraction of the data range (0 to 1) */
        span: number;
        /** the confidence level for confidence bands (e.g. 0.95 for 95% confidence) */
        confidence: number;
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
    import { isDate } from '../../helpers/typeChecks.js';

    const regressions = new Map<RegressionType, typeof regressionLinear>([
        ['linear', regressionLinear],
        ['quad', regressionQuad],
        ['poly', regressionPoly],
        ['exp', regressionExp],
        ['log', regressionLog],
        ['pow', regressionPow],
        ['loess', regressionLoess]
    ]);

    function maybeRegression(name: string) {
        name = `${name}`.toLowerCase();
        if (regressions.has(name)) return regressions.get(name);
        throw new Error('unknown regression ' + name);
    }

    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let {
        data,
        dependent,
        type = 'linear',
        order = 3,
        base = 2.71828,
        span = 0.3,
        confidence = 0.99,
        class: className = null,
        ...options
    }: RegressionMarkProps & { dependent: 'x' | 'y' } = $props();

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    let testFacet = $derived(getTestFacet());

    let filteredData = $derived(data.filter((d) => testFacet(d, options)));

    let independent: 'x' | 'y' = $derived(dependent === 'x' ? 'y' : 'x');

    let regressionFn = $derived(maybeRegression(type));

    let regression = $derived(
        callWithProps(regressionFn, [], {
            x: (d) => resolveChannel(independent, d, options),
            y: (d) => resolveChannel(dependent, d, options),
            ...(type === 'poly' ? { order } : {}),
            ...(type === 'log' ? { base } : {}),
            ...(!type.startsWith('loess') ? { domain: plot.scales[independent].domain } : {}),
            ...(type === 'loess' ? { bandwidth: span } : {})
        })(filteredData)
    );

    let regrPoints = $derived([
        ...new Set([
            plot.scales[independent].domain[0],
            ...plot.scales[independent].fn.ticks(40),
            plot.scales[independent].domain[1]
        ])
    ]);

    let regrData = $derived(
        regression.predictMany
            ? regression.predictMany(regrPoints).map((__y, i) => ({ __x: regrPoints[i], __y }))
            : regression.predict
              ? regrPoints.map((__x) => {
                    // const __x = x;
                    const __y = regression.predict(__x);
                    return { __x, __y };
                })
              : regression.map(([__x, __y]) => ({
                    __x: plot.scales[independent].type === 'time' ? new Date(__x) : __x,
                    __y
                }))
    );

    let stroke = $derived(
        options.stroke != null ? resolveChannel('stroke', filteredData[0], options) : null
    );

    let confBandGen = $derived(
        confidence !== false && regression.predict
            ? confidenceInterval(
                  data
                      .map((d) => ({
                          x: resolveChannel(independent, d, options),
                          y: resolveChannel(dependent, d, options)
                      }))
                      .filter(
                          ({ x, y }) => (Number.isFinite(x) || isDate(x)) && Number.isFinite(y)
                      ),
                  regression.predict,
                  1 - confidence
              )
            : null
    );

    let confBandData = $derived(
        confidence !== false && regression.predict
            ? regrPoints.map((x) => {
                  const { x: __x, left, right } = confBandGen(x);
                  return { __x, __y1: left, __y2: right };
              })
            : []
    );
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
