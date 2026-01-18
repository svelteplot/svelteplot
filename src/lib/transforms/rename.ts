import type { DataRecord } from '$lib/types/index.js';
import type { ScaledChannelName, TransformArg } from '$lib/types/index.js';

type RenameChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName>>;
type ReplaceChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName[]>>;

// using a symbol doesn't work because channels are spread into components
export const RENAME = Symbol('renamed');

/**
 * renames a channel without modifying the data
 */
export function renameChannels<T>(
    { data, ...channels }: TransformArg<T, DataRecord>,
    options: RenameChannelsOptions
): TransformArg<T, DataRecord> {
    const newChannels = channels;
    for (const [from, to] of Object.entries(options) as [ScaledChannelName, ScaledChannelName][]) {
        if (newChannels[from] !== undefined) {
            newChannels[to] = newChannels[from];
            // keep track of the renaming
            newChannels[RENAME] = newChannels[RENAME] || {};
            newChannels[RENAME][to] = from;
            delete newChannels[from];
        }
    }
    return { data, ...newChannels };
}

/**
 * renames a channel and copy the data
 */
export function renameChannelsAndData<T>(
    { data, ...channels }: TransformArg<T, DataRecord>,
    options: RenameChannelsOptions
): TransformArg<T, DataRecord> {
    const newData = [];
    for (const datum of data) {
        const newDatum = { ...datum };
        for (const [from, to] of Object.entries(options) as [
            ScaledChannelName,
            ScaledChannelName
        ][]) {
            if (channels[from] !== undefined) {
                newDatum[to] = newDatum[from];
                delete newDatum[from];
            }
        }
        newData.push(newDatum);
    }
    return renameChannels({ data: newData, ...channels }, options);
}

export function replaceChannels<T>(
    { data, ...channels }: TransformArg<T, DataRecord>,
    options: ReplaceChannelsOptions
): TransformArg<T, DataRecord> {
    const newChannels = { ...channels };
    for (const [from, to] of Object.entries(options)) {
        if (newChannels[from] !== undefined) {
            for (const t of to) {
                newChannels[t] = newChannels[from];
            }
            delete newChannels[from];
        }
    }
    return { data, ...newChannels };
}
