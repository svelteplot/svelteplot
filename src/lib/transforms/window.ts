import { maybeInterval } from '$lib/helpers/autoTicks.js';
import { isValid } from '$lib/helpers/index.js';
import { mayberReducer, type ReducerName } from '$lib/helpers/reduce.js';
import { resolveChannel } from '$lib/helpers/resolve.js';
import type { DataRecord, ScaledChannelName, TransformArg } from '$lib/types/index.js';
import { groups as d3Groups } from 'd3-array';

type WindowOptions = {
    k: number;
    interval: string;
    anchor: 'start' | 'middle' | 'end';
    reduce: ReducerName;
    strict: boolean;
};

export function windowX(args: TransformArg<DataRecord>, options: WindowOptions) {
    return windowDim('x', args, options);
}
export function windowY(args: TransformArg<DataRecord>, options: WindowOptions) {
    return windowDim('y', args, options);
}

function windowDim(
    dim: 'x' | 'y',
    { data, ...channels }: TransformArg<DataRecord>,
    options: WindowOptions
) {
    const { anchor = 'middle', reduce = 'mean', strict = false } = options;
    let { k, interval } = options;

    interval = maybeInterval(interval, 'time');
    // we only change the data, but not the
    if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);

    const reduceFn = mayberReducer(reduce);

    // group by z, fill or stroke
    const groupBy =
        channels.z != null
            ? 'z'
            : channels.fill != null
              ? 'fill'
              : channels.stroke != null
                ? 'stroke'
                : false;

    const groups = groupBy
        ? d3Groups(data, (d) => resolveChannel(groupBy, d, channels)).map(([, v]) => v)
        : [data];

    const out = [];
    const reduceChannels = [dim, `${dim}1`, `${dim}2`].filter(
        (d) => channels[d] != null
    ) as ScaledChannelName[];
    const shift = anchor === 'start' ? 0 : anchor === 'end' ? k - 1 : (k - 1) >> 1;
    for (const values of groups) {
        // resolve all "x" values
        const X = values.map((d) =>
            Object.fromEntries(
                reduceChannels.map((channel) => [channel, resolveChannel(channel, d, channels)])
            )
        );
        const Y = interval
            ? values.map((d, index) => ({
                  index,
                  value: resolveChannel(dim === 'x' ? 'y' : 'x', d, channels)
              }))
            : [];
        const L = values.length;
        for (let i = 0; i < L; i++) {
            const s0 = Math.max(0, i - shift);
            const newDatum = { ...values[i] };
            let yWindow: Set<number> = new Set();
            if (interval) {
                const minDate = interval.offset(Y[i].value, -shift);
                const maxDate = interval.offset(Y[i].value, -shift + k);
                yWindow = new Set(
                    Y.filter(({ value }) => value >= minDate && value <= maxDate).map(
                        ({ index }) => index
                    )
                );
            }
            for (const channel of reduceChannels) {
                const window = (
                    interval
                        ? // we select X values based on the interval
                          X.filter((d, i) => yWindow.has(i))
                        : X.slice(s0, Math.min(L, i - shift + k))
                )
                    .map((d) => d[channel])
                    .filter(isValid);
                const reduced =
                    strict && window.length < (strict === true ? k : strict)
                        ? null
                        : reduceFn(window);
                newDatum[`__reduced_${channel}__`] = reduced;
            }
            out.push(newDatum);
        }
    }
    return {
        data: out,
        ...channels,
        ...Object.fromEntries(reduceChannels.map((channel) => [channel, `__reduced_${channel}__`]))
    };
}
