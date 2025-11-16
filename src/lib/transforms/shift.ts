import { resolveChannel } from '$lib/helpers/resolve.js';
import { maybeTimeInterval } from '$lib/helpers/time.js';
import type { DataRecord, TransformArg } from '$lib/types/index.js';

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

type ShiftXOptions = {
    [key in 'x' | 'x1' | 'x2']: string | number;
};

export function shiftX(
    { data, ...channels }: TransformArg<DataRecord>,
    shiftBy: string | number | RequireAtLeastOne<ShiftXOptions>
): TransformArg<DataRecord> {
    if (typeof shiftBy === 'number' || typeof shiftBy === 'string') {
        shiftBy = { x: shiftBy };
    }
    if (shiftBy) {
        if (shiftBy) return shiftChannels('x', shiftBy, { data, ...channels });
    }
    return { data, ...channels };
}

type ShiftYOptions = {
    [key in 'y' | 'y1' | 'y2']: string | number;
};

export function shiftY(
    { data, ...channels }: TransformArg<DataRecord>,
    shiftBy: string | number | RequireAtLeastOne<ShiftYOptions>
): TransformArg<DataRecord> {
    if (typeof shiftBy === 'number' || typeof shiftBy === 'string') {
        shiftBy = { y: shiftBy };
    }
    if (shiftBy) return shiftChannels('y', shiftBy, { data, ...channels });
    return { data, ...channels };
}

function shiftChannels(
    shiftDim: 'x' | 'y',
    shiftBy: RequireAtLeastOne<ShiftYOptions | ShiftXOptions>,
    { data, ...channels }
) {
    return {
        data: data.map((d) => {
            const newRow = { ...d };
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
                    const [, sign, value, unit] = shift.match(/^([+-])?(\d+)? ?([a-z]+)$/);
                    const step = (sign === '-' ? -1 : 1) * (value || 1);
                    const interval = maybeTimeInterval(unit);
                    if (!interval) throw new Error(`Invalid shift interval: ${shift}`);
                    newRow[`__shift_${channel}`] = interval.offset(
                        resolveChannel(shiftFrom, d, channels),
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
