import { maybeInterval } from '$lib/helpers/autoTicks.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type { PlotState, TransformArg } from '$lib/types/index.js';

export function intervalX<T>(args: TransformArg<T>, { plot }: { plot: PlotState }) {
    return interval('x', plot, args);
}

export function intervalY<T>(args: TransformArg<T>, { plot }: { plot: PlotState }) {
    return interval('y', plot, args);
}

function interval<T>(dim: 'x' | 'y', plot: PlotState, { data, ...options }: TransformArg<T>) {
    if (
        options.interval &&
        options[dim] &&
        options[`${dim}1`] == null &&
        options[`${dim}2`] == null
    ) {
        // derive x1 and x2 from x+interval
        const interval = maybeInterval(options.interval as string | number, plot.scales[dim].type);
        const newData = data.map((row) => {
            const val = resolveChannel(dim, row, options);
            return {
                ...row,
                [`__${dim}1`]: interval.floor(val),
                [`__${dim}2`]: interval.offset(interval.floor(val))
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
