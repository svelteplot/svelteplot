import {
    scaleBand,
    scaleDiverging,
    scaleDivergingLog,
    scaleDivergingPow,
    scaleDivergingSqrt,
    scaleDivergingSymlog,
    scaleLinear,
    scaleLog,
    scaleOrdinal,
    scalePoint,
    scalePow,
    scaleQuantile,
    scaleQuantize,
    scaleSequential,
    scaleSequentialLog,
    scaleSequentialPow,
    scaleSequentialQuantile,
    scaleSequentialSqrt,
    scaleSequentialSymlog,
    scaleSqrt,
    scaleSymlog,
    scaleThreshold,
    scaleTime
} from 'd3-scale';
import { range as d3Range } from 'd3-array';
import type {
    ColorScaleOptions,
    PlotDefaults,
    PlotOptions,
    RawValue,
    ScaleName,
    ScaleOptions,
    ScaleType
} from '../types.js';
import {
    categoricalSchemes,
    isCategoricalScheme,
    isDivergingScheme,
    isOrdinalScheme,
    isQuantitativeScheme,
    ordinalScheme,
    quantitativeScheme
} from './colors.js';

import callWithProps from './callWithProps.js';
import { interpolateLab, interpolateRound } from 'd3-interpolate';
import { coalesce, maybeNumber } from './index.js';
import { getLogTicks } from './getLogTicks.js';
import { isPlainObject } from 'es-toolkit';

const Scales: Record<
    ScaleType,
    (domain?: number[], range?: [number, number]) => (val: any) => any
> = {
    point: scalePoint,
    band: scaleBand,
    linear: scaleLinear,
    time: scaleTime,
    sqrt: scaleSqrt,
    pow: scalePow,
    log: scaleLog,
    symlog: scaleSymlog,
    ordinal: scaleOrdinal,
    sequential: scaleSequential,
    diverging: scaleDiverging
};

const SequentialScales = {
    linear: scaleSequential,
    log: scaleSequentialLog,
    symlog: scaleSequentialSymlog,
    pow: scaleSequentialPow,
    sqrt: scaleSequentialSqrt,
    'quantile-cont': scaleSequentialQuantile
};

const DivergingScales = {
    diverging: scaleDiverging,
    'diverging-log': scaleDivergingLog,
    'diverging-symlog': scaleDivergingSymlog,
    'diverging-pow': scaleDivergingPow,
    'diverging-sqrt': scaleDivergingSqrt
};

const ThresholdScales = {
    // custom thresholds
    threshold: scaleThreshold,
    // quantile scales
    quantize: scaleQuantize,
    quantile: scaleQuantile
};

export function autoScale({
    name,
    type,
    domain,
    scaleOptions,
    plotOptions,
    plotWidth,
    plotHeight,
    plotHasFilledDotMarks,
    plotDefaults
}: {
    name: ScaleName;
    type: ScaleType;
    domain: RawValue[];
    scaleOptions: ScaleOptions;
    plotOptions: PlotOptions;
    plotWidth: number;
    plotHeight: number;
    plotHasFilledDotMarks: boolean;
    plotDefaults: PlotDefaults;
}) {
    let fn;
    let range;

    range =
        scaleOptions?.range ||
        getScaleRange(
            name,
            scaleOptions,
            plotOptions,
            plotWidth,
            plotHeight,
            plotHasFilledDotMarks
        );

    if (scaleOptions.reverse) range.reverse();

    const niceTickCount =
        name === 'x' || name === 'y'
            ? Math.round(Math.abs(range[0] - range[1]) / scaleOptions.tickSpacing)
            : undefined;

    const scaleProps = {
        domain,
        range,
        ...((type === 'linear' || type === 'log') && scaleOptions.nice
            ? {
                  nice: scaleOptions.nice ? niceTickCount : true
              }
            : {}),
        ...(type === 'linear'
            ? {
                  clamp: scaleOptions.clamp,
                  ...(scaleOptions.round ? { interpolate: interpolateRound } : {})
              }
            : {}),
        ...(type === 'log'
            ? {
                  base: scaleOptions.base || 10
              }
            : {}),
        ...(type === 'symlog'
            ? {
                  constant: scaleOptions.constant || 1
              }
            : {}),
        ...(type === 'band' || type === 'point'
            ? {
                  align: scaleOptions.align,
                  padding: maybeNumber(coalesce(scaleOptions.padding, plotOptions.padding, 0.15))
              }
            : {})
    };

    fn = callWithProps(Scales[type], [], scaleProps);
    if (type === 'band' || type === 'point') {
        fn.ticks = () => domain;
    }
    if (type === 'log') {
        fn.ticks = (count: number) => getLogTicks(domain, count);
    } else if (type === 'symlog') {
        const maxabs = Math.max(Math.abs(domain[0]), Math.abs(domain[1]));
        fn.ticks = (count: number) => {
            const ticks = getLogTicks([scaleProps.constant + 1, maxabs], count / 2);
            return [...ticks.map((t) => -t).reverse(), 0, ...ticks];
        };
    }
    return fn;
}

export function autoScaleColor({
    type,
    domain,
    scaleOptions,
    plotOptions,
    plotWidth,
    plotHeight,
    plotHasFilledDotMarks,
    plotDefaults
}: {
    name: ScaleName;
    type: ScaleType;
    domain: RawValue[];
    scaleOptions: ColorScaleOptions;
    plotOptions: PlotOptions;
    plotWidth: number;
    plotHeight: number;
    plotHasFilledDotMarks: boolean;
    plotDefaults: PlotDefaults;
}) {
    let fn;
    let range;
    // special treatment for color scales
    const {
        scheme,
        interpolate,
        pivot,
        n = type === 'threshold' ? domain.length + 1 : 9,
        unknown = plotDefaults.unknown
    } = scaleOptions;

    if (type === 'categorical' || type === 'ordinal') {
        // categorical
        let scheme_ = scheme || plotDefaults.categoricalColorScheme;

        if (isPlainObject(scheme_)) {
            const newScheme = Object.values(scheme_);
            const newDomain = Object.keys(scheme_);
            // for every value in domain that's not part of the scheme, map to unknown
            for (const v of domain) {
                if (scheme_[v] == null) {
                    newDomain.push(v);
                    newScheme.push(unknown);
                }
            }
            domain = newDomain;
            scheme_ = newScheme;
        }

        // categorical scale
        range = Array.isArray(scheme_)
            ? scheme_
            : isCategoricalScheme(scheme_)
              ? categoricalSchemes.get(scheme_)
              : ordinalScheme(scheme_)(domain.length);
        fn = scaleOrdinal().domain(domain).range(range);
    } else if (!!ThresholdScales[type]) {
        const scheme_ = scheme || plotDefaults.colorScheme;

        range =
            Array.isArray(scheme_) && (scaleOptions.n == null || scaleOptions.n === scheme_.length)
                ? scheme_.slice(0)
                : Array.isArray(scheme_)
                  ? // interpolate n colors from custom colors
                    d3Range(n)
                        .map((i) => i / (n - 1))
                        .map(
                            scaleLinear(
                                scheme_.map((c, i) => i / (scheme_.length - 1)),
                                scheme_
                            ).interpolate(interpolateLab)
                        )
                  : interpolate
                    ? d3Range(n).map((i) => interpolate(i / (n - 1)))
                    : isOrdinalScheme(scheme_)
                      ? ordinalScheme(scheme_)(n)
                      : null;

        if (range == null) {
            throw new Error('unknown ordinal scheme ' + scheme_);
        }
        if (scaleOptions.reverse) range = range.toReversed();
        fn = ThresholdScales[type]().domain(domain).range(range);
    } else if (!!SequentialScales[type] || !!DivergingScales[type]) {
        // continuous color scale
        const scale = SequentialScales[type] || DivergingScales[type];

        const scheme_ = scheme || plotDefaults.colorScheme;
        if (interpolate) {
            // user-defined interpolation function [0, 1] -> color
            fn = scale(domain, interpolate);
        } else if (Array.isArray(scheme_)) {
            // custom user-defined colors to interpolate from
            const step = 1 / (scheme_.length - 1);
            fn = scale(
                domain,
                (type === 'linear' ? scaleLinear : scaleLog)(
                    d3Range(0, 1 + step / 2, step),
                    scheme_
                ).interpolate(interpolateLab)
            );
        } else if (
            !!DivergingScales[type] ||
            (scaleOptions.type === 'auto' && isDivergingScheme(scheme_))
        ) {
            // diverging color scheme, explicit or auto-detected
            const maxabs = Math.max(Math.abs(domain[0]), Math.abs(domain[1]));
            const domain_ = pivot != null ? [domain[0], pivot, domain[1]] : [-maxabs, 0, maxabs];
            fn = scale(domain_, quantitativeScheme(scheme_));
        } else if (
            !!SequentialScales[type] ||
            (scaleOptions.type === 'auto' && isQuantitativeScheme(scheme_))
        ) {
            // sequential
            fn = scale(domain, quantitativeScheme(scheme_));
        }
        if (type === 'log') {
            fn.ticks = (count: number) => getLogTicks(domain, count);
        }
    }
    if (!fn) {
        console.warn('color problem', type);
        // problem
        fn = () => 'red';
        fn.range = () => ['red'];
    }
    return fn;
}

function getScaleRange(
    name: ScaleName,
    scaleOptions: ScaleOptions,
    plotOptions: PlotOptions,
    plotWidth: number,
    plotHeight: number,
    plotHasFilledDotMarks: boolean
) {
    const { marginTop, marginLeft, inset } = plotOptions;
    const { insetLeft, insetRight, insetTop, insetBottom } = scaleOptions;
    return name === 'opacity'
        ? [0, 1]
        : name === 'length'
          ? [0, 20]
          : name === 'x'
            ? [
                  marginLeft + (insetLeft || inset || 0),
                  marginLeft + plotWidth - (insetRight || inset || 0)
              ]
            : name === 'y'
              ? [
                    plotHeight + marginTop - (insetBottom || inset || 0),
                    marginTop + (insetTop || inset || 0)
                ]
              : name === 'r'
                ? [0, 10]
                : name === 'symbol'
                  ? // Plot is smart enough to pick different default shapes depending on whether
                    // or not there are filled dot marks in the plot, so we have to pass this
                    // information all the way here
                    plotHasFilledDotMarks
                      ? ['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye']
                      : ['circle', 'plus', 'times', 'triangle2', 'asterisk', 'square2', 'diamond2']
                  : [];
}
