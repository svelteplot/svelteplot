import type { ScaledChannelName, ScaledChannelType } from './channel.js';

export type RawValue = number | Date | boolean | string | symbol | object;

export type DataRecord<T = Record<string | symbol, RawValue>> = T;

export type ResolvedDataRecord<T = Record<string | symbol, RawValue>> = Partial<
    Record<ScaledChannelName, any>
> & {
    datum: DataRecord<T>;
    index: number;
};

export type ScaledDataRecord<T = Record<string | symbol, RawValue>> = Partial<{
    [K in ScaledChannelName]?: ScaledChannelType<K>;
}> & {
    dx: number;
    dy: number;
    datum: DataRecord<T>;
    resolved: ResolvedDataRecord<T>;
    valid: Boolean;
    index: number;
};

export type DataRow<T = Record<string | symbol, RawValue>> =
    | DataRecord<T>
    | RawValue
    | [number, number]
    | null;
