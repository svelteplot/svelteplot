import { CHANNEL_SCALE, INDEX } from '../constants.js';
import isDataRecord from './isDataRecord.js';
import isRawValue from './isRawValue.js';
import type { MarkStyleProps, PlotState, ScaledDataRecord } from '../types/index.js';
import { isValid } from './index.js';

import type {
    ScaleName,
    ChannelName,
    ScaledChannelName,
    ChannelAccessor,
    DataRow,
    RawValue,
    DataRecord,
    ConstantAccessor
} from '../types/index.js';
import { getBaseStylesObject } from './getBaseStyles.js';
import { RAW_VALUE } from '../transforms/recordize.js';

type ChannelAlias = { channel: ScaledChannelName };

export function resolveProp<K, T>(
    accessor: ConstantAccessor<K, T>,
    datum: DataRecord<T> | null,
    _defaultValue: K | null = null
): K | typeof _defaultValue {
    if (typeof accessor === 'function') {
        const accessorFn = accessor as ((d: T, index: number) => K) & (() => K);
        // datum[RAW_VALUE] exists if an array of raw values was used as dataset and got
        // "recordized" by the recordize transform. We want to hide this wrapping to the user
        // so we're passing the original value to accessor functions instead of our wrapped record
        const d = datum as any;
        return datum == null
            ? accessorFn()
            : accessorFn(d[RAW_VALUE] != null ? d[RAW_VALUE] : datum, d[INDEX]);
    } else {
        const accessorValue = accessor as K;
        // accessor may be a column name
        if ((typeof accessorValue === 'string' || typeof accessorValue === 'symbol') && datum) {
            const d = datum as Record<string | symbol, any>;
            if (d[accessorValue] !== undefined) {
                return d[accessorValue] as K;
            }
        }
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

export function resolveChannel<T>(
    channel: ChannelName,
    datum: DataRow<T>,
    channels: Partial<Record<ChannelName, ChannelAccessor<T> | ChannelAlias>>
): RawValue {
    const scale = CHANNEL_SCALE[channel as ScaledChannelName];
    // the z channel has an automatic alias mechanism
    const accessor: ChannelAccessor<T> | ChannelAlias =
        channel === 'z' ? channels.z || channels.fill || channels.stroke : channels[channel];
    const channelOptions = toChannelOption(channel as ScaledChannelName, accessor);
    if (channelOptions.channel) {
        return resolveChannel(channelOptions.channel, datum, channels);
    }

    return resolve(datum as DataRow, channelOptions.value, channel, scale);
}

function resolve(
    datum: DataRow,
    accessor: ChannelAccessor,
    channel: ChannelName,
    scale: ScaleName
) {
    if (isDataRecord(datum)) {
        const d = datum as Record<string | symbol, any>;
        // use accessor function
        if (typeof accessor === 'function')
            // datum[RAW_VALUE] exists if an array of raw values was used as dataset and got
            // "recordized" by the recordize transform. We want to hide this wrapping to the user
            // so we're passing the original value to accessor functions instead of our wrapped record
            return accessor(d[RAW_VALUE] != null ? d[RAW_VALUE] : datum, d[INDEX]);
        // use accessor string
        if (
            (typeof accessor === 'string' || typeof accessor === 'symbol') &&
            d[accessor] !== undefined
        )
            return d[accessor];
        // fallback to channel name as accessor
        if (accessor === null && d[channel] !== undefined) return d[channel];
        return isRawValue(accessor) ? accessor : null;
    } else if (
        Array.isArray(datum) &&
        (typeof accessor === 'string' || typeof accessor === 'number') &&
        datum[accessor as number] != null
    ) {
        return datum[accessor as number];
    } else {
        // return single value or accessor
        const d = datum as any;
        return typeof accessor === 'function'
            ? accessor(datum as any, d?.[INDEX])
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
    channels: Partial<Record<ScaledChannelName | MarkStyleProps, ChannelAccessor>>,
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
            (Object.entries(scaledStyleProps) as [ScaledChannelName, string][])
                .filter(([key]) => channels[key] != null)
                .map(([key, cssAttr]): [ScaledChannelName, string, RawValue] => [
                    key,
                    cssAttr,
                    resolveChannel(key, datum, channels)
                ])
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
                        return [cssAttr, (plot.scales[CHANNEL_SCALE[key]].fn as any)(value)];
                    }
                    return [cssAttr, value];
                })
        )
    };
}

export function resolveScaledStyles(
    datum: DataRecord,
    channels: Partial<
        Record<ScaledChannelName | MarkStyleProps, ChannelAccessor> & { style: string }
    >,
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
    channels: Partial<
        Record<ScaledChannelName | MarkStyleProps, ChannelAccessor> & { style: string }
    >,
    defaultColorProp: 'fill' | 'stroke' | null = null,
    useScale: Record<ScaledChannelName, boolean>,
    recomputeChannels = false
): [string | null, string | null] {
    const styleProps = {
        ...getBaseStylesObject(datum?.datum, channels),
        fill: 'none',
        stroke: 'none',
        ...(defaultColorProp &&
        (channels[oppositeColor[defaultColorProp]] == null ||
            channels[oppositeColor[defaultColorProp]] === 'none')
            ? { [defaultColorProp]: 'currentColor' }
            : {}),
        ...Object.fromEntries(
            (Object.entries(scaledStyleProps) as [ScaledChannelName, string][])
                .filter(([key]) => channels[key as keyof typeof channels] != null)
                .map(([key, cssAttr]): [ScaledChannelName, string, RawValue] => [
                    key,
                    cssAttr,
                    (recomputeChannels
                        ? resolveChannel(
                              key,
                              datum?.datum,
                              channels as Partial<Record<ChannelName, ChannelAccessor>>
                          )
                        : datum?.[key]) as RawValue
                ])
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
                    } else if ((key === 'fill' || key === 'stroke') && value === true) {
                        return [cssAttr, 'currentColor'];
                    }
                    return [cssAttr, value];
                })
        )
    };
    if (plot.css) {
        return [null, plot.css(`${stylePropsToCSS(styleProps)};${channels.style ?? ''}`)];
    } else {
        return [`${stylePropsToCSS(styleProps)};${channels.style ?? ''}`, null];
    }
}
