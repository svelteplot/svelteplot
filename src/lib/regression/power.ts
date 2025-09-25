/**
 * Adapted from https://github.com/HarryStevens/d3-regression
 */
import { determination } from './utils/determination.js';
import { interpose } from './utils/interpose.js';
import { ols } from './utils/ols.js';
import { visitPoints } from './utils/points.js';
import type { PredictFunction, DataPoint, Accessor, Domain } from './types.js';

export type PowerOutput = [DataPoint, DataPoint] & {
    a: number;
    b: number;
    predict: PredictFunction;
    rSquared: number;
};

interface PowerRegression<T> {
    (data: T[]): PowerOutput;

    domain(): Domain;
    domain(domain?: Domain): this;

    x(): Accessor<T>;
    x(x: Accessor<T>): this;

    y(): Accessor<T>;
    y(y: Accessor<T>): this;
}

export default function power<T = DataPoint>(): PowerRegression<T> {
    let x: Accessor<T> = (d: T) => (d as DataPoint)[0],
        y: Accessor<T> = (d: T) => (d as DataPoint)[1],
        domain: Domain;

    const powerRegression = function powerRegression(data: T[]): PowerOutput {
        let n = 0,
            X = 0,
            Y = 0,
            XY = 0,
            X2 = 0,
            YS = 0,
            xmin = domain ? +domain[0] : Infinity,
            xmax = domain ? +domain[1] : -Infinity;

        visitPoints(data, x, y, (dx, dy) => {
            const lx = Math.log(dx),
                ly = Math.log(dy);
            ++n;
            X += (lx - X) / n;
            Y += (ly - Y) / n;
            XY += (lx * ly - XY) / n;
            X2 += (lx * lx - X2) / n;
            YS += (dy - YS) / n;

            if (!domain) {
                if (dx < xmin) xmin = dx;
                if (dx > xmax) xmax = dx;
            }
        });

        let [a, b] = ols(X, Y, XY, X2);
        a = Math.exp(a);

        const fn = (xx: number) => a * Math.pow(xx, b);
        const out = interpose(xmin, xmax, fn) as PowerOutput;

        out.a = a;
        out.b = b;
        out.predict = fn;
        out.rSquared = determination(data, x, y, YS, fn);

        return out;
    } as PowerRegression<T>;

    powerRegression.domain = function (arr?: Domain) {
        if (!arguments.length) return domain;
        domain = arr;
        return powerRegression;
    } as PowerRegression<T>['domain'];

    powerRegression.x = function (fn?: Accessor<T>) {
        if (!arguments.length) return x;
        x = fn!;
        return powerRegression;
    } as PowerRegression<T>['x'];

    powerRegression.y = function (fn?: Accessor<T>) {
        if (!arguments.length) return y;
        y = fn!;
        return powerRegression;
    } as PowerRegression<T>['y'];

    return powerRegression;
}
