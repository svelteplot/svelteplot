import { visitPoints } from './points';
import type { Accessor, DataPoint, PredictFunction } from '../types';

/**
 * Given a dataset, x- and y-accessors, the mean center of the y-values (uY),
 * and a prediction function, return the coefficient of determination, R^2.
 */
export function determination<T>(
    data: T[],
    x: Accessor<T>,
    y: Accessor<T>,
    uY: number,
    predict: PredictFunction
): number {
    let SSE = 0, // Sum of Squared Errors
        SST = 0; // Total Sum of Squares

    visitPoints(data, x, y, (dx, dy) => {
        const sse = dy - predict(dx);
        const sst = dy - uY;
        SSE += sse * sse;
        SST += sst * sst;
    });

    return 1 - SSE / SST;
}
