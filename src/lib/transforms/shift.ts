import { resolveChannel } from '../helpers/resolve.js';
import { maybeTimeInterval } from '../helpers/time.js';
import type { DataRecord, TransformArg } from '../types/index.js';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

/** per-channel shift amounts for x channels; values can be numbers or time interval strings (e.g. "1 month") */
type ShiftXOptions = {
    [key in 'x' | 'x1' | 'x2']: string | number;
};

/**
 * shifts the x channel values by a fixed amount or time interval
 */
export function shiftX(
    { data, ...channels }: TransformArg<DataRecord>,
    shiftBy: string | number | RequireAtLeastOne<ShiftXOptions>
): TransformArg<DataRecord> {
    if (typeof shiftBy === 'number' || typeof shiftBy === 'string') {
        shiftBy = { x: shiftBy };
    }
    if (shiftBy) {
        return shiftChannels('x', shiftBy as Record<string, string | number>, {
            data,
            ...channels
        });
    }
    return { data, ...channels };
}

/** per-channel shift amounts for y channels; values can be numbers or time interval strings (e.g. "1 month") */
type ShiftYOptions = {
    [key in 'y' | 'y1' | 'y2']: string | number;
};

/**
 * shifts the y channel values by a fixed amount or time interval
 */
export function shiftY(
    { data, ...channels }: TransformArg<DataRecord>,
    shiftBy: string | number | RequireAtLeastOne<ShiftYOptions>
): TransformArg<DataRecord> {
    if (typeof shiftBy === 'number' || typeof shiftBy === 'string') {
        shiftBy = { y: shiftBy };
    }
    if (shiftBy)
        return shiftChannels('y', shiftBy as Record<string, string | number>, {
            data,
            ...channels
        });
    return { data, ...channels };
}

function shiftChannels(
    shiftDim: 'x' | 'y',
    shiftBy: Record<string, string | number>,
    { data, ...channels }: TransformArg<DataRecord>
) {
    return {
        data: data.map((d: DataRecord) => {
            const newRow: DataRecord = { ...d };
            for (const [channel, shift] of Object.entries(shiftBy)) {
                const shiftFrom = (channels[channel] != null ? channel : shiftDim) as
                    | 'x'
                    | 'y'
                    | 'x1'
                    | 'y1'
                    | 'x2'
                    | 'y2';
                if (typeof shift === 'number') {
                    newRow[`__shift_${channel}`] =
                        (resolveChannel(shiftFrom, d, channels) as number) + shift;
                } else if (typeof shift === 'string') {
                    const match = shift.match(/^([+-])?(\d+)? ?([a-z]+)$/);
                    if (!match) throw new Error(`Invalid shift format: ${shift}`);
                    const [, sign, value, unit] = match;
                    const step = (sign === '-' ? -1 : 1) * (Number(value) || 1);
                    const interval = maybeTimeInterval(unit);
                    if (!interval) throw new Error(`Invalid shift interval: ${shift}`);
                    newRow[`__shift_${channel}`] = interval.offset(
                        resolveChannel(shiftFrom, d, channels) as Date,
                        step
                    );
                }
            }
            return newRow;
        }),
        ...channels,
        ...Object.fromEntries(Object.keys(shiftBy).map((key) => [key, `__shift_${key}`]))
    };
}
