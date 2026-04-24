import type { DataRecord } from '../types/index.js';
import type { ScaledChannelName } from '../types/index.js';

type RenameChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName>>;
type ReplaceChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName[]>>;
type TransformLike<T extends DataRecord = DataRecord> = { data: T[] } & Record<
    string | symbol,
    any
>;

// using a symbol doesn't work because channels are spread into components
export const RENAME = Symbol('renamed');

/**
 * renames a channel without modifying the data
 */
export function renameChannels<T extends DataRecord, C extends TransformLike<T>>(
    { data, ...channels }: C,
    options: RenameChannelsOptions
): C {
    const newChannels = channels as any;
    for (const [from, to] of Object.entries(options) as [ScaledChannelName, ScaledChannelName][]) {
        if (newChannels[from] !== undefined) {
            newChannels[to] = newChannels[from];
            // keep track of the renaming
            newChannels[RENAME] = newChannels[RENAME] || {};
            newChannels[RENAME][to] = from;
            delete newChannels[from];
        }
    }
    return { data, ...newChannels } as C;
}

/**
 * renames a channel and copy the data
 */
export function renameChannelsAndData<T extends DataRecord, C extends TransformLike<T>>(
    { data, ...channels }: C,
    options: RenameChannelsOptions
): C {
    const newData: T[] = [];
    for (const datum of data) {
        const newDatum = { ...datum } as T;
        const mutableDatum = newDatum as Record<string | symbol, any>;
        for (const [from, to] of Object.entries(options) as [
            ScaledChannelName,
            ScaledChannelName
        ][]) {
            if (channels[from] !== undefined) {
                mutableDatum[to] = mutableDatum[from];
                delete mutableDatum[from];
            }
        }
        newData.push(newDatum);
    }
    return renameChannels({ data: newData, ...channels } as C, options);
}

/**
 * copies a channel's accessor to multiple target channels, then removes
 * the source channel
 */
export function replaceChannels<T extends DataRecord, C extends TransformLike<T>>(
    { data, ...channels }: C,
    options: ReplaceChannelsOptions
): C {
    const newChannels = { ...channels };
    for (const [from, to] of Object.entries(options)) {
        if ((newChannels as any)[from] !== undefined) {
            for (const t of to) {
                (newChannels as any)[t] = (newChannels as any)[from];
            }
            delete newChannels[from];
        }
    }
    return { data, ...newChannels } as C;
}
