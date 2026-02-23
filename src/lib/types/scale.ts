import type { ChannelAccessor, ColorScheme, RawValue, ScaledChannelName } from './index.js';

export type AxisXAnchor = 'bottom' | 'top' | 'both';
export type AxisYAnchor = 'left' | 'right' | 'both';

export type TickFormatFunction = (
    d: RawValue,
    index: number,
    ticks: RawValue[]
) => string | string[];

export type ScaleName =
    | 'x'
    | 'y'
    | 'r'
    | 'color'
    | 'opacity'
    | 'length'
    | 'symbol'
    | 'fx'
    | 'fy'
    | 'projection';

export type ScaleOptions = {
    /**
     * Override the automatic scale type detection.
     */
    type: ScaleType | 'auto';
    /**
     * Set a custom domain for the scale instead of auto-computing the domain
     * from the mark data channels.
     */
    domain: RawValue[];
    /**
     * Set a custom range for the scale.
     */
    range: RawValue[];
    /**
     * Reverse the scale.
     */
    reverse: boolean;
    /**
     * the axis label for this scale, or false to disable the automatic label
     */
    label: string | false;
    /**
     * the interval for ordinal/temporal scales, e.g. 'day', 'month', or a numeric step
     */
    interval: string | number;
    // quantitative scales
    /**
     * clamp values outside the domain to the nearest domain boundary
     * (applicable to quantitative scales only)
     */
    clamp: boolean;
    /**
     * Extend the domain to nice round numbers (applicable to quantitative scales only)
     */
    nice: boolean;
    /**
     * Include zero in the scale domain (applicable to quantitative scales only)
     */
    zero: boolean;
    /**
     * round interpolated values to integers (applicable to quantitative scales only)
     */
    round: boolean;
    /**
     * format values as percentages and append (%) to the axis label
     * (applicable to quantitative scales only)
     */
    percent: boolean;
    /**
     * custom transformation function applied to values before scaling
     */
    transform?: (d: RawValue) => RawValue;
    // point & band scales
    /**
     * set the padding for band scales
     */
    padding: number;
    /**
     * set the align for band or point scales
     */
    align: number;
    // band scales
    /**
     * set the inner padding for band scales
     */
    paddingInner: number;
    /**
     * set the outer padding for band scales
     */
    paddingOuter: number;
    // position scales
    /**
     * reduce the scale range by this many pixels on the left side
     */
    insetLeft: number;
    /**
     * reduce the scale range by this many pixels on the right side
     */
    insetRight: number;
    /**
     * reduce the scale range by this many pixels on the top side
     */
    insetTop: number;
    /**
     * reduce the scale range by this many pixels on the bottom side
     */
    insetBottom: number;
    /**
     * explicit tick values to use instead of automatic tick generation
     */
    ticks: RawValue[];
    /**
     * desired pixel distance between ticks for automatic tick generation
     */
    tickSpacing: number;
    // log scales
    /**
     * the logarithm base for log scales (default 10)
     */
    base: number;
    /**
     * controls domain ordering for band and point scales; can be a channel
     * accessor, a comparator function, or an object with channel and order
     */
    sort:
        | ChannelAccessor
        | ((a: RawValue, b: RawValue) => number)
        | {
              channel: string;
              order: 'ascending' | 'descending';
          };
    /**
     * the constant parameter for symlog scales, controlling the transition
     * between linear and logarithmic behavior near zero (default 1)
     */
    constant: number;
};

export type ColorScaleOptions = ScaleOptions & {
    /**
     * if true, show a color legend for this scale
     */
    legend: boolean;
    /**
     * the color scale type; extends the base scale types with color-specific
     * types like categorical, sequential, diverging, etc.
     */
    type:
        | ScaleType
        | 'categorical'
        | 'sequential'
        | 'cyclical'
        | 'threshold'
        | 'quantile'
        | 'quantize'
        | 'diverging'
        | 'diverging-log'
        | 'diverging-pow'
        | 'diverging-sqrt'
        | 'diverging-symlog';
    /**
     * the name of the color scheme to use, e.g. 'blues', 'turbo', 'rdylbu'
     */
    scheme: ColorScheme | string[];
    /**
     * fallback color used for null/undefined
     */
    unknown: string;
    /**
     * center value for diverging scales
     */
    pivot: number;
    /**
     * number of colors for quantize and quantile-threshold scales
     */
    n: number;
    /**
     * custom interpolation function for the color scale output
     */
    interpolate: (d: any) => typeof d;
    /**
     * The tick format for the color scale legend.
     */
    tickFormat: false | Intl.NumberFormatOptions | TickFormatFunction;
};

export type ScaleType =
    | 'linear'
    | 'pow'
    | 'sqrt'
    | 'log'
    | 'symlog'
    | 'time'
    | 'point'
    | 'ordinal'
    | 'sequential'
    | 'band'
    | 'categorical'
    | 'cyclical'
    | 'threshold'
    | 'quantile-cont'
    | 'quantile'
    | 'quantize'
    | 'diverging'
    | 'diverging-log'
    | 'diverging-pow'
    | 'diverging-sqrt'
    | 'diverging-symlog';

export type XScaleOptions = ScaleOptions & {
    /**
     * Activate the implicit GridX mark. For more control over the grid styling
     * and layering, add an explicit GridX mark to your plot instead of using the
     * implicit grids.
     */
    grid: boolean;
    /**
     * Controls the position of the implicit AxisX mark, or set to false to disable
     * the implicit AxisX mark. For more control over the axis styling and layering
     * add an explicit AxisX mark to your plot instead of using the implicit axes.
     */
    axis: AxisXAnchor | false;
    /**
     * rotate the axis ticks
     */
    tickRotate: number;

    /**
     * horizontal position of the axis label
     */
    labelAnchor: 'auto' | 'left' | 'center' | 'right';
    /**
     * custom tick format; false to hide tick labels, an Intl.NumberFormatOptions
     * object, or a function mapping values to strings
     */
    tickFormat:
        | 'auto'
        | false
        | Intl.NumberFormatOptions
        | Intl.DateTimeFormatOptions
        | TickFormatFunction;
    /**
     * Enable word wrapping for axis tick labels, default true
     */
    wordWrap: boolean;
    /**
     * Remove duplicate ticks from axis, default true
     */
    removeDuplicateTicks: boolean;
};

export type YScaleOptions = ScaleOptions & {
    /**
     * Activate the implicit GridY mark. For more control over the grid styling
     * and layering, add an explicit GridY mark to your plot instead of using the
     * implicit grids.
     */
    grid: boolean;
    /**
     * Controls the position of the implicit AxisY mark, or set to false to disable
     * the implicit AxisY mark. For more control over the axis styling and layering
     * add an explicit AxisY mark to your plot instead of using the implicit axes.
     */
    axis: AxisYAnchor | false;
    /**
     * custom tick format; false to hide tick labels, an Intl.NumberFormatOptions
     * object, or a function mapping values to strings
     */
    tickFormat:
        | 'auto'
        | false
        | Intl.NumberFormatOptions
        | Intl.DateTimeFormatOptions
        | TickFormatFunction;
    /**
     * rotate the axis ticks
     */
    tickRotate: number;
    /**
     * vertical position of the axis label
     */
    labelAnchor: 'auto' | 'bottom' | 'middle' | 'top';
};

export type LegendScaleOptions = ScaleOptions & {
    /**
     * if true, show a legend for this scale
     */
    legend: boolean;
};

/**
 * Broad callable shape for resolved d3 scale functions used internally by marks.
 * Specific methods only exist for certain scale types and may be undefined.
 */
export type PlotScaleFunction = ((value: any) => any) & {
    range: () => RawValue[];
    invert: (value: number) => RawValue;
    bandwidth: () => number;
    ticks: (count: number) => RawValue[];
    quantiles: () => number[];
    thresholds: () => number[];
    domain: () => RawValue[];
};

export type PlotScale = {
    /**
     * the resolved scale type
     */
    type: ScaleType;
    /**
     * the resolved domain of the scale
     */
    domain: RawValue[];
    /**
     * the resolved range of the scale
     */
    range: RawValue[];
    /**
     * automatically computed axis label based on data channel names
     */
    autoTitle?: string;
    /**
     * The number of marks that are using this scale.
     */
    manualActiveMarks: number;
    /**
     * Set of accessors used in channels that are bound to this scale.
     */
    uniqueScaleProps: Set<ChannelAccessor>;
    /**
     * tracks which marks should skip this scale for specific channels,
     * e.g. when channel values are already in output space
     */
    skip: Map<ScaledChannelName, Set<symbol>>;
    /**
     * the underlying d3 scale function that maps domain values to range values.
     * Typed as a broad callable since the actual type depends on the scale type
     * (linear, band, ordinal, etc.) and may be augmented with custom methods.
     */
    fn: PlotScaleFunction;
    /**
     * whether this is a dummy scale (created when no scale was defined)
     */
    isDummy?: boolean;
};

export type PlotScales = Record<ScaleName, PlotScale>;
