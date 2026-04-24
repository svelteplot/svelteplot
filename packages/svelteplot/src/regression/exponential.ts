/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
import { determination } from './utils/determination.js';
import { interpose } from './utils/interpose.js';
import { ols } from './utils/ols.js';
import { visitPoints } from './utils/points.js';
import type { PredictFunction, Domain, DataPoint, Accessor } from './types.js';

export type ExponentialOutput = [DataPoint, DataPoint] & {
    a: number; // slope
    b: number; // intercept
    predict: PredictFunction;
    rSquared: number;
};

export interface ExponentialRegression<T> {
    (data: T[]): ExponentialOutput;

    domain(): Domain;
    domain(arr: Domain): this;

    x(): Accessor<T>;
    x(fn: Accessor<T>): this;

    y(): Accessor<T>;
    y(fn: Accessor<T>): this;
}

export default function exponential<T = DataPoint>(): ExponentialRegression<T> {
    let y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        domain: Domain;

    const exponentialRegression = function (data: T[]): ExponentialOutput {
        let n = 0,
            Y = 0,
            YL = 0,
            XY = 0,
            XYL = 0,
            X2Y = 0,
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity;

        visitPoints(data, x, y, (dx, dy) => {
            const ly = Math.log(dy),
                xy = dx * dy;
            ++n;
            Y += (dy - Y) / n;
            XY += (xy - XY) / n;
            X2Y += (dx * xy - X2Y) / n;
            YL += (dy * ly - YL) / n;
            XYL += (xy * ly - XYL) / n;

            if (!domain) {
                if (dx < xmin) xmin = dx;
                if (dx > xmax) xmax = dx;
            }
        });

        let [a, b] = ols(XY / Y, YL / Y, XYL / Y, X2Y / Y);
        a = Math.exp(a);

        const fn = (xx: number) => a * Math.exp(b * xx);
        const out = <ExponentialOutput>interpose(xmin, xmax, fn);

        out.a = a;
        out.b = b;
        out.predict = fn;
        out.rSquared = determination(data, x, y, Y, fn);

        return out;
    } as ExponentialRegression<T>;

    exponentialRegression.domain = function (arr) {
        if (!arguments.length) return domain;
        domain = arr;
        return exponentialRegression;
    } as ExponentialRegression<T>['domain'];

    exponentialRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return exponentialRegression;
    } as ExponentialRegression<T>['x'];

    exponentialRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return exponentialRegression;
    } as ExponentialRegression<T>['y'];

    return exponentialRegression;
}
