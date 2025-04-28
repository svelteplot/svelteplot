import { extent, range as d3Range, ascending } from 'd3-array';

import {
    isColorOrNull,
    isDateOrNull,
    isNumberOrNull,
    isNumberOrNullOrNaN,
    isStringOrNull
} from './typeChecks.js';
import { CHANNEL_SCALE, VALID_SCALE_TYPES } from '$lib/constants.js';
import { isSymbolOrNull } from './typeChecks.js';
import { resolveProp, toChannelOption } from './resolve.js';
import type {
    ChannelAccessor,
    ColorScheme,
    GenericMarkOptions,
    Mark,
    MarkType,
    PlotDefaults,
    PlotOptions,
    PlotScales,
    PlotState,
    RawValue,
    ScaleName,
    ScaleOptions,
    ScaleType,
    ScaledChannelName
} from '../types.js';
import isDataRecord from './isDataRecord.js';

import { createProjection } from './projection.js';

/**
 * compute the plot scales
 */
export function computeScales(
    plotOptions: PlotOptions,
    plotWidth: number,
    plotHeight: number,
    plotHasFilledDotMarks: boolean,
    marks: Mark<GenericMarkOptions>[],
    plotDefaults: PlotDefaults
): PlotScales {
    const x = createScale(
        'x',
        plotOptions.x,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const y = createScale(
        'y',
        plotOptions.y,
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
        plotOptions.color,
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
        plotOptions.symbol,
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
        plotOptions.fx,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );
    const fy = createScale(
        'fy',
        plotOptions.fy,
        marks,
        plotOptions,
        plotWidth,
        plotHeight,
        plotHasFilledDotMarks,
        plotDefaults
    );

    const projection = plotOptions.projection
        ? createProjection(
              { projOptions: plotOptions.projection, inset: plotOptions.inset },
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
    return { x, y, r, color, opacity, length, symbol, fx, fy, projection };
}

export function createScale<T extends ScaleOptions>(
    name: ScaleName,
    scaleOptions: T,
    marks: Mark<GenericMarkOptions>[],
    plotOptions: PlotOptions,
    plotWidth: number,
    plotHeight: number,
    plotHasFilledDotMarks: boolean,
    plotDefaults: PlotDefaults
) {
    if (!plotOptions.implicitScales && !scaleOptions.scale) {
        // no scale defined, return a dummy scale
        const fn = name === 'color' ? () => 'currentColor' : () => 0;
        fn.range = name === 'color' ? () => ['currentColor'] : () => [0];
        return { type: 'linear', domain: [0], range: [0], fn, skip: new Map(), isDummy: true };
    }
    // gather all marks that use channels which support this scale
    const dataValues = new Set<RawValue>();
    const allDataValues: RawValue[] = [];
    const markTypes = new Set<MarkType>();
    const skip = new Map<ScaledChannelName, Set<symbol>>();
    let manualActiveMarks = 0;
    const propNames = new Set<string>();
    const uniqueScaleProps = new Set<string | ChannelAccessor>();
    let sortOrdinalDomain = true;

    for (const mark of marks) {
        // we only sort the scale domain alphabetically, if none of the
        // marks that map to it are using the `sort` transform. Note that
        // we're deliberately checking for !== undefined and not for != null
        // since the explicit sort transforms like shuffle will set the
        // sort channel to null to we know that there's an explicit order
        if (mark.channels.sort !== undefined) sortOrdinalDomain = false;
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
                    (plotOptions.implicitScales || scaleOptions.scale) &&
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
                                if (name === 'color' && scaleOptions.type === 'quantile') {
                                    allDataValues.push(value);
                                }
                            }
                        }
                    }
                }

                // special handling of marks using the stackX/stackY transform
                if (
                    (name === 'x' || name === 'y') &&
                    mark.options[`__${name}_origField`] &&
                    !mark.options[`__${name}_origField`].startsWith('__')
                ) {
                    propNames.add(mark.options[`__${name}_origField`]);
                }
            } else {
                // also skip marks without data to prevent exceptions
                // (skip.get(channel) as Set<symbol>).add(mark.id);
            }
        }
    }

    // construct domain from data values
    const valueArr = [...dataValues.values(), ...(scaleOptions.domain || [])].filter(
        (d) => d != null
    );

    const type: ScaleType =
        scaleOptions.type === 'auto'
            ? inferScaleType(name, valueArr, markTypes)
            : scaleOptions.type;

    if (VALID_SCALE_TYPES[name] && !VALID_SCALE_TYPES[name].has(type)) {
        throw new Error(`Invalid scale type ${type} for scale
            ${name}. Valid types are ${[...VALID_SCALE_TYPES[name]].join(', ')}`);
    }

    const isOrdinal =
        type === 'band' || type === 'point' || type === 'ordinal' || type === 'categorical';

    if (isOrdinal && sortOrdinalDomain) {
        valueArr.sort(ascending);
    }

    const domain = scaleOptions.domain
        ? extent(scaleOptions.zero ? [0, ...scaleOptions.domain] : scaleOptions.domain)
        : type === 'band' ||
            type === 'point' ||
            type === 'ordinal' ||
            type === 'categorical' ||
            type === 'quantile' ||
            type === 'quantile-cont'
          ? name === 'y'
              ? valueArr.toReversed()
              : valueArr
          : extent(scaleOptions.zero ? [0, ...valueArr] : valueArr);

    if (!scaleOptions.scale) {
        throw new Error(`No scale function defined for ${name}`);
    }
    const fn = scaleOptions.scale({
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

/**
 * Infer a scale type based on the scale name, the data values mapped to it and
 * the mark types that are bound to the scale
 */
export function inferScaleType(
    name: ScaleName,
    dataValues: RawValue[],
    markTypes: Set<MarkType>
): ScaleType {
    if (name === 'color') {
        if (!dataValues.length) return 'ordinal';
        if (dataValues.every(isNumberOrNullOrNaN)) return 'linear';
        if (dataValues.every(isDateOrNull)) return 'linear';
        if (dataValues.every(isStringOrNull)) return 'categorical';
        return 'categorical';
    }
    if (name === 'symbol') return 'ordinal';
    // for positional scales, try to pick a scale that's required by the mark types
    if ((name === 'x' || name === 'y') && markTypes.size === 1) {
        if (
            name === 'y' &&
            (markTypes.has('barX') || markTypes.has('tickX') || markTypes.has('cell'))
        )
            return 'band';
        if (
            name === 'x' &&
            (markTypes.has('barY') || markTypes.has('tickY') || markTypes.has('cell'))
        )
            return 'band';
    }
    if (!dataValues.length) return 'linear';
    if (dataValues.length === 1) return 'point';
    if (dataValues.every(isNumberOrNull)) return name === 'r' ? 'sqrt' : 'linear';
    if (dataValues.every(isDateOrNull)) return 'time';
    if (dataValues.every(isStringOrNull)) return markTypes.has('arrow') ? 'point' : 'band';
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
 * Mark channels can explicitely or implicitely be exempt from being
 * mapped to a scale, so everywhere where values are being mapped to
 * scales, we need to check if the the scale is supposed to be used
 * not. That's what this function is used for.
 */
export function getUsedScales(
    plot: PlotState,
    options: GenericMarkOptions,
    mark: Mark<GenericMarkOptions>
) {
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
        // efficiantly, in observable plot, all data points of a mark are projected using
        // the same stream
        let x_, y_;
        const stream = scales.projection.stream({
            point(px, py) {
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
    return (
        scales.x.fn(value) +
        (channel === 'x' && scales.x.type === 'band'
            ? scales.x.fn.bandwidth() * 0.5
            : channel === 'x2' && scales.x.type === 'band'
              ? scales.x.fn.bandwidth()
              : 0)
    );
}

export function projectY(channel: 'y' | 'y1' | 'y2', scales: PlotScales, value: RawValue) {
    return (
        scales.y.fn(value) +
        (channel === 'y' && scales.y.type === 'band'
            ? scales.y.fn.bandwidth() * 0.5
            : channel === 'y2' && scales.y.type === 'band'
              ? scales.y.fn.bandwidth()
              : 0)
    );
}
