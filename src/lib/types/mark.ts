export type Mark<T> = {
    id: symbol;
    type: MarkType;
    channels: ScaledChannelName[];
    scales: Set<ScaleName>;
    data: DataRecord<T>[];
    options: T;
};

export type MarkType =
    | 'area'
    | 'arrow'
    | 'barX'
    | 'barY'
    | 'cell'
    | 'custom'
    | 'dot'
    | 'vector'
    | 'frame'
    | 'geo'
    | 'gridX'
    | 'gridY'
    | 'line'
    | 'rect'
    | 'regression'
    | 'ruleX'
    | 'ruleY'
    | 'swoopyArrow'
    | 'text'
    | 'tickX'
    | 'tickY'
    | 'trail'
    | 'waffleX'
    | 'waffleY';

// list of all prossible style props on marks
export type MarkStyleProps =
    | 'strokeDasharray'
    | 'strokeLinejoin'
    | 'strokeLinecap'
    | 'opacity'
    | 'cursor'
    | 'pointerEvents'
    | 'blend'
    | 'fill'
    | 'fillOpacity'
    | 'fontFamily'
    | 'fontWeight'
    | 'fontVariant'
    | 'fontSize'
    | 'fontStyle'
    | 'letterSpacing'
    | 'wordSpacing'
    | 'stroke'
    | 'strokeWidth'
    | 'strokeOpacity'
    | 'x'
    | 'y'
    | 'clipPath'
    | 'mask'
    | 'filter'
    | 'angle'
    | 'radius'
    | 'symbol'
    | 'textAnchor'
    | 'textTransform'
    | 'textDecoration'
    | 'width';

import type { ChannelAccessor, ConstantAccessor, DataRecord, RawValue } from './index.js';
import type * as CSS from 'csstype';
import type { ScaledChannelName } from './channel.js';
import type { ScaleName } from './scale.js';
import type { DodgeXOptions, DodgeYOptions } from 'svelteplot/transforms/dodge.js';

type MouseEventHandler<T extends EventTarget = EventTarget> = (
    event: Event & { currentTarget: T },
    datum?: unknown,
    index?: number
) => void;

export type BaseMarkProps<T> = Partial<{
    /**
     * Filter the data without modifying the inferred scales
     */
    filter: ConstantAccessor<boolean, T>;
    /** controls whether this mark participates in faceting; "exclude" to ignore facet filters, "include" to require matching facet values */
    facet: 'auto' | 'include' | 'exclude';
    /** the horizontal facet channel */
    fx: ChannelAccessor<T>;
    /** the vertical facet channel */
    fy: ChannelAccessor<T>;
    /** a horizontal offset in pixels applied after scaling */
    dx: ConstantAccessor<number, T>;
    /** a vertical offset in pixels applied after scaling */
    dy: ConstantAccessor<number, T>;
    /** options for horizontal dodge positioning to avoid overlapping marks */
    dodgeX: DodgeXOptions;
    /** options for vertical dodge positioning to avoid overlapping marks */
    dodgeY: DodgeYOptions;
    /** the fill color; can be a fixed CSS color string or a channel accessor bound to the color scale */
    fill: ChannelAccessor<T>;
    /** the fill opacity; a number between 0 and 1 */
    fillOpacity: ConstantAccessor<number, T>;
    /** how to sort the mark data before rendering; can be a channel name string, an accessor, a comparator, or an object with channel and order */
    sort:
        | string
        | ConstantAccessor<RawValue, T>
        | ((a: RawValue, b: RawValue) => number)
        | {
              /** sort data using an already defined channel */
              channel: string;
              /** sort order */
              order?: 'ascending' | 'descending';
          };
    /** the stroke color; can be a fixed CSS color string or a channel accessor bound to the color scale */
    stroke: ChannelAccessor<T>;
    /** the stroke width in pixels */
    strokeWidth: ConstantAccessor<number, T>;
    /** the stroke opacity; a number between 0 and 1 */
    strokeOpacity: ConstantAccessor<number, T>;
    /** the SVG stroke line join style (e.g. "round", "bevel") */
    strokeLinejoin: ConstantAccessor<CSS.Property.StrokeLinejoin, T>;
    /** the SVG stroke line cap style (e.g. "round", "butt") */
    strokeLinecap: ConstantAccessor<CSS.Property.StrokeLinecap, T>;
    /** the SVG stroke miter limit */
    strokeMiterlimit: ConstantAccessor<number, T>;
    /** the overall element opacity; can be a fixed number or a channel accessor bound to the opacity scale */
    opacity: ChannelAccessor<T>;
    /** the SVG stroke dash pattern (e.g. "4 2") */
    strokeDasharray: ConstantAccessor<string, T>;
    /** the SVG stroke dash offset in pixels */
    strokeDashoffset: ConstantAccessor<number, T>;
    /** the CSS mix-blend-mode for compositing (e.g. "multiply", "screen") */
    mixBlendMode: ConstantAccessor<CSS.Property.MixBlendMode, T>;
    /** a CSS clip-path to clip the mark element */
    clipPath: string;
    /** a CSS mask to apply to the mark element */
    mask: string;
    /** a CSS filter to apply to the mark element (e.g. "blur(2px)") */
    imageFilter: ConstantAccessor<string, T>;
    /** the SVG shape-rendering attribute (e.g. "crispEdges", "geometricPrecision") */
    shapeRendering: ConstantAccessor<CSS.Property.ShapeRendering, T>;
    /** the SVG paint-order attribute (e.g. "stroke" to render stroke behind fill) */
    paintOrder: ConstantAccessor<string, T>;
    /** fired when the mark element is clicked */
    onclick: MouseEventHandler<SVGPathElement>;
    /** fired when the mark element is double-clicked */
    ondblclick: MouseEventHandler<SVGPathElement>;
    /** fired when a mouse button is released over the mark */
    onmouseup: MouseEventHandler<SVGPathElement>;
    /** fired when a mouse button is pressed over the mark */
    onmousedown: MouseEventHandler<SVGPathElement>;
    /** fired when the pointer enters the mark element */
    onmouseenter: MouseEventHandler<SVGPathElement>;
    /** fired when the pointer moves within the mark element */
    onmousemove: MouseEventHandler<SVGPathElement>;
    /** fired when the pointer leaves the mark element */
    onmouseleave: MouseEventHandler<SVGPathElement>;
    /** fired when the pointer moves out of the mark element */
    onmouseout: MouseEventHandler<SVGPathElement>;
    /** fired when the pointer moves onto the mark element */
    onmouseover: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer event is canceled */
    onpointercancel: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer becomes active over the mark */
    onpointerdown: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer is released over the mark */
    onpointerup: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer enters the mark element */
    onpointerenter: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer leaves the mark element */
    onpointerleave: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer moves within the mark element */
    onpointermove: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer moves onto the mark element */
    onpointerover: MouseEventHandler<SVGPathElement>;
    /** fired when a pointer moves out of the mark element */
    onpointerout: MouseEventHandler<SVGPathElement>;
    /** fired continuously while the mark is being dragged */
    ondrag: MouseEventHandler<SVGPathElement>;
    /** fired when a dragged element is dropped on the mark */
    ondrop: MouseEventHandler<SVGPathElement>;
    /** fired when a drag operation begins on the mark */
    ondragstart: MouseEventHandler<SVGPathElement>;
    /** fired when a dragged element enters the mark */
    ondragenter: MouseEventHandler<SVGPathElement>;
    /** fired when a dragged element leaves the mark */
    ondragleave: MouseEventHandler<SVGPathElement>;
    /** fired when a dragged element is over the mark */
    ondragover: MouseEventHandler<SVGPathElement>;
    /** fired when a drag operation ends */
    ondragend: MouseEventHandler<SVGPathElement>;
    /** fired when a touch point is placed on the mark */
    ontouchstart: MouseEventHandler<SVGPathElement>;
    /** fired when a touch point moves along the mark */
    ontouchmove: MouseEventHandler<SVGPathElement>;
    /** fired when a touch point is removed from the mark */
    ontouchend: MouseEventHandler<SVGPathElement>;
    /** fired when a touch event is canceled */
    ontouchcancel: MouseEventHandler<SVGPathElement>;
    /** fired when the context menu is triggered on the mark */
    oncontextmenu: MouseEventHandler<SVGPathElement>;
    /** fired when the mouse wheel is scrolled over the mark */
    onwheel: MouseEventHandler<SVGPathElement>;
    /**
     * if you want to give your mark element an extra CSS class
     */
    class: string;
    /**
     * if you want to give your mark element an extra inline style
     */
    style: string;
    /** the CSS cursor style when hovering over the mark (e.g. "pointer", "crosshair") */
    cursor: ConstantAccessor<CSS.Property.Cursor, T>;
}>;

export type LinkableMarkProps<T> = {
    /**
     * if set, the mark element will be wrapped in a <a> link element
     */
    href?: ConstantAccessor<string, T>;
    /**
     * the relationship of the target object to the link object (e.g. "noopener")
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#rel
     */
    rel?: ConstantAccessor<string, T>;
    /**
     * the link target mime type, e.g. "text/csv"
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#type
     */
    type?: ConstantAccessor<string, T>;
    /**
     * the target of the link, e.g. "_blank" or "_self"
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#target
     */
    target?: ConstantAccessor<'_self' | '_blank' | '_parent' | '_top' | string, T>;
    /**
     * if set to true, the link will be downloaded instead of navigating to it
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download
     */
    download?: ConstantAccessor<boolean, T>;
    // allow data-sveltekit-* attributes on the link element, e.g. data-sveltekit-reload
    [key: `data-sveltekit-${string}`]: string | boolean | undefined;
};

export type BorderRadius =
    | number
    | {
          topLeft?: number;
          topRight?: number;
          bottomRight?: number;
          bottomLeft?: number;
      };

export type BaseRectMarkProps<T> = {
    /** shorthand to inset the rectangle on all sides, in pixels */
    inset?: ConstantAccessor<number, T>;
    /** inset the rectangle from the left edge, in pixels */
    insetLeft?: ConstantAccessor<number, T>;
    /** inset the rectangle from the top edge, in pixels */
    insetTop?: ConstantAccessor<number, T>;
    /** inset the rectangle from the right edge, in pixels */
    insetRight?: ConstantAccessor<number, T>;
    /** inset the rectangle from the bottom edge, in pixels */
    insetBottom?: ConstantAccessor<number, T>;
    /** the border radius of the rectangle; can be a number or a per-corner object */
    borderRadius?: ConstantAccessor<BorderRadius, T>;
};
