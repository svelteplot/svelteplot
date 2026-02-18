import { describe, it, expect } from 'vitest';
import { map, mapX, mapY } from './map.js';

const data = [
    { x: 1, y: 2, z: 'A' },
    { x: 3, y: 5, z: 'A' },
    { x: 5, y: 5, z: 'B' },
    { x: 7, y: 8, z: 'B' }
];

describe('map', () => {
    it('should apply cumsum mapping to array', () => {
        const result = map({ data: [1, 2, 3, 4, 5] } as any, { x: 'cumsum' });
        expect(result.data).toEqual([{ __x: 1 }, { __x: 3 }, { __x: 6 }, { __x: 10 }, { __x: 15 }]);
        expect((result as any).x).toBe('__x');
    });

    it('should apply cumsum mapping', () => {
        const result = map({ data, x: 'x' } as any, { x: 'cumsum' });
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __x: 1 },
            { x: 3, y: 5, z: 'A', __x: 4 },
            { x: 5, y: 5, z: 'B', __x: 9 },
            { x: 7, y: 8, z: 'B', __x: 16 }
        ]);
    });

    it('should apply rank mapping', () => {
        const result = map({ data, x: 'y' } as any, { x: 'rank' });
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __x: 0 },
            { x: 3, y: 5, z: 'A', __x: 1 },
            { x: 5, y: 5, z: 'B', __x: 1 },
            { x: 7, y: 8, z: 'B', __x: 3 }
        ]);
    });

    it('should apply quantile mapping', () => {
        const result = map({ data, x: 'x' } as any, { x: 'quantile' });
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __x: 0 },
            { x: 3, y: 5, z: 'A', __x: 1 / 3 },
            { x: 5, y: 5, z: 'B', __x: 2 / 3 },
            { x: 7, y: 8, z: 'B', __x: 1 }
        ]);
    });

    it('should apply facetted cumsum mapping', () => {
        const result = map({ data, x: 'x', fx: 'z' } as any, { x: 'cumsum' });
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __x: 1 },
            { x: 3, y: 5, z: 'A', __x: 4 },
            { x: 5, y: 5, z: 'B', __x: 5 },
            { x: 7, y: 8, z: 'B', __x: 12 }
        ]);
    });
});

describe('mapX', () => {
    it('should apply cumsum mapping', () => {
        const result = mapX({ data, x: 'x' } as any, 'cumsum');
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __x: 1 },
            { x: 3, y: 5, z: 'A', __x: 4 },
            { x: 5, y: 5, z: 'B', __x: 9 },
            { x: 7, y: 8, z: 'B', __x: 16 }
        ]);
    });
});

describe('mapY', () => {
    it('should apply cumsum mapping', () => {
        const result = mapY({ data, y2: 'x' } as any, 'cumsum');
        expect(result.data).toEqual([
            { x: 1, y: 2, z: 'A', __y2: 1 },
            { x: 3, y: 5, z: 'A', __y2: 4 },
            { x: 5, y: 5, z: 'B', __y2: 9 },
            { x: 7, y: 8, z: 'B', __y2: 16 }
        ]);
        expect((result as any).y2).toBe('__y2');
    });
});
