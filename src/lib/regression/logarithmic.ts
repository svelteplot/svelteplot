/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
import { determination } from './utils/determination.js';
import { interpose } from './utils/interpose.js';
import { ols } from './utils/ols.js';
import { visitPoints } from './utils/points.js';
import type { PredictFunction, DataPoint, Accessor, Domain } from './types.js';

type LogarithmicOutput = [DataPoint, DataPoint] & {
    a: number; // slope
    b: number; // intercept
    predict: PredictFunction;
    rSquared: number;
};

export interface LogarithmicRegression<T> {
    (data: T[]): LogarithmicOutput;

    domain(): Domain;
    domain(arr: Domain): this;

    x(): Accessor<T>;
    x(fn: Accessor<T>): this;

    y(): Accessor<T>;
    y(fn: Accessor<T>): this;

    base(): number;
    base(b: number): this;
}

export default function logarithmic<T = DataPoint>(): LogarithmicRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        base: number = Math.E,
        domain: Domain;

    const logarithmicRegression = function (data: T[]): LogarithmicOutput {
        let n = 0,
            X = 0,
            Y = 0,
            XY = 0,
            X2 = 0,
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity,
            lb = Math.log(base);

        visitPoints(data, x, y, (dx, dy) => {
            const lx = Math.log(dx) / lb;
            ++n;
            X += (lx - X) / n;
            Y += (dy - Y) / n;
            XY += (lx * dy - XY) / n;
            X2 += (lx * lx - X2) / n;

            if (!domain) {
                if (dx < xmin) xmin = dx;
                if (dx > xmax) xmax = dx;
            }
        });

        const [intercept, slope] = ols(X, Y, XY, X2);
        const fn = (xx: number) => (slope * Math.log(xx)) / lb + intercept;
        const out = interpose(xmin, xmax, fn) as LogarithmicOutput;

        out.a = slope;
        out.b = intercept;
        out.predict = fn;
        out.rSquared = determination(data, x, y, Y, fn);

        return out;
    } as LogarithmicRegression<T>;

    logarithmicRegression.domain = function (arr?: [number, number]) {
        if (!arguments.length) return domain;
        domain = arr;
        return logarithmicRegression;
    } as LogarithmicRegression<T>['domain'];

    logarithmicRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return logarithmicRegression;
    } as LogarithmicRegression<T>['x'];

    logarithmicRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return logarithmicRegression;
    } as LogarithmicRegression<T>['y'];

    logarithmicRegression.base = function (b?: number) {
        if (!arguments.length) return base;
        base = b!;
        return logarithmicRegression;
    } as LogarithmicRegression<T>['base'];

    return logarithmicRegression;
}
