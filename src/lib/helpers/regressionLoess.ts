import type { DataRow } from '$lib/types/index.js';
import Loess from 'loess';

type AccessorFn = (d: any) => number;

function toNumber(d: number | Date): number {
    if (typeof d.getTime === 'function') return (d as Date).getTime();
    return d;
}

export default function () {
    let accessX: AccessorFn = (d) => d[0];
    let accessY: AccessorFn = (d) => d[1];
    let span = 0.75;

    // const degree = 2;

    const fn = (data: DataRow[]) => {
        const filteredData = data
            .map((d) => ({
                x: toNumber(accessX(d)),
                y: accessY(d)
            }))
            .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));
        // .sort((a,b) => a.x - b.x);

        // compute loess regression for data
        const model = new Loess(
            {
                x: filteredData.map((d) => d.x),
                y: filteredData.map((d) => d.y)
            },
            { span: Math.max(0.1, span), iterations: 2 }
        );
        // return;
        return {
            predict(x: number) {
                const fit = model.predict({ x: [toNumber(x)] });
                return fit.fitted[0];
            },
            predictMany(x: number[]) {
                const fit = model.predict({ x: x.map(toNumber) });
                return fit.fitted;
            }
        };
    };

    fn.x = (_: AccessorFn) => {
        accessX = _;
    };
    fn.y = (_: AccessorFn) => {
        accessY = _;
    };
    fn.span = (_: number) => {
        span = _;
    };

    return fn;
}
