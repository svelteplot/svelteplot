import { CHANNEL_SCALE } from '$lib/constants.js';
import isDataRecord from '$lib/helpers/isDataRecord.js';
import isRawValue from '$lib/helpers/isRawValue.js';
import type { MarkStyleProps, PlotState, ScaledDataRecord } from '$lib/types.js';
import { isValid } from './isValid.js';
import { pick } from 'es-toolkit';

import type {
    ScaleName,
    ChannelName,
    ScaledChannelName,
    ChannelAccessor,
    DataRow,
    RawValue,
    DataRecord,
    ConstantAccessor
} from '../types.js';
import { getBaseStylesObject } from './getBaseStyles.js';

type ChannelAlias = { channel: ScaledChannelName };

export function resolveProp<T>(
    accessor: ConstantAccessor<T>,
    datum: DataRecord | null,
    _defaultValue: T | null = null
): T | null {
    if (typeof accessor === 'function') {
        // datum.___orig___ exists if an array of raw values was used as dataset and got
        // "recordized" by the recordize transform. We want to hide this wrapping to the user
        // so we're passing the original value to accessor functions instead of our wrapped record
        return datum == null
            ? accessor()
            : accessor(datum.___orig___ != null ? datum.___orig___ : datum);
    } else if (typeof accessor === 'string' && datum && datum[accessor] !== undefined) {
        return datum[accessor] as T;
    }
    return isRawValue(accessor) ? accessor : _defaultValue;
}

type ChannelOptions = {
    value: ChannelAccessor;
    scale?: ScaleName | null;
    channel?: ScaledChannelName | null;
};

export function toChannelOption(
    name: ScaledChannelName,
    channel: ChannelAccessor | ChannelAlias
): ChannelOptions {
    const isPositionScale = CHANNEL_SCALE[name] === 'x' || CHANNEL_SCALE[name] === 'y';
    const isOpacityScale = CHANNEL_SCALE[name] === 'opacity';

    return isDataRecord(channel)
        ? (channel as ChannelOptions)
        : {
              value: channel,
              scale:
                  (!isPositionScale && !isOpacityScale && typeof channel === 'number') ||
                  typeof channel === 'undefined'
                      ? null
                      : CHANNEL_SCALE[name],
              channel: null
          };
}

export function resolveChannel(
    channel: ChannelName,
    datum: DataRow,
    channels: Partial<Record<ChannelName, ChannelAccessor | ChannelAlias>>
): RawValue {
    const scale = CHANNEL_SCALE[channel];
    // the z channel has an automatic alias mechanism
    const accessor: ChannelAccessor | ChannelAlias =
        channel === 'z' ? channels.z || channels.fill || channels.stroke : channels[channel];
    const channelOptions = toChannelOption(channel, accessor);

    if (channelOptions.channel) {
        return resolveChannel(channelOptions.channel, datum, channels);
    }

    return resolve(datum, channelOptions.value, channel, scale);
}

function resolve(
    datum: DataRow,
    accessor: ChannelAccessor,
    channel: ChannelName,
    scale: ScaleName
) {
    if (isDataRecord(datum)) {
        // use accessor function
        if (typeof accessor === 'function')
            // datum.___orig___ exists if an array of raw values was used as dataset and got
            // "recordized" by the recordize transform. We want to hide this wrapping to the user
            // so we're passing the original value to accessor functions instead of our wrapped record
            return accessor(datum.___orig___ != null ? datum.___orig___ : datum);
        // use accessor string
        if (typeof accessor === 'string' && datum[accessor] !== undefined) return datum[accessor];
        // fallback to channel name as accessor
        if (accessor === null && datum[channel] !== undefined) return datum[channel];
        return isRawValue(accessor) ? accessor : null;
    } else if (
        Array.isArray(datum) &&
        (typeof accessor === 'string' || typeof accessor === 'number') &&
        datum[accessor] != null
    ) {
        return datum[accessor];
    } else {
        // return single value or accessor
        return typeof accessor === 'function'
            ? accessor(datum)
            : accessor !== null && isRawValue(accessor)
              ? accessor
              : !Array.isArray(datum) && (scale === 'x' || scale === 'y')
                ? datum
                : null;
    }
}

const scaledStyleProps: Partial<{ [key in ScaledChannelName]: string }> = {
    fill: 'fill',
    stroke: 'stroke',
    fillOpacity: 'fill-opacity',
    strokeOpacity: 'stroke-opacity',
    opacity: 'opacity'
};

const scaledStylePropsKeys = Object.keys(scaledStyleProps) as ScaledChannelName[];

// TODO: find a better name
const oppositeColor: Record<'fill' | 'stroke', 'fill' | 'stroke'> = {
    fill: 'stroke',
    stroke: 'fill'
};

export function resolveScaledStyleProps(
    datum: DataRecord,
    channels: Partial<Record<ScaledChannelName, ChannelAccessor>>,
    useScale: Record<ScaledChannelName, boolean>,
    plot: PlotState,
    defaultColorProp: 'fill' | 'stroke' | null = null
) {
    return {
        ...getBaseStylesObject(datum, channels),
        fill: 'none',
        stroke: 'none',
        ...(defaultColorProp && channels[oppositeColor[defaultColorProp]] == null
            ? { [defaultColorProp]: 'currentColor' }
            : {}),
        ...Object.fromEntries(
            Object.entries(scaledStyleProps)
                .filter(([key]) => channels[key] != null)
                .map(([key, cssAttr]) => [key, cssAttr, resolveChannel(key, datum, channels)])
                .filter(([key, , value]) => isValid(value) || key === 'fill' || key === 'stroke')
                .map(([key, cssAttr, value]) => {
                    if (useScale[key]) {
                        if (
                            value == undefined &&
                            (key === 'fill' || key === 'stroke') &&
                            plot.options.color.unknown
                        ) {
                            return [cssAttr, plot.options.color.unknown];
                        }
                        return [cssAttr, plot.scales[CHANNEL_SCALE[key]].fn(value)];
                    }
                    return [cssAttr, value];
                })
        )
    };
}

export function resolveScaledStyles(
    datum: DataRecord,
    channels: Partial<Record<ScaledChannelName, ChannelAccessor>>,
    useScale: Record<ScaledChannelName, boolean>,
    plot: PlotState,
    defaultColorProp: 'fill' | 'stroke' | null = null
) {
    return `${stylePropsToCSS(
        resolveScaledStyleProps(datum, channels, useScale, plot, defaultColorProp)
    )};${channels.style || ''}`;
}

function stylePropsToCSS(props: Record<string, string>): string {
    return `${Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join(';')}`;
}

export function resolveStyles(
    plot: PlotState,
    datum: ScaledDataRecord,
    channels: Partial<Record<ChannelName & MarkStyleProps, ChannelAccessor>>,
    defaultColorProp: 'fill' | 'stroke' | null = null,
    useScale: Record<ScaledChannelName, boolean>,
    recomputeChannels = false
): [string | null, string | null] {
    const styleProps = {
        ...getBaseStylesObject(datum.datum, channels),
        fill: 'none',
        stroke: 'none',
        ...(defaultColorProp && channels[oppositeColor[defaultColorProp]] == null
            ? { [defaultColorProp]: 'currentColor' }
            : {}),
        ...Object.fromEntries(
            (Object.entries(scaledStyleProps) as [ScaledChannelName, string][])
                .filter(([key]) => channels[key] != null)
                .map(([key, cssAttr]) => [key, cssAttr, recomputeChannels ? resolveChannel(key, datum.datum, channels) : datum[key]])
                .filter(
                    ([key, , value]) =>
                        isValid(value as RawValue) || key === 'fill' || key === 'stroke'
                )
                .map(([key, cssAttr, value]) => {
                    if (useScale[key as ScaledChannelName]) {
                        if (
                            value == undefined &&
                            (key === 'fill' || key === 'stroke') &&
                            plot.options.color.unknown
                        ) {
                            return [cssAttr, plot.options.color.unknown];
                        }
                    }
                    return [cssAttr, value];
                })
        )
    };
    if (plot.css) {
        return [null, plot.css(stylePropsToCSS(styleProps))];
    } else {
        return [stylePropsToCSS(styleProps), null];
    }
}
