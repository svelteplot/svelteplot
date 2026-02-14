import isDataRecord from '../helpers/isDataRecord.js';
import type { TransformArgsRow, TransformArgsRecord, DataRecord, DataRow } from '../types/index.js';
import { INDEX } from '../constants';

export const X = Symbol('x');
export const Y = Symbol('y');

export const RAW_VALUE = Symbol('originalValue');

export function indexData<T extends object>(data: T[]): (T & { [INDEX]: number })[] {
    return data.map((d, i) => ({ ...d, [INDEX]: i }) as T & { [INDEX]: number });
}

/**
 * takes an array of raw values and returns data records in which the values
 * are interpreted as the x channel and their index as the y channel
 */
export function recordizeX<T>(
    { data, ...channels }: TransformArgsRow<DataRow>,
    { withIndex } = { withIndex: true }
): TransformArgsRecord<DataRecord> {
    const dataIsRawValueArray =
        !isDataRecord(data[0]) && !Array.isArray(data[0]) && channels.x == null;
    if (dataIsRawValueArray) {
        // we remove x, x1 and x2 from the channels since they make no sense when
        // the data is a raw value array
        const { x, x1, x2, ...nonXChannels } = channels;
        return {
            data: data.map((value, index) => ({
                [RAW_VALUE]: value,
                [INDEX]: index
            })) as T[],
            ...nonXChannels,
            x: RAW_VALUE,
            ...(withIndex ? { y: INDEX } : {})
        };
    }
    return { data: indexData(data as object[]) as T[], ...channels };
}

/**
 * takes an array of raw values and returns data records in which the values
 * are interpreted as the y channel and their index as the x channel
 */
export function recordizeY<T>(
    { data, ...channels }: TransformArgsRow<DataRow>,
    { withIndex } = { withIndex: true }
): TransformArgsRecord<DataRecord> {
    if (!data) return { data, ...channels };
    const dataIsRawValueArray =
        !isDataRecord(data[0]) && !Array.isArray(data[0]) && channels.y == null;
    if (dataIsRawValueArray) {
        // we remove y, y1 and y2 from the channels since they make no sense when
        // the data is a raw value array
        const { y, y1, y2, ...nonYChannels } = channels;
        return {
            data: Array.from(data).map((value, index) => ({
                [INDEX]: index,
                [RAW_VALUE]: value
            })) as T[],
            ...nonYChannels,
            ...(withIndex ? { x: INDEX } : {}),
            y: RAW_VALUE
        };
    }
    return { data: indexData(data as object[]) as T[], ...channels };
}

/**
 * This transform is used to allow users to pass an [[x0, y0], [x1, y1], ...] array
 * as dataset to marks that support it. It transforms the arrays into records, so
 * the rest of our code doesn't have to deal with this case anymore.
 */
export function recordizeXY<T>({ data, ...channels }: TransformArgsRow<T>): TransformArgsRecord<T> {
    if (!data) return { data, ...channels };
    if (
        !isDataRecord(data[0]) &&
        Array.isArray(data[0]) &&
        channels.x === undefined &&
        channels.y === undefined
    ) {
        return {
            data: (data as [number, number][]).map(([x, y, ...rest], i) => ({
                [RAW_VALUE]: [x, y, ...rest],
                [INDEX]: i,
                [X]: x,
                [Y]: y
            })) as T[],
            ...channels,
            x: X,
            y: Y
        };
    }
    return { data: data, ...channels };
}

/**
 * wraps raw values into data records with index tracking, without
 * assigning them to a specific positional channel
 */
export function recordize<T>({ data, ...channels }: TransformArgsRow<T>): TransformArgsRecord<T> {
    if (!data) return { data, ...channels };
    if (!isDataRecord(data[0])) {
        return {
            data: (data as T[]).map((d, i) => ({
                [RAW_VALUE]: d,
                [INDEX]: i
            })) as T[],
            ...channels
        };
    }
    return { data: indexData(data as object[]), ...channels };
}
