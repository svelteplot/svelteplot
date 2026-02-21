import { describe, it, expect } from 'vitest';
import { autoScale } from './autoScales.js';

describe('autoScale', () => {
    it('applies nice to time scales without coercing domain values to numbers', () => {
        const domain = [new Date(2000, 0, 9), new Date(2002, 11, 27)];

        const fn = autoScale({
            name: 'x',
            type: 'time',
            domain,
            scaleOptions: {
                range: [0, 600],
                reverse: false,
                nice: true,
                tickSpacing: 60
            } as any,
            plotOptions: {} as any,
            plotWidth: 600,
            plotHeight: 400,
            plotHasFilledDotMarks: false,
            plotDefaults: {} as any
        });

        const nicenedDomain = fn.domain();

        expect(nicenedDomain[0]).toBeInstanceOf(Date);
        expect(nicenedDomain[1]).toBeInstanceOf(Date);
        expect((nicenedDomain[0] as Date).getTime()).toBeLessThanOrEqual(domain[0].getTime());
        expect((nicenedDomain[1] as Date).getTime()).toBeGreaterThanOrEqual(domain[1].getTime());
    });
});
