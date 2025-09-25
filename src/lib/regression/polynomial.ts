/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
// Adapted from regression-js by Tom Alexander
// Source: https://github.com/Tom-Alexander/regression-js/blob/master/src/regression.js#L246
// License: https://github.com/Tom-Alexander/regression-js/blob/master/LICENSE
// ...with ideas from vega-statistics by Jeffrey Heer
// Source: https://github.com/vega/vega/blob/f21cb8792b4e0cbe2b1a3fd44b0f5db370dbaadb/packages/vega-statistics/src/regression/poly.js
// License: https://github.com/vega/vega/blob/f058b099decad9db78301405dd0d2e9d8ba3d51a/LICENSE

import { determination } from './utils/determination';
import { interpose } from './utils/interpose';
import { points, visitPoints } from './utils/points';
import linear from './linear';
import quad from './quadratic';
import type { PredictFunction, Accessor, DataPoint, Domain } from './types';

export type PolynomialOutput = [DataPoint, DataPoint] & {
    coefficients: number[];
    predict: PredictFunction;
    rSquared: number;
};

export interface PolynomialRegression<T> {
    (data: T[]): PolynomialOutput;

    domain(): Domain;
    domain(domain?: Domain): this;

    x(): Accessor<T>;
    x(x: Accessor<T>): this;

    y(): Accessor<T>;
    y(y: Accessor<T>): this;

    order(): number;
    order(order: number): this;
}

export default function polynomial<T = DataPoint>(): PolynomialRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        order = 3,
        domain: Domain;

    const polynomialRegression = function polynomialRegression(data: T[]): PolynomialOutput {
        // Shortcut for lower-order polynomials:
        if (order === 1) {
            const o = linear<T>().x(x).y(y).domain(domain)(data);
            const result = [o[0], o[1]] as PolynomialOutput;
            result.coefficients = [o.b, o.a];
            result.predict = o.predict;
            result.rSquared = o.rSquared;
            return result;
        }
        if (order === 2) {
            const o = quad<T>().x(x).y(y).domain(domain)(data);
            const result = [o[0], o[1]] as PolynomialOutput;
            result.coefficients = [o.c, o.b, o.a];
            result.predict = o.predict;
            result.rSquared = o.rSquared;
            return result;
        }

        const [xv, yv, ux, uy] = points(data, x, y);
        const n = xv.length;
        const k = order + 1;
        const lhs: number[] = [];
        const rhs: Float64Array[] = [];

        let Y = 0,
            n0 = 0,
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity;

        visitPoints(data, x, y, (dx, dy) => {
            n0++;
            Y += (dy - Y) / n0;
            if (!domain) {
                if (dx < xmin) xmin = dx;
                if (dx > xmax) xmax = dx;
            }
        });

        // Build normal equations
        for (let i = 0; i < k; i++) {
            // LHS
            let v = 0;
            for (let l = 0; l < n; l++) {
                v += Math.pow(xv[l], i) * yv[l];
            }
            lhs.push(v);

            // RHS
            const c = new Float64Array(k);
            for (let j = 0; j < k; j++) {
                let v2 = 0;
                for (let l = 0; l < n; l++) {
                    v2 += Math.pow(xv[l], i + j);
                }
                c[j] = v2;
            }
            rhs.push(c);
        }
        rhs.push(new Float64Array(lhs));

        const coef = gaussianElimination(rhs);
        const fn = (xx: number) => {
            let shifted = xx - ux;
            let val = uy + coef[0];
            for (let i = 1; i < k; i++) {
                val += coef[i] * Math.pow(shifted, i);
            }
            return val;
        };

        const out = <PolynomialOutput>interpose(xmin, xmax, fn);
        out.coefficients = uncenter(k, coef, -ux, uy);
        out.predict = fn;
        out.rSquared = determination(data, x, y, Y, fn);

        return out;
    } as PolynomialRegression<T>;

    polynomialRegression.domain = function (arr?: [number, number]) {
        if (!arguments.length) return domain;
        domain = arr;
        return polynomialRegression;
    } as PolynomialRegression<T>['domain'];

    polynomialRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return polynomialRegression;
    } as PolynomialRegression<T>['x'];

    polynomialRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return polynomialRegression;
    } as PolynomialRegression<T>['y'];

    polynomialRegression.order = function (n?: number) {
        if (!arguments.length) return order;
        order = n!;
        return polynomialRegression;
    } as PolynomialRegression<T>['order'];

    return polynomialRegression;
}

function uncenter(k: number, a: number[], x: number, y: number): number[] {
    const z = new Array<number>(k).fill(0);
    for (let i = k - 1; i >= 0; --i) {
        let v = a[i];
        z[i] += v;
        let c = 1;
        for (let j = 1; j <= i; ++j) {
            c *= (i + 1 - j) / j; // binomial coefficient
            z[i - j] += v * Math.pow(x, j) * c;
        }
    }
    // bias term
    z[0] += y;
    return z;
}

// Solve A * x = b using Gaussian elimination
function gaussianElimination(matrix: Float64Array[]): number[] {
    const n = matrix.length - 1;
    const coef = new Array<number>(n);

    for (let i = 0; i < n; i++) {
        let r = i;
        // find pivot row
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(matrix[i][j]) > Math.abs(matrix[i][r])) {
                r = j;
            }
        }
        // swap columns
        for (let k = i; k < n + 1; k++) {
            const t = matrix[k][i];
            matrix[k][i] = matrix[k][r];
            matrix[k][r] = t;
        }
        // reduce
        for (let j = i + 1; j < n; j++) {
            for (let k = n; k >= i; k--) {
                matrix[k][j] -= (matrix[k][i] * matrix[i][j]) / matrix[i][i];
            }
        }
    }

    for (let j = n - 1; j >= 0; j--) {
        let t = 0;
        for (let k = j + 1; k < n; k++) {
            t += matrix[k][j] * coef[k];
        }
        coef[j] = (matrix[n][j] - t) / matrix[j][j];
    }

    return coef;
}
