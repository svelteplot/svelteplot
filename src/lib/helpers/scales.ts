import { extent, ascending } from 'd3-array';

import {
    isColorOrNull,
    isDate,
    isDateOrNull,
    isNumberOrNull,
    isNumberOrNullOrNaN,
    isStringOrNull
} from './typeChecks.js';
import { CHANNEL_SCALE, ORIGINAL_NAME_KEYS, VALID_SCALE_TYPES } from '../constants.js';
import { isSymbolOrNull } from './typeChecks.js';
import { resolveProp, toChannelOption } from './resolve.js';
import type {
    ChannelAccessor,
    GenericMarkOptions,
    Mark,
    MarkType,
    PlotDefaults,
    PlotScaleFunction,
    ResolvedPlotOptions,
    PlotScales,
    PlotState,
    RawValue,
    ScaleName,
    ScaleOptions,
    ScaleType,
    ScaledChannelName,
    UsedScales
} from '../types/index.js';
import isDataRecord from './isDataRecord.js';

import { createProjection } from './projection.js';
import { maybeInterval } from './autoTicks.js';
import { IS_SORTED } from 'svelteplot/transforms/sort.js';

function normalizeScaleFn(fn: any): PlotScaleFunction {
    const out = fn as PlotScaleFunction;
    out.range ||= () => [];
    out.invert ||= (value: number) => value;
    out.bandwidth ||= () => 0;
    out.ticks ||= () => [];
    out.quantiles ||= () => [];
    out.thresholds ||= () => [];
    out.domain ||= () => [];
    return out;
}

/**
 * compute the plot scales
 */
export function computeScales(
    plotOptions: ResolvedPlotOptions,
    plotWidth: number,
    plotHeight: number,
    plotHasFilledDotMarks: boolean,
    marks: Mark<GenericMarkOptions>[],
    plotDefaults: PlotDefaults
): PlotScales {
    const x = createScale(
        'x',
        plotOptions.x as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const y = createScale(
        'y',
        plotOptions.y as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const r = createScale(
        'r',
        plotOptions.r,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const color = createScale(
        'color',
        plotOptions.color as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const opacity = createScale(
        'opacity',
        plotOptions.opacity,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const length = createScale(
        'length',
        plotOptions.length,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const symbol = createScale(
        'symbol',
        plotOptions.symbol as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    // create fx and fy scales from mark data directly
    const fx = createScale(
        'fx',
        plotOptions.fx as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const fy = createScale(
        'fy',
        plotOptions.fy as Partial<ScaleOptions>,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );

    const projection = plotOptions.projection
        ? createProjection(
              { projOptions: plotOptions.projection as any, inset: plotOptions.inset },
              {
                  width: plotWidth,
                  height: plotHeight,
                  marginBottom: plotOptions.marginBottom,
                  marginLeft: plotOptions.marginLeft,
                  marginRight: plotOptions.marginRight,
                  marginTop: plotOptions.marginTop
              }
          )
        : null;
    return { x, y, r, color, opacity, length, symbol, fx, fy, projection } as unknown as PlotScales;
}

export function createScale(
    name: ScaleName,
    scaleOptions: Partial<ScaleOptions>,
    marks: Mark<GenericMarkOptions>[],
    plotOptions: ResolvedPlotOptions,
    plotWidth: number,
    plotHeight: number,
    plotHasFilledDotMarks: boolean,
    plotDefaults: PlotDefaults
) {
    if (!plotOptions.implicitScales && !(scaleOptions as any).scale) {
        // no scale defined, return a dummy scale
        const fn: any = name === 'color' ? () => 'currentColor' : () => 0;
        fn.range = name === 'color' ? () => ['currentColor'] : () => [0];
        const normalizedFn = normalizeScaleFn(fn);
        return {
            type: 'linear' as ScaleType,
            domain: [0],
            range: [0],
            fn: normalizedFn,
            skip: new Map(),
            isDummy: true,
            manualActiveMarks: 0,
            uniqueScaleProps: new Set()
        };
    }
    // gather all marks that use channels which support this scale
    const dataValues = new Set<RawValue>();
    const allDataValues: RawValue[] = [];
    const markTypes = new Set<MarkType>();

    const skip = new Map<ScaledChannelName, Set<symbol>>();
    let manualActiveMarks = 0;
    const propNames = new Set<string>();
    const uniqueScaleProps = new Set<string | ChannelAccessor>();
    let sortOrdinalDomain = plotOptions.sortOrdinalDomains ?? true;
    for (const mark of marks) {
        // we only sort the scale domain alphabetically, if none of the
        // marks that map to it are using the `sort` transform. Note that
        // we're deliberately checking for !== undefined and not for != null
        // since the explicit sort transforms like shuffle will set the
        // sort channel to null to we know that there's an explicit order
        if ((name === 'x' || name === 'y') && mark.options[IS_SORTED] != undefined) {
            sortOrdinalDomain = false;
        }

        for (const channel of mark.channels) {
            // channelOptions can be passed as prop, but most often users will just
            // pass the channel accessor or constant value, so we may need to wrap
            if (!skip.has(channel)) skip.set(channel, new Set());

            if (mark.data.length > 0) {
                const channelOptions = isDataRecord(mark.options[channel])
                    ? mark.options[channel]
                    : { value: mark.options[channel], scale: CHANNEL_SCALE[channel] };
                // check if this mark channel is using this scale, which users can prevent
                // by passing `{ scale: null }` as prop
                const useScale =
                    channelOptions.scale === name &&
                    // only use scale if implicit scales are enabled or use has explicitly
                    // defined a scale
                    (plotOptions.implicitScales || (scaleOptions as any).scale) &&
                    // type number means, someone is defining a channel as constant, e.g.
                    // <Dot r={10} /> in which case we don't want to pass it through a scale
                    // typeof channelOptions.value !== 'number' &&
                    typeof channelOptions.value !== 'undefined';

                if (useScale) {
                    if (name === 'opacity' && looksLikeOpacity(channelOptions.value)) {
                        // special handling for opacity scales, where any accessor that looks like
                        // a number between 0 and 1 will be interpreted as output type
                        (skip.get(channel) as Set<symbol>).add(mark.id);
                    } else {
                        const isOutputType =
                            name === 'color'
                                ? isColorOrNull
                                : name === 'symbol'
                                  ? isSymbolOrNull
                                  : false;

                        let allValuesAreOutputType = !!isOutputType && mark.data.length > 0;

                        if (isOutputType) {
                            for (const datum of mark.data) {
                                const val = resolveProp(channelOptions.value, datum);
                                allValuesAreOutputType =
                                    allValuesAreOutputType && val !== null && isOutputType(val);
                                if (!allValuesAreOutputType) break;
                            }
                        }

                        if (allValuesAreOutputType) {
                            (skip.get(channel) as Set<symbol>).add(mark.id);
                        }

                        if (
                            typeof channelOptions.value === 'string' &&
                            !looksLikeANumber(channelOptions.value) &&
                            !channelOptions.value.startsWith('__') &&
                            mark.data[0][channelOptions.value] !== undefined
                        ) {
                            propNames.add(channelOptions.value);
                        }

                        uniqueScaleProps.add(channelOptions.value);

                        if (channelOptions.value != null && !allValuesAreOutputType) {
                            manualActiveMarks++;
                            markTypes.add(mark.type);

                            // active mark channel
                            for (const datum of mark.data) {
                                const value = resolveProp(channelOptions.value, datum);
                                dataValues.add(value);
                                if (
                                    (name === 'color' && scaleOptions.type === 'quantile') ||
                                    scaleOptions.type === 'quantile-cont'
                                ) {
                                    allDataValues.push(value);
                                }
                            }
                        }
                    }
                }

                // special handling of marks using the stackX/stackY transform
                if (
                    (name === 'x' || name === 'y') &&
                    mark.options[ORIGINAL_NAME_KEYS[name]] &&
                    !mark.options[ORIGINAL_NAME_KEYS[name]].startsWith('__')
                ) {
                    propNames.add(mark.options[ORIGINAL_NAME_KEYS[name]]);
                }
            } else {
                // also skip marks without data to prevent exceptions
                // (skip.get(channel) as Set<symbol>).add(mark.id);
            }
        }
    }

    if ((name === 'x' || name === 'y') && scaleOptions.sort) {
        sortOrdinalDomain = true;
    }
    if ((name === 'x' || name === 'y') && scaleOptions.sort === false) {
        sortOrdinalDomain = false;
    }

    // construct domain from data values
    const valueArr = [...dataValues.values(), ...(scaleOptions.domain || [])].filter(
        (d) => d != null
    );

    const type: ScaleType =
        !scaleOptions.type || scaleOptions.type === 'auto'
            ? inferScaleType(name, valueArr, markTypes, scaleOptions)
            : (scaleOptions.type as ScaleType);

    if (VALID_SCALE_TYPES[name] && !VALID_SCALE_TYPES[name].has(type)) {
        throw new Error(`Invalid scale type ${type} for scale
            ${name}. Valid types are ${[...VALID_SCALE_TYPES[name]].join(', ')}`);
    }

    const isOrdinal = isOrdinalScale(type);

    if (isOrdinal && sortOrdinalDomain) {
        valueArr.sort(ascending as any);
    }

    const valueArray =
        type === 'quantile' || type === 'quantile-cont'
            ? allDataValues.toSorted((a, b) => Number(a) - Number(b))
            : valueArr;

    let domain: RawValue[] = scaleOptions.domain
        ? isOrdinal
            ? scaleOptions.domain
            : (extent(
                  scaleOptions.zero ? [0, ...scaleOptions.domain] : (scaleOptions.domain as any)
              ) as any as RawValue[])
        : type === 'band' ||
            type === 'point' ||
            type === 'ordinal' ||
            type === 'categorical' ||
            type === 'quantile' ||
            type === 'quantile-cont'
          ? name === 'y'
              ? valueArray.toReversed()
              : valueArray
          : (extent(
                scaleOptions.zero ? [0, ...valueArray] : (valueArray as any)
            ) as any as RawValue[]);

    if (scaleOptions.interval) {
        if (isOrdinal) {
            domain = domainFromInterval(domain, scaleOptions.interval, name);
        } else {
            if (markTypes.size > 0) {
                console.error(
                    'Setting interval via axis options is only supported for ordinal scales'
                );
            }
        }
    }

    // `scale` is a factory function injected by Plot.svelte (autoScale/autoScaleColor)
    const scaleFn = (scaleOptions as any).scale;
    if (!scaleFn) {
        throw new Error(`No scale function defined for ${name}`);
    }
    const rawFn = scaleFn({
        name,
        type,
        domain,
        scaleOptions,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    });
    const fn = normalizeScaleFn(rawFn);
    const range = fn.range();

    return {
        type,
        domain,
        range,
        fn,
        skip,
        manualActiveMarks,
        uniqueScaleProps,
        autoTitle:
            type === 'time'
                ? null
                : propNames.size === 1
                  ? `${[...propNames.values()][0]}${type === 'log' ? ' (log)' : ''}`
                  : null
    };
}

function domainFromInterval(domain: RawValue[], interval: string | number, name: ScaleName) {
    const interval_ = maybeInterval(interval)!;
    const [lo, hi] = extent(domain as number[]) as [number | undefined, number | undefined];
    const out = (interval_ as any).range(lo, (interval_ as any).offset(hi));
    return name === 'y' ? out.toReversed() : out;
}

const markTypesWithBandDefault = {
    x: new Set<MarkType>(['barY', 'cell', 'tickY', 'waffleY']),
    y: new Set<MarkType>(['barX', 'cell', 'tickX', 'waffleX'])
};

/**
 * Infer a scale type based on the scale name, the data values mapped to it and
 * the mark types that are bound to the scale
 */
export function inferScaleType(
    name: ScaleName,
    dataValues: RawValue[],
    markTypes: Set<MarkType>,
    scaleOptions: Partial<ScaleOptions> = {}
): ScaleType {
    if (name === 'color') {
        if (!dataValues.length) return 'ordinal';
        if (dataValues.every(isNumberOrNullOrNaN)) return 'linear';
        if (dataValues.every(isDateOrNull)) return 'linear';
        if (dataValues.every(isStringOrNull)) return 'categorical';
        return 'categorical';
    }
    if (name === 'symbol') return 'ordinal';
    if (name === 'x' || name === 'y') {
        // if for a positional scale we may infer the scale type from the scale options
        if (scaleOptions.domain && scaleOptions.domain.length === 2) {
            if (scaleOptions.domain.every(Number.isFinite)) return 'linear';
            if (scaleOptions.domain.every(isDate)) return 'time';
        }
        if (scaleOptions.zero) return 'linear';
        if (scaleOptions.nice)
            return dataValues.length > 0 && dataValues.every(isDateOrNull) ? 'time' : 'linear';
    }
    // for positional scales, try to pick a scale that's required by the mark types
    if (name === 'y' && Array.from(markTypes).some((d) => markTypesWithBandDefault.y.has(d)))
        return 'band';
    if (name === 'x' && Array.from(markTypes).some((d) => markTypesWithBandDefault.x.has(d)))
        return 'band';
    if (!dataValues.length) return 'linear';
    if (dataValues.length === 1) return 'point';
    if (dataValues.every(isNumberOrNull)) return name === 'r' ? 'sqrt' : 'linear';
    if (dataValues.every(isDateOrNull)) return 'time';
    if (dataValues.every(isStringOrNull)) return 'point';
    return 'linear';
}

const scaledChannelNames: ScaledChannelName[] = [
    'x',
    'x1',
    'x2',
    'y',
    'y1',
    'y2',
    'r',
    'opacity',
    'fill',
    'fillOpacity',
    'stroke',
    'strokeOpacity',
    'symbol',
    'length'
];

/**
 * Mark channels can explicitly or implicitly be exempt from being
 * mapped to a scale, so everywhere where values are being mapped to
 * scales, we need to check if the scale is supposed to be used
 * not. That's what this function is used for.
 */
export function getUsedScales(
    plot: PlotState,
    options: GenericMarkOptions,
    mark: Mark<GenericMarkOptions>
): UsedScales {
    return Object.fromEntries(
        scaledChannelNames.map((channel) => {
            const scale = CHANNEL_SCALE[channel];
            const skipMarks = plot.scales[scale].skip.get(channel) || new Set();
            return [
                channel,
                !skipMarks.has(mark.id) &&
                    toChannelOption(channel, options[channel]).scale !== null &&
                    !plot.scales[scale].isDummy
            ];
        })
    ) as { [k in ScaledChannelName]: boolean };
}

export function looksLikeANumber(input: string | number) {
    return (
        Number.isFinite(input) ||
        (typeof input === 'string' && input.trim().length > 0 && Number.isFinite(+input))
    );
}

function isWithin(number: number, min: number, max: number) {
    return Number.isFinite(number) && number >= min && number <= max;
}

function looksLikeOpacity(input: string | number) {
    return looksLikeANumber(input) && isWithin(+input, 0, 1);
}

export function projectXY(
    scales: PlotScales,
    x: RawValue,
    y: RawValue,
    useXScale = true,
    useYScale = true
): [number, number] {
    if (scales.projection) {
        // TODO: pretty sure this is not how projection streams are supposed to be used
        // efficiently, in observable plot, all data points of a mark are projected using
        // the same stream
        let x_: number = 0,
            y_: number = 0;
        const stream = (scales.projection as any).stream({
            point(px: number, py: number) {
                x_ = px;
                y_ = py;
            }
        });
        stream.point(x, y);
        return [x_, y_];
    }
    return [
        useXScale ? projectX('x', scales, x) : (x as number),
        useYScale ? projectY('y', scales, y) : (y as number)
    ];
}

export function projectX(channel: 'x' | 'x1' | 'x2', scales: PlotScales, value: RawValue) {
    const x = (scales.x.fn as (input: RawValue) => number | undefined)(value) ?? NaN;
    const xBandwidth =
        scales.x.type === 'band' ? (scales.x.fn as { bandwidth: () => number }).bandwidth() : 0;
    return (
        x +
        (channel === 'x' && scales.x.type === 'band'
            ? xBandwidth * 0.5
            : channel === 'x2' && scales.x.type === 'band'
              ? xBandwidth
              : 0)
    );
}

export function projectY(channel: 'y' | 'y1' | 'y2', scales: PlotScales, value: RawValue) {
    const y = (scales.y.fn as (input: RawValue) => number | undefined)(value) ?? NaN;
    const yBandwidth =
        scales.y.type === 'band' ? (scales.y.fn as { bandwidth: () => number }).bandwidth() : 0;
    return (
        y +
        (channel === 'y' && scales.y.type === 'band'
            ? yBandwidth * 0.5
            : channel === 'y2' && scales.y.type === 'band'
              ? yBandwidth
              : 0)
    );
}

export function isOrdinalScale(scaleType: ScaleType) {
    return (
        scaleType === 'band' ||
        scaleType === 'point' ||
        scaleType === 'ordinal' ||
        scaleType === 'categorical' ||
        scaleType === 'threshold'
    );
}
