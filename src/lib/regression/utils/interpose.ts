import { angle, midpoint } from './geometry';
import type { PredictFunction, DataPoint } from '../types';

/**
 * Given a start point (xmin), an end point (xmax),
 * and a prediction function, returns a smooth line.
 */
export function interpose(
    xmin: number,
    xmax: number,
    predict: PredictFunction
): [DataPoint, DataPoint] {
    const l = (Math.log(xmax - xmin) * Math.LOG10E + 1) | 0;
    const precision = Math.pow(10, -l / 2 - 1);
    const maxIter = 1e4;
    let points: [DataPoint, DataPoint] = [px(xmin), px(xmax)];
    let iter = 0;

    while (find(points) && iter < maxIter);

    return points;

    function px(x: number): DataPoint {
        return [x, predict(x)];
    }

    function find(points: DataPoint[]): boolean {
        iter++;
        const n = points.length;
        let found = false;

        for (let i = 0; i < n - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const m = midpoint([p0, p1]);
            const mp = px(m[0]);
            const a0 = angle([p0, m]);
            const a1 = angle([p0, mp]);
            const a = Math.abs(a0 - a1);

            if (a > precision) {
                points.splice(i + 1, 0, mp);
                found = true;
            }
        }

        return found;
    }
}
