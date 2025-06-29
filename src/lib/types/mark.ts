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
    | 'tickY';

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
    | 'fontWeight'
    | 'fontVariant'
    | 'fontSize'
    | 'fontStyle'
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
    | 'width';

import type { MouseEventHandler } from 'svelte/elements';
import type { ChannelAccessor, ConstantAccessor, DataRecord, RawValue } from './index.js';
import type * as CSS from 'csstype';
import type { ScaledChannelName, ScaleName } from './scale.js';

export type BaseMarkProps<T> = Partial<{
    /**
     * Filter the data without modifying the inferred scales
     */
    filter?: ConstantAccessor<boolean, T>;
    facet?: 'auto' | 'include' | 'exclude';
    fx: ChannelAccessor<T>;
    fy: ChannelAccessor<T>;
    dx: ConstantAccessor<number, T>;
    dy: ConstantAccessor<number, T>;
    fill: ChannelAccessor<T>;
    fillOpacity: ConstantAccessor<number, T>;
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
    stroke: ChannelAccessor<T>;
    strokeWidth: ConstantAccessor<number, T>;
    strokeOpacity: ConstantAccessor<number, T>;
    strokeLinejoin: ConstantAccessor<CSS.Property.StrokeLinejoin, T>;
    strokeLinecap: ConstantAccessor<CSS.Property.StrokeLinecap, T>;
    strokeMiterlimit: ConstantAccessor<number, T>;
    opacity: ChannelAccessor<T>;
    strokeDasharray: ConstantAccessor<string, T>;
    strokeDashoffset: ConstantAccessor<number, T>;
    mixBlendMode: ConstantAccessor<CSS.Property.MixBlendMode, T>;
    clipPath: string;
    imageFilter: ConstantAccessor<string, T>;
    shapeRendering: ConstantAccessor<CSS.Property.ShapeRendering, T>;
    paintOrder: ConstantAccessor<string, T>;
    onclick?: MouseEventHandler<SVGPathElement>;
    ondblclick?: MouseEventHandler<SVGPathElement>;
    onmouseup?: MouseEventHandler<SVGPathElement>;
    onmousedown?: MouseEventHandler<SVGPathElement>;
    onmouseenter?: MouseEventHandler<SVGPathElement>;
    onmousemove?: MouseEventHandler<SVGPathElement>;
    onmouseleave?: MouseEventHandler<SVGPathElement>;
    onmouseout?: MouseEventHandler<SVGPathElement>;
    onmouseover?: MouseEventHandler<SVGPathElement>;
    onpointercancel?: MouseEventHandler<SVGPathElement>;
    onpointerdown?: MouseEventHandler<SVGPathElement>;
    onpointerup?: MouseEventHandler<SVGPathElement>;
    onpointerenter?: MouseEventHandler<SVGPathElement>;
    onpointerleave?: MouseEventHandler<SVGPathElement>;
    onpointermove?: MouseEventHandler<SVGPathElement>;
    onpointerover?: MouseEventHandler<SVGPathElement>;
    onpointerout?: MouseEventHandler<SVGPathElement>;
    ondrag?: MouseEventHandler<SVGPathElement>;
    ondrop?: MouseEventHandler<SVGPathElement>;
    ondragstart?: MouseEventHandler<SVGPathElement>;
    ondragenter?: MouseEventHandler<SVGPathElement>;
    ondragleave?: MouseEventHandler<SVGPathElement>;
    ondragover?: MouseEventHandler<SVGPathElement>;
    ondragend?: MouseEventHandler<SVGPathElement>;
    ontouchstart?: MouseEventHandler<SVGPathElement>;
    ontouchmove?: MouseEventHandler<SVGPathElement>;
    ontouchend?: MouseEventHandler<SVGPathElement>;
    ontouchcancel?: MouseEventHandler<SVGPathElement>;
    oncontextmenu?: MouseEventHandler<SVGPathElement>;
    onwheel?: MouseEventHandler<SVGPathElement>;
    /**
     * if you want to give your mark element an extra CSS class
     */
    class: string | null;
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
    inset?: ConstantAccessor<number, T>;
    insetLeft?: ConstantAccessor<number, T>;
    insetTop?: ConstantAccessor<number, T>;
    insetRight?: ConstantAccessor<number, T>;
    insetBottom?: ConstantAccessor<number, T>;
    borderRadius?: BorderRadius;
};
