import { describe, it, expect } from 'vitest';
import { bollingerX, bollingerY } from './bollinger.js';
import type { TransformArg } from '../src/lib/types/index.js';

describe('bollinger transform', () => {
    const mockData = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
        { value: 40 },
        { value: 50 },
        { value: 60 },
        { value: 70 },
        { value: 80 },
        { value: 90 },
        { value: 100 }
    ];

    const mockArgs: TransformArg<{ value: number }> = {
        data: mockData,
        x: 'value',
        y: 'value'
    };

    it('should calculate Bollinger bands for X dimension', () => {
        const result = bollingerX(mockArgs, { n: 5, k: 2 });
        expect(result.data).toBeDefined();
        expect(result.data[0]).toHaveProperty('__lo');
        expect(result.data[0]).toHaveProperty('__avg');
        expect(result.data[0]).toHaveProperty('__hi');
    });

    it('should calculate Bollinger bands for Y dimension', () => {
        const result = bollingerY(mockArgs, { n: 5, k: 2 });
        expect(result.data).toBeDefined();
        expect(result.data[0]).toHaveProperty('__lo');
        expect(result.data[0]).toHaveProperty('__avg');
        expect(result.data[0]).toHaveProperty('__hi');
    });

    it('should handle default options', () => {
        const result = bollingerX(mockArgs);
        expect(result.data).toBeDefined();
        expect(result.data[0]).toHaveProperty('__lo');
        expect(result.data[0]).toHaveProperty('__avg');
        expect(result.data[0]).toHaveProperty('__hi');
    });
});
