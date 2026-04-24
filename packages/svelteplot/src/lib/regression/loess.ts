/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
// Adapted from science.js by Jason Davies
// License: https://github.com/jasondavies/science.js/blob/master/LICENSE
// Source: https://github.com/jasondavies/science.js/blob/master/src/stats/loess.js
// Adapted from vega-statistics by Jeffrey Heer
// License: https://github.com/vega/vega/blob/f058b099decad9db78301405dd0d2e9d8ba3d51a/LICENSE
// Source: https://github.com/vega/vega/blob/f21cb8792b4e0cbe2b1a3fd44b0f5db370dbaadb/packages/vega-statistics/src/regression/loess.js

import { median } from './utils/median.js';
import { ols } from './utils/ols.js';
import { points } from './utils/points.js';
import type { Accessor, DataPoint } from './types.js';

const maxiters = 2,
    epsilon = 1e-12;

export interface LoessRegression<T> {
    (data: T[]): DataPoint[];

    bandwidth(): number;
    bandwidth(bw: number): this;

    x(): Accessor<T>;
    x(fn: Accessor<T>): this;

    y(): Accessor<T>;
    y(fn: Accessor<T>): this;
}

export default function loess<T = DataPoint>(): LoessRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        bandwidth = 0.3;

    const loessRegression = function loessRegression(data: T[]): Array<DataPoint> {
        const [xv, yv, ux, uy] = points(
            data,
            (dd) => x(dd),
            (dd) => y(dd),
            true
        );
        const n = xv.length;
        const bw = Math.max(2, ~~(bandwidth * n)); // # of nearest neighbors
        const yhat = new Float64Array(n);
        const residuals = new Float64Array(n);
        const robustWeights = new Float64Array(n).fill(1);

        for (let iter = -1; ++iter <= maxiters; ) {
            const interval = [0, bw - 1] as [number, number];

            for (let i = 0; i < n; ++i) {
                const dx = xv[i];
                const i0 = interval[0];
                const i1 = interval[1];
                const edge = dx - xv[i0] > xv[i1] - dx ? i0 : i1;

                let W = 0,
                    X = 0,
                    Y = 0,
                    XY = 0,
                    X2 = 0;
                const denom = 1 / Math.abs(xv[edge] - dx || 1);

                for (let k = i0; k <= i1; ++k) {
                    const xk = xv[k];
                    const yk = yv[k];
                    const w = tricube(Math.abs(dx - xk) * denom) * robustWeights[k];
                    const xkw = xk * w;
                    W += w;
                    X += xkw;
                    Y += yk * w;
                    XY += yk * xkw;
                    X2 += xk * xkw;
                }

                // Linear regression fit
                const [a, b] = ols(X / W, Y / W, XY / W, X2 / W);
                yhat[i] = a + b * dx;
                residuals[i] = Math.abs(yv[i] - yhat[i]);

                updateInterval(xv, i + 1, interval);
            }

            if (iter === maxiters) {
                break;
            }

            const medianResidual = median(residuals);
            if (Math.abs(medianResidual) < epsilon) break;

            for (let i = 0, arg, w; i < n; ++i) {
                arg = residuals[i] / (6 * medianResidual);
                // Default to epsilon (rather than zero) for large deviations
                // Keeping weights tiny but non-zero prevents singularites
                robustWeights[i] = arg >= 1 ? epsilon : (w = 1 - arg * arg) * w;
            }
        }

        return output(xv, yhat, ux, uy);
    } as LoessRegression<T>;

    loessRegression.bandwidth = function (bw?: number) {
        if (!arguments.length) return bandwidth;
        bandwidth = bw!;
        return loessRegression;
    } as LoessRegression<T>['bandwidth'];

    loessRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return loessRegression;
    } as LoessRegression<T>['x'];

    loessRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return loessRegression;
    } as LoessRegression<T>['y'];

    return loessRegression;
}

// Weighting kernel for local regression
function tricube(x: number): number {
    return (x = 1 - x * x * x) * x * x;
}

// Advance sliding window interval of nearest neighbors
function updateInterval(xv: Float64Array, i: number, interval: [number, number]) {
    let val = xv[i],
        left = interval[0],
        right = interval[1] + 1;
    if (right >= xv.length) return;

    // Step right if distance to new right edge is <= distance to old left edge
    // Step when distance is equal to ensure movement over duplicate x values
    while (i > left && xv[right] - val <= val - xv[left]) {
        interval[0] = ++left;
        interval[1] = right;
        ++right;
    }
}

// Generate smoothed output points
// Average points with repeated x values
function output(
    xv: Float64Array,
    yhat: Float64Array,
    ux: number,
    uy: number
): Array<[number, number]> {
    const n = xv.length,
        out = [];

    let i = 0,
        cnt = 0,
        prev: any = [],
        v;

    for (; i < n; ++i) {
        v = xv[i] + ux;
        if (prev[0] === v) {
            // Average output values via online update
            prev[1] += (yhat[i] - prev[1]) / ++cnt;
        } else {
            // Add new output point
            cnt = 0;
            prev[1] += uy;
            prev = [v, yhat[i]];
            out.push(prev);
        }
    }
    prev[1] += uy;

    return out;
}
