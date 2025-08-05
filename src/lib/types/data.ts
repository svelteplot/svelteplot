import type { ScaledChannelName, ScaledChannelType } from './channel.js';

export type RawValue = number | Date | boolean | string | symbol;

export type DataRecord<T = Record<string | symbol, RawValue>> = T & {
    ___orig___?: RawValue | [RawValue, RawValue];
};

export type ResolvedDataRecord<T = Record<string | symbol, RawValue>> = Partial<
    Record<ScaledChannelName, any>
> & {
    datum: DataRecord<T>;
};

export type ScaledDataRecord<T = Record<string | symbol, RawValue>> = Partial<{
    [K in ScaledChannelName]?: ScaledChannelType<K>;
}> & {
    datum: DataRecord<T>;
    valid: Boolean;
};

export type DataRow<T = Record<string | symbol, RawValue>> =
    | DataRecord<T>
    | RawValue
    | [number, number]
    | null;
