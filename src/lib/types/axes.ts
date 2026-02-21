import type * as CSS from 'csstype';
import type { ChannelAccessor, ConstantAccessor, DataRecord, RawValue } from './index.js';

export type AxisTextAnchor = 'start' | 'middle' | 'end';

export type AxisTickDatum<
    TKeyRaw extends symbol = symbol,
    TKeyIndex extends symbol = symbol
> = DataRecord & { [K in TKeyRaw]: RawValue } & { [K in TKeyIndex]: number };

export type AxisXTick<TDatum extends DataRecord = DataRecord> = TDatum & {
    hidden: boolean;
    dx: number;
    dy: number;
    x: number;
    text: string[];
    element: SVGTextElement | null;
};

export type AxisYTick<TDatum extends DataRecord = DataRecord> = TDatum & {
    hidden: boolean;
    dx: number;
    dy: number;
    y: number;
    text: string | string[];
    element: SVGTextElement | null;
};

export type BaseAxisXOptions = Record<string | symbol, any> & {
    dx?: ConstantAccessor<number>;
    dy?: ConstantAccessor<number>;
    filter?: ChannelAccessor;
    wordwrap?: boolean;
    fontWeight?: ConstantAccessor<CSS.Property.FontWeight>;
    textAnchor?: ConstantAccessor<AxisTextAnchor> | 'auto';
    removeDuplicateTicks?: boolean;
    anchor?: ConstantAccessor<'start' | 'end'>;
    style?: string;
};

export type BaseAxisYOptions = Record<string | symbol, any> & {
    dx?: ConstantAccessor<number>;
    dy?: ConstantAccessor<number>;
    filter?: ChannelAccessor;
    fontWeight?: ConstantAccessor<CSS.Property.FontWeight>;
    textAnchor?: ConstantAccessor<AxisTextAnchor>;
    style?: string;
};
