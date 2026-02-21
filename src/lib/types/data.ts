import type { ScaledChannelName, ScaledChannelType } from './channel.js';

/** a raw data value that can be used in channels */
export type RawValue = number | Date | boolean | string | symbol | object | null;

/** a data record passed to marks; generic over the user's row shape */
export type DataRecord<T extends object = Record<string | symbol, RawValue>> = T;

/** a data record after channel accessors have been resolved to concrete values */
export type ResolvedDataRecord<T extends object = Record<string | symbol, RawValue>> = Partial<
    Record<ScaledChannelName, any>
> & {
    /** the original data record before resolution */
    datum: DataRecord<T>;
    /** the index of this record in the original data array */
    index: number;
};

/** a data record after scale functions have been applied to channel values */
export type ScaledDataRecord<T extends object = Record<string | symbol, RawValue>> = Partial<{
    [K in ScaledChannelName]?: ScaledChannelType<K>;
}> & {
    /** horizontal pixel offset applied after scaling */
    dx: number;
    /** vertical pixel offset applied after scaling */
    dy: number;
    /** the original data record */
    datum: DataRecord<T>;
    /** the resolved (pre-scaling) channel values */
    resolved: ResolvedDataRecord<T>;
    /** whether this record has valid values for all required channels */
    valid: boolean;
    /** the index of this record in the original data array */
    index: number;
};

/** a data row as passed by the user; can be a record, a raw value, a coordinate pair, or null */
export type DataRow<T extends object = Record<string | symbol, RawValue>> =
    | DataRecord<T>
    | RawValue
    | [number, number]
    | null;
