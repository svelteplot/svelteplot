import type { ComponentProps } from 'svelte';
import type { ColorScheme } from './colorScheme.js';
import type { GeoProjection } from 'd3-geo';
import type {
    ChannelAccessor,
    ChannelName,
    ColorScaleOptions,
    DataRecord,
    LegendScaleOptions,
    PlotScales,
    ScaleOptions,
    XScaleOptions,
    YScaleOptions
} from './index.js';
import type { Snippet } from 'svelte';

import type {
    Area,
    AreaX,
    AreaY,
    Arrow,
    AxisX,
    AxisY,
    BarX,
    BarY,
    BoxX,
    BoxY,
    Brush,
    BrushX,
    BrushY,
    Cell,
    DifferenceY,
    Dot,
    Frame,
    Geo,
    Graticule,
    GridX,
    GridY,
    Image,
    Line,
    Link,
    Pointer,
    Rect,
    RectX,
    RectY,
    RuleX,
    RuleY,
    Sphere,
    Spike,
    Text,
    TickX,
    TickY,
    Vector
} from '../marks/index.js';

export type PlotState = {
    width: number;
    height: number;
    options: PlotOptions;
    facetWidth: number;
    facetHeight: number;
    plotWidth: number;
    plotHeight: number;
    scales: PlotScales;
    body: HTMLDivElement;
    /**
     * True if there's a color scale and a symbol scale and both are bound to the same
     * single channel accessor.
     */
    colorSymbolRedundant: boolean;
    /**
     * True if the plot is using filled dot marks.
     */
    hasFilledDotMarks: boolean;
    css: ((d: string) => string) | null;
};

export type PlotContext = {
    /**
     * Registers a mark with the Plot component along with its
     * data and the channel mappings.
     */
    addMark: (mark: Mark<GenericMarkOptions>) => Mark<GenericMarkOptions>;
    /**
     * Updates a mark after either the data or the channel mappings
     * have been updated.
     */
    updateMark: (mark: Mark<GenericMarkOptions>) => void;
    /**
     * Unregister a mark from the Plot component after the mark
     * component has been destroyed.
     */
    removeMark: (mark: Mark<GenericMarkOptions>) => void;
    getPlotState: () => PlotState;
    getTopLevelFacet: () => PlotOptions['facet'];
    /**
     * Updates the plots internal facetWidth and facetHeight dimensions
     * which are used as range for the positional scales x and y.
     */
    updateDimensions: (width: number, height: number) => void;
};

type IgnoreDefaults = 'data' | 'facet' | ChannelName | 'title' | 'automatic' | 'children';

export type PlotMargin = {
    top?: number | 'auto';
    right?: number | 'auto';
    bottom?: number | 'auto';
    left?: number | 'auto';
};

/**
 * these are the default options for the plot marks that can be set using
 * the setPlotDefaults hook
 */
export type PlotDefaults = {
    /**
     * default plot height
     */
    height: number;
    /**
     * default plot inset
     */
    inset: number;
    /**
     * default plot margin
     */
    margin: 'auto' | number | PlotMargin;
    /**
     * default color scheme
     */
    colorScheme: ColorScheme;
    categoricalColorScheme: ColorScheme | string[];
    /**
     * fallback color to be used for null/NA
     */
    unknown: string;
    /**
     * optional @emotion/css function to style the plot
     */
    css: (d: string) => string | undefined;
    /**
     * for computing the automatic height based on the number of
     * domain items in a point scale
     */
    pointScaleHeight: number;
    /**
     * for computing the automatic height based on the number of
     * domain items in a band scale
     */
    bandScaleHeight: number;
    /**
     * initial width of the plot before measuring the actual width
     */
    initialWidth: number;
    /**
     * locale, used for automatic axis ticks
     */
    locale: string;
    /**
     * default number format for axis ticks
     */
    numberFormat: Intl.NumberFormatOptions;
    /**
     * default dot radius for line markers, used in dot, circle, and circle-stroke markers
     */
    markerDotRadius: number;
    /**
     * if set to true, ordinal domains will be sorted alphabetically
     */
    sortOrdinalDomains: boolean;
    /**
     * default props for area marks, applied to area, areaX, and areaY marks
     */
    area: Partial<Omit<ComponentProps<typeof Area>, IgnoreDefaults>>;
    /**
     * default props for areaX marks
     */
    areaX: Partial<Omit<ComponentProps<typeof AreaX>, IgnoreDefaults>>;
    /**
     * default props for areaY marks
     */
    areaY: Partial<Omit<ComponentProps<typeof AreaY>, IgnoreDefaults>>;
    /**
     * default props for arrow marks
     */
    arrow: Partial<Omit<ComponentProps<typeof Arrow>, IgnoreDefaults>>;
    /**
     * default props for axis marks, applied to both axisX and axisY marks
     */
    axis: Partial<
        Omit<
            ComponentProps<typeof AxisX>,
            'data' | 'facet' | ChannelName | 'facetAnchor' | 'labelAnchor' | 'anchor'
        > & { implicit: boolean }
    >;
    /**
     * default props for axisX marks
     */
    axisX: Partial<Omit<ComponentProps<typeof AxisX>, IgnoreDefaults> & { implicit: boolean }>;
    /**
     * default props for axisY marks
     */
    axisY: Partial<Omit<ComponentProps<typeof AxisY>, IgnoreDefaults> & { implicit: boolean }>;
    /**
     * default props for bar marks, applied to both barX and barY marks
     */
    bar: Partial<Omit<ComponentProps<typeof BarX>, IgnoreDefaults>>;
    /**
     * default props for barX marks
     */
    barX: Partial<Omit<ComponentProps<typeof BarX>, IgnoreDefaults>>;
    /**
     * default props for barY marks
     */
    barY: Partial<Omit<ComponentProps<typeof BarY>, IgnoreDefaults>>;
    /**
     * default props for box marks, applied to boxX and boxY marks
     */
    box: Partial<Omit<ComponentProps<typeof BoxX>, IgnoreDefaults>>;
    /**
     * default props for boxX marks
     */
    boxX: Partial<Omit<ComponentProps<typeof BoxX>, IgnoreDefaults>>;
    /**
     * default props for boxY marks
     */
    boxY: Partial<Omit<ComponentProps<typeof BoxY>, IgnoreDefaults>>;
    /**
     * default props for brush marks, applied to brush, brushX and brushY marks
     */
    brush: Partial<Omit<ComponentProps<typeof Brush>, IgnoreDefaults | 'limitDimension'>>;
    /**
     * default props for brushX marks
     */
    brushX: Partial<Omit<ComponentProps<typeof BrushX>, IgnoreDefaults>>;
    /**
     * default props for brushY marks
     */
    brushY: Partial<Omit<ComponentProps<typeof BrushY>, IgnoreDefaults>>;
    /**
     * default props for cell marks
     */
    cell: Partial<Omit<ComponentProps<typeof Cell>, IgnoreDefaults>>;
    /**
     * default props for dot marks
     */
    dot: Partial<Omit<ComponentProps<typeof Dot>, IgnoreDefaults>>;
    /**
     * default props for differenceY marks
     */
    differenceY: Partial<Omit<ComponentProps<typeof DifferenceY>, IgnoreDefaults>>;
    /**
     * default props for frame marks
     */
    frame: Partial<ComponentProps<typeof Frame> & { implicit: boolean }>;
    /**
     * default props for geo marks
     */
    geo: Partial<Omit<ComponentProps<typeof Geo>, IgnoreDefaults>>;
    /**
     * default props for graticule marks
     */
    graticule: Partial<Omit<ComponentProps<typeof Graticule>, IgnoreDefaults>>;
    /**
     * default props for grid marks, applied to both gridX and gridY marks
     */
    grid: Partial<Omit<ComponentProps<typeof GridX>, IgnoreDefaults> & { implicit: boolean }>;
    /**
     * default props for gridX marks
     */
    gridX: Partial<Omit<ComponentProps<typeof GridX>, IgnoreDefaults> & { implicit: boolean }>;
    /**
     * default props for gridY marks
     */
    gridY: Partial<Omit<ComponentProps<typeof GridY>, IgnoreDefaults> & { implicit: boolean }>;
    /**
     * default props for image marks
     */
    image: Partial<Omit<ComponentProps<typeof Image>, IgnoreDefaults>>;
    /**
     * default props for line marks
     */
    line: Partial<Omit<ComponentProps<typeof Line>, IgnoreDefaults>>;
    /**
     * default props for link marks
     */
    link: Partial<Omit<ComponentProps<typeof Link>, IgnoreDefaults>>;
    /**
     * default props for pointer marks
     */
    pointer: Partial<Omit<ComponentProps<typeof Pointer>, IgnoreDefaults>>;
    /**
     * default props for rect marks, applied to rect and rectX marks
     */
    rect: Partial<Omit<ComponentProps<typeof Rect>, IgnoreDefaults>>;
    /**
     * default props for rectX marks
     */
    rectX: Partial<Omit<ComponentProps<typeof RectX>, IgnoreDefaults>>;
    /**
     * default props for rectY marks
     */
    rectY: Partial<Omit<ComponentProps<typeof RectY>, IgnoreDefaults>>;
    /**
     * default props for rule marks
     */
    rule: Partial<Omit<ComponentProps<typeof RuleX>, IgnoreDefaults>>;
    /**
     * default props for rule marks
     */
    ruleX: Partial<Omit<ComponentProps<typeof RuleX>, IgnoreDefaults>>;
    /**
     * default props for rule marks
     */
    ruleY: Partial<Omit<ComponentProps<typeof RuleY>, IgnoreDefaults>>;
    /**
     * default props for sphere marks
     */
    sphere: Partial<ComponentProps<typeof Sphere>>;
    /**
     * default props for spike marks
     */
    spike: Partial<Omit<ComponentProps<typeof Spike>, IgnoreDefaults>>;
    /**
     * default props for text marks
     */
    text: Partial<Omit<ComponentProps<typeof Text>, IgnoreDefaults>>;
    /**
     * default props for tick marks, applied to tickX and tickY marks
     */
    tick: Partial<Omit<ComponentProps<typeof TickX>, IgnoreDefaults>>;
    /**
     * default props for tickX marks
     */
    tickX: Partial<Omit<ComponentProps<typeof TickX>, IgnoreDefaults>>;
    /**
     * default props for tickY marks
     */
    tickY: Partial<Omit<ComponentProps<typeof TickY>, IgnoreDefaults>>;
    /**
     * default props for vector marks
     */
    vector: Partial<Omit<ComponentProps<typeof Vector>, IgnoreDefaults>>;
};

export type PlotOptions = {
    /**
     * The plot title, rendered as H2 tag above the SVG element. Instead of
     * using the title, you can also pass a "header" snippet and render your
     * own custom title markup.
     */
    title: string;
    /**
     * The plot subtitle, rendered as H3 tag above the SVG element. Instead of
     * using the subtitle, you can also pass a "header" snippet and render your
     * own custom title markup.
     */
    subtitle: string;
    /**
     * The plot caption, rendered as FIGCAPTION tag below the SVG element. Instead of
     * using the caption, you can also pass a "footer" snippet and render your
     * own custom title markup.
     */
    caption: string;
    /**
     * By default, the plot will extend to fit 100% of the parent container width. By
     * setting the maxWidth style property you can limit the width of your plot.
     */
    maxWidth?: string;
    /**
     * force the plot into a fixed width
     */
    width?: number;
    /**
     * force the plot into a fixed height
     */
    height: 'auto' | number | ((d: number) => number);
    /**
     * If margin is set to "auto" (the default), the plot will automatically
     * compute appropriate margins based on the presence of axes, labels, and
     * the overall plot size. You can also set a fixed margin value in px.
     */
    margin: PlotMargin | number | 'auto';
    /**
     * Left margin of the plot, in px.
     */
    marginLeft: number;
    /**
     * Right margin of the plot, in px.
     */
    marginRight: number;
    /**
     * Top margin of the plot, in px.
     */
    marginTop: number;
    /**
     * Bottom margin of the plot, in px.
     */
    marginBottom: number;
    /**
     * Activates the implicit GridX and GridY marks.
     */
    grid: boolean;
    /**
     * Activates the implicit AxisX and AxisY marks.
     */
    axes: boolean;
    /**
     * Activates the implicit frame marks
     */
    frame: boolean;
    /**
     * Convenience shortcut for setting both the x and y scale insets.
     */
    inset: number;
    /**
     * Convenience shortcut for setting both the x and y scale paddings
     */
    padding: number;
    /**
     * Geo-projection
     */
    projection:
        | string
        | null
        | {
              type?: string;
              rotate?: [number, number] | [number, number, number];
              domain?: object;
              inset?: number;
              clip?: Clip;
          }
        | {
              type: (d: { width: number; height: number }) => GeoProjection;
          };
    /**
     * if not null, computes a default height such that a variation of one
     * unit in the x dimension is represented by the corresponding number
     * of pixels as a variation in the y dimension of one unit.
     */
    aspectRatio: number | null;
    /**
     * Top-level faceting options
     */
    facet: Partial<{
        /**
         * The data to facet by. Turns on automatic faceting for all marks that
         * use the exact same data (===)
         */
        data: DataRecord<any>[];
        x: ChannelAccessor;
        y: ChannelAccessor;
    }>;
    /**
     * Options for the shared x scale.
     */
    x: Partial<XScaleOptions>;
    /**
     * Options for the shared y scale
     */
    y: Partial<YScaleOptions>;
    /**
     * Options for the shared radius scale
     */
    r: Partial<ScaleOptions>;
    color: Partial<ColorScaleOptions>;
    opacity: Partial<ScaleOptions>;
    symbol: Partial<LegendScaleOptions>;
    length: Partial<ScaleOptions>;
    fx: Partial<ScaleOptions>;
    fy: Partial<ScaleOptions>;
    children: Snippet<
        [{ width: number; height: number; options: PlotOptions; scales: PlotScales }]
    >;
    /**
     * You can use the header snippet to render a custom title and subtitle for
     * your plot, or place a legend above the visualization.
     */
    header: Snippet;
    footer: Snippet;
    /**
     * The underlay snippet is useful for adding a layer of custom HTML markup
     * behind the SVG body of your plot, e.g. for a watermark or background image.
     */
    underlay: Snippet<[PlotOptions]>;
    /**
     * The overlay snippet is useful for adding a layer of custom HTML markup
     * in front of the SVG body of your plot, e.g. for HTML tooltips.
     */
    overlay: Snippet<[{ width: number; height: number; options: PlotOptions; scales: PlotScales }]>;
    facetAxes: Snippet;
    /**
     * if you set testid, the plot container will get a data-testid attribute which
     * can be useful for automatic testing
     */
    testid: string;
    /**
     * in case you want to give your Plot element an extra CSS class
     */
    class: string | null;
    /**
     * if set to true, the plot will use the implicit scales
     */
    implicitScales: boolean;
    /**
     * locale used for automatic axis ticks
     */
    locale: string;
    /**
     * pass a @emotion/css function to style plot using dynamic classes
     */
    css: (d: string) => string | undefined;
    /**
     * if set to true, ordinal domains will be sorted alphabetically
     */
    sortOrdinalDomains: boolean;
};
