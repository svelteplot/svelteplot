import type { ConstantAccessor, RawValue } from './index.js';

/** a partial record of channel names to their accessor definitions */
export type Channels<T = Record<string | symbol, RawValue>> = Partial<
    Record<string | symbol, ChannelAccessor<T> | ConstantAccessor<RawValue, T>>
>;

type BivariantCallback<TArgs extends unknown[], TResult> = {
    bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

/** channel accessor callback receiving a typed datum */
export type ChannelValueAccessor<T = Record<string | symbol, RawValue>> = BivariantCallback<
    [d: T, index: number],
    RawValue
>;

/** plain objects are allowed as constants, except accessor option objects with `value`/`scale` keys */
export type ChannelConstantObject = object & {
    value?: never;
    scale?: never;
};

/** constant channel values (non-accessor) */
export type ChannelConstantValue =
    | Exclude<RawValue, object>
    | Date
    | ChannelConstantObject
    | null
    | undefined;

/**
 * a channel accessor: either a simple channel value, or an object with
 * a value and an optional scale override
 */
export type ChannelAccessor<T = Record<string | symbol, RawValue>> =
    | ChannelValue<T>
    | {
          /** the channel value */
          value: ChannelValue<T>;
          /** you can bypass the scale by passing null */
          scale: boolean | null;
      };

/**
 * the value for a channel: a constant, a data field name, an accessor
 * function, or null/undefined to leave the channel unset
 */
export type ChannelValue<T = Record<string | symbol, RawValue>> =
    | ChannelConstantValue
    | keyof T
    | ChannelValueAccessor<T>
    | null
    | undefined;

/** the name of a channel that is bound to a scale */
export type ScaledChannelName =
    | 'fill'
    | 'fillOpacity'
    | 'opacity'
    | 'r'
    | 'length'
    | 'stroke'
    | 'strokeOpacity'
    | 'symbol'
    | 'fx'
    | 'fy'
    | 'x'
    | 'x1'
    | 'x2'
    | 'y'
    | 'y1'
    | 'y2';

/** maps a scaled channel name to its output type (string for color/symbol, number otherwise) */
export type ScaledChannelType<T extends ScaledChannelName> = T extends 'fill' | 'stroke' | 'symbol'
    ? string
    : number;

/** all channel names, including non-scaled channels like z, sort, filter, and interval */
export type ChannelName = ScaledChannelName | 'z' | 'sort' | 'filter' | 'interval';
