/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
import { determination } from './utils/determination.js';
import { ols } from './utils/ols.js';
import { visitPoints } from './utils/points.js';
import type { PredictFunction, Accessor, DataPoint, Domain } from './types.js';

export type LinearOutput = [DataPoint, DataPoint] & {
    a: number; // slope
    b: number; // intercept
    predict: PredictFunction;
    rSquared: number;
};

export interface LinearRegression<T> {
    (data: T[]): LinearOutput;

    domain(): Domain;
    domain(arr: Domain): this;

    x(): Accessor<T>;
    x(fn: Accessor<T>): this;

    y(): Accessor<T>;
    y(fn: Accessor<T>): this;
}

export default function linear<T = DataPoint>(): LinearRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        domain: Domain;

    const linearRegression = function (data: T[]): LinearOutput {
        let n = 0,
            X = 0, // sum of x
            Y = 0, // sum of y
            XY = 0, // sum of x*y
            X2 = 0, // sum of x*x
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity;

        visitPoints(data, x, y, (dx, dy) => {
            ++n;
            X += (dx - X) / n;
            Y += (dy - Y) / n;
            XY += (dx * dy - XY) / n;
            X2 += (dx * dx - X2) / n;

            if (!domain) {
                if (dx < xmin) xmin = dx;
                if (dx > xmax) xmax = dx;
            }
        });

        const [intercept, slope] = ols(X, Y, XY, X2);
        const fn = (xx: number) => slope * xx + intercept;

        const out = [
            [xmin, fn(xmin)],
            [xmax, fn(xmax)]
        ] as LinearOutput;
        out.a = slope;
        out.b = intercept;
        out.predict = fn;
        out.rSquared = determination(data, x, y, Y, fn);

        return out;
    } as LinearRegression<T>;

    linearRegression.domain = function (arr) {
        if (!arguments.length) return domain;
        domain = arr;
        return linearRegression;
    } as LinearRegression<T>['domain'];

    linearRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return linearRegression;
    } as LinearRegression<T>['x'];

    linearRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return linearRegression;
    } as LinearRegression<T>['y'];

    return linearRegression;
}
