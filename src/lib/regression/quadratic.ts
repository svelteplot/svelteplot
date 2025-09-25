/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
import { determination } from './utils/determination.js';
import { interpose } from './utils/interpose.js';
import { points, visitPoints } from './utils/points.js';
import type { Accessor, DataPoint, PredictFunction, Domain } from './types.js';

export type QuadraticOutput = [DataPoint, DataPoint] & {
    a: number;
    b: number;
    c: number;
    predict: PredictFunction;
    rSquared: number;
};

interface QuadraticRegression<T> {
    (data: T[]): QuadraticOutput;

    domain(): Domain;
    domain(domain?: Domain): this;

    x(): Accessor<T>;
    x(x: Accessor<T>): this;

    y(): Accessor<T>;
    y(y: Accessor<T>): this;
}

export default function quadratic<T = DataPoint>(): QuadraticRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        domain: Domain;

    const quadraticRegression = function quadraticRegression(data: T[]): QuadraticOutput {
        const [xv, yv, ux, uy] = points(
            data,
            (dd) => x(dd),
            (dd) => y(dd)
        );
        const n = xv.length;

        let X2 = 0,
            X3 = 0,
            X4 = 0,
            XY = 0,
            X2Y = 0,
            i,
            dx,
            dy,
            x2;

        for (i = 0; i < n; ) {
            dx = xv[i];
            dy = yv[i++];
            x2 = dx * dx;
            X2 += (x2 - X2) / i;
            X3 += (x2 * dx - X3) / i;
            X4 += (x2 * x2 - X4) / i;
            XY += (dx * dy - XY) / i;
            X2Y += (x2 * dy - X2Y) / i;
        }

        let Y = 0,
            n0 = 0,
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity;

        visitPoints(data, x, y, (dx2, dy2) => {
            n0++;
            Y += (dy2 - Y) / n0;
            if (!domain) {
                if (dx2 < xmin) xmin = dx2;
                if (dx2 > xmax) xmax = dx2;
            }
        });

        const X2X2 = X4 - X2 * X2;
        const d = X2 * X2X2 - X3 * X3;
        const a = (X2Y * X2 - XY * X3) / d;
        const b = (XY * X2X2 - X2Y * X3) / d;
        const c = -a * X2;
        const fn = (xx: number) => {
            const shifted = xx - ux;
            return a * shifted * shifted + b * shifted + c + uy;
        };

        const out = interpose(xmin, xmax, fn) as QuadraticOutput;
        out.a = a;
        out.b = b - 2 * a * ux;
        out.c = c - b * ux + a * ux * ux + uy;
        out.predict = fn;
        out.rSquared = determination(data, x, y, Y, fn);

        return out;
    } as QuadraticRegression<T>;

    quadraticRegression.domain = function (arr?: Domain) {
        if (!arguments.length) return domain;
        domain = arr;
        return quadraticRegression;
    } as QuadraticRegression<T>['domain'];

    quadraticRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return quadraticRegression;
    } as QuadraticRegression<T>['x'];

    quadraticRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return quadraticRegression;
    } as QuadraticRegression<T>['y'];

    return quadraticRegression;
}
