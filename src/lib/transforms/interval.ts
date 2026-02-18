import { maybeInterval } from '../helpers/autoTicks.js';
import { resolveChannel } from '../helpers/resolve.js';
import type { PlotState, TransformArg } from '../types/index.js';

/**
 * Derives interval channels x1 and x2 from the x channel and interval channel.
 */
export function intervalX<T>(args: TransformArg<T>) {
    return interval('x', args);
}

/**
 * Derives interval channels y1 and y2 from the y channel and interval channel.
 */
export function intervalY<T>(args: TransformArg<T>) {
    return interval('y', args);
}

function interval<T>(dim: 'x' | 'y', { data, ...options }: TransformArg<T>) {
    if (
        options.interval &&
        options[dim] &&
        options[`${dim}1`] == null &&
        options[`${dim}2`] == null
    ) {
        // derive x1 and x2 from x+interval
        const interval = maybeInterval(options.interval as string | number);
        if (!interval) return { data, ...options };
        const newData = data.map((row) => {
            const val = resolveChannel(dim, row, options) as Date & number;
            return {
                ...row,
                [`__${dim}1`]: interval.floor(val),
                [`__${dim}2`]: interval.offset(interval.floor(val) as Date & number)
            };
        });
        return {
            data: newData,
            // set default inset
            [`inset${dim === 'x' ? 'Right' : 'Bottom'}`]: 1,
            ...options,
            [`${dim}1`]: `__${dim}1`,
            [`${dim}2`]: `__${dim}2`
        };
    }
    return { data, ...options };
}
