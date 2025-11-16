import { describe, it, expect } from 'vitest';
import { shiftX, shiftY } from './shift.js';
import type { DataRecord } from '$lib/types/index.js';

describe('shiftX', () => {
    it('should shift the x values by a number', () => {
        const data: DataRecord[] = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
        ];
        const shiftBy = 2;

        const result = shiftX({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: 2, __shift_x: 3 },
            { x: 3, y: 4, __shift_x: 5 },
            { x: 5, y: 6, __shift_x: 7 }
        ]);
        expect(result.x).toBe('__shift_x');
    });

    it('should shift explicit channels', () => {
        const data: DataRecord[] = [
            { x: 1, y: 2, x2: 10 },
            { x: 5, y: 6, x2: 14 }
        ];
        const shiftBy = { x: 2, x1: 4, x2: -2 };

        const result = shiftX(
            {
                data,
                x: 'x',
                y: 'y',
                x2: 'x2'
            },
            shiftBy
        );

        expect(result.data).toEqual([
            { x: 1, y: 2, x2: 10, __shift_x: 3, __shift_x1: 5, __shift_x2: 8 },
            { x: 5, y: 6, x2: 14, __shift_x: 7, __shift_x1: 9, __shift_x2: 12 }
        ]);
        expect(result.x).toBe('__shift_x');
        expect(result.x1).toBe('__shift_x1');
        expect(result.x2).toBe('__shift_x2');
    });

    it('should shift the x values by a negative number', () => {
        const data = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
        ];
        const shiftBy = -1;

        const result = shiftX({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: 2, __shift_x: 0 },
            { x: 3, y: 4, __shift_x: 2 },
            { x: 5, y: 6, __shift_x: 4 }
        ]);
        expect(result.x).toBe('__shift_x');
    });

    it('shift the x values by a time interval', () => {
        const data = [
            { x: new Date('2021-01-01'), y: 2 },
            { x: new Date('2021-01-02'), y: 4 },
            { x: new Date('2021-01-03'), y: 6 }
        ];
        const shiftBy = 'day';

        const result = shiftX({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: new Date('2021-01-01'), y: 2, __shift_x: new Date('2021-01-02') },
            { x: new Date('2021-01-02'), y: 4, __shift_x: new Date('2021-01-03') },
            { x: new Date('2021-01-03'), y: 6, __shift_x: new Date('2021-01-04') }
        ]);
        expect(result.x).toBe('__shift_x');
    });

    it('shift the x values by 3 days', () => {
        const data = [
            { x: new Date('2021-01-01'), y: 2 },
            { x: new Date('2021-01-02'), y: 4 },
            { x: new Date('2021-01-03'), y: 6 }
        ];
        const shiftBy = '3 days';

        const result = shiftX({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: new Date('2021-01-01'), y: 2, __shift_x: new Date('2021-01-04') },
            { x: new Date('2021-01-02'), y: 4, __shift_x: new Date('2021-01-05') },
            { x: new Date('2021-01-03'), y: 6, __shift_x: new Date('2021-01-06') }
        ]);
        expect(result.x).toBe('__shift_x');
    });

    it('should shift the x values by a negative time interval', () => {
        const data = [
            { x: new Date('2021-01-01'), y: 2 },
            { x: new Date('2021-01-02'), y: 4 },
            { x: new Date('2021-01-03'), y: 6 }
        ];
        const shiftBy = '-3 weeks';

        const result = shiftX({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: new Date('2021-01-01'), y: 2, __shift_x: new Date('2020-12-11') },
            { x: new Date('2021-01-02'), y: 4, __shift_x: new Date('2020-12-12') },
            { x: new Date('2021-01-03'), y: 6, __shift_x: new Date('2020-12-13') }
        ]);
        expect(result.x).toBe('__shift_x');
    });

    it('should throw an error for an invalid shift interval', () => {
        const data = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
        ];
        const channels = { x: 'x', y: 'y' };
        const shiftBy = 'invalid';

        expect(() => shiftX({ data, ...channels }, shiftBy)).toThrowError(
            'unknown interval: invalid'
        );
    });
});

describe('shiftY', () => {
    it('should shift the y values by a number', () => {
        const data = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
        ];
        const shiftBy = 2;

        const result = shiftY({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: 2, __shift_y: 4 },
            { x: 3, y: 4, __shift_y: 6 },
            { x: 5, y: 6, __shift_y: 8 }
        ]);
        expect(result.y).toBe('__shift_y');
    });

    it('should shift the y values by a negative number', () => {
        const data = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
        ];
        const shiftBy = -1;

        const result = shiftY({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: 2, __shift_y: 1 },
            { x: 3, y: 4, __shift_y: 3 },
            { x: 5, y: 6, __shift_y: 5 }
        ]);
        expect(result.y).toBe('__shift_y');
    });

    it('shift the y values by a time interval', () => {
        const data = [
            { x: 1, y: new Date('2021-01-01') },
            { x: 3, y: new Date('2021-01-02') },
            { x: 5, y: new Date('2021-01-03') }
        ];
        const shiftBy = 'day';

        const result = shiftY({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: new Date('2021-01-01'), __shift_y: new Date('2021-01-02') },
            { x: 3, y: new Date('2021-01-02'), __shift_y: new Date('2021-01-03') },
            { x: 5, y: new Date('2021-01-03'), __shift_y: new Date('2021-01-04') }
        ]);
        expect(result.y).toBe('__shift_y');
    });

    it('shift the y values by 3 days', () => {
        const data = [
            { x: 1, y: new Date('2021-01-01') },
            { x: 3, y: new Date('2021-01-02') },
            { x: 5, y: new Date('2021-01-03') }
        ];
        const shiftBy = '3 days';

        const result = shiftY({ data, x: 'x', y: 'y' }, shiftBy);

        expect(result.data).toEqual([
            { x: 1, y: new Date('2021-01-01'), __shift_y: new Date('2021-01-04') },
            { x: 3, y: new Date('2021-01-02'), __shift_y: new Date('2021-01-05') },
            { x: 5, y: new Date('2021-01-03'), __shift_y: new Date('2021-01-06') }
        ]);
        expect(result.y).toBe('__shift_y');
    });
});
