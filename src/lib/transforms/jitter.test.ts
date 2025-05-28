// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { jitterX, jitterY } from './jitter.js';
import { randomLcg } from 'd3-random';

// Tests for the jitter transforms
describe('jitterX', () => {
    it('should add uniform jitter to x values with default options', () => {
        // Create a deterministic random source that returns exactly what we need
        const mockRandom = () => 1; // This will produce exactly +0.1 in range [-0.35, 0.35]

        const data = [{ x: 5 }, { x: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterX({ data, x: 'x' }, { source: mockRandom });
        // The result should add the jitter values to the original x values
        const { x } = result;
        // Check approximate values
        expect(result.data[0][x]).toBe(5.35, 2);
        expect(result.data[1][x]).toBe(10.35, 2);
    });

    it('should add uniform jitter to x values with custom width', () => {
        // Create a deterministic random source that returns exactly what we need
        const mockRandom = () => 1; // This will produce exactly +0.1 in range [-0.35, 0.35]

        const data = [{ x: 5 }, { x: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterX({ data, x: 'x' }, { width: 0.5, source: mockRandom });
        // The result should add the jitter values to the original x values
        const { x } = result;
        // Check approximate values
        expect(result.data[0][x]).toBe(5.5, 2);
        expect(result.data[1][x]).toBe(10.5, 2);
    });

    it('should add normal jitter to x values', () => {
        // We'll simplify this test by not trying to mock d3-random directly
        // Instead, we'll provide a source function that controls the output values
        const data = [{ x: 5 }, { x: 10 }];

        // Custom source function that controls the exact jitter values
        let values = [0.05, -0.1]; // The exact jitter values we want
        let index = 0;

        const mockSource = randomLcg(42);

        // @ts-ignore - Bypassing type checking for tests
        const result = jitterX(
            { data, x: 'x' },
            {
                type: 'normal',
                std: 0.2,
                // Use our custom function as the source
                // This effectively hijacks the normal distribution calculation
                source: mockSource
            }
        );

        // The result should add the jitter values to the original x values
        const { x } = result;
        expect(result.data[0][x]).toBeCloseTo(4.9318, 3);
        expect(result.data[1][x]).toBeCloseTo(9.9589, 3);
    });

    // // Note: Date jittering is not yet supported, test will be added when implemented

    it('should not modify data if x channel is not provided', () => {
        const mockRandom = () => 0.5;

        const data = [{ y: 5 }, { y: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterX({ data, y: 'y' }, { source: mockRandom });

        // The result should be the same as the input
        expect(result.data).toEqual(data);
        expect(result.y).toBe('y');
    });

    it('should parse time interval strings for width/std', () => {
        // This isn't fully implemented in the jitter.ts but mentioned in a TODO comment
        const mockRandom = () => 0.75;

        const data = [{ x: new Date(Date.UTC(2020, 0, 1)) }, { x: new Date(Date.UTC(2021, 0, 1)) }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterX({ data, x: 'x' }, { source: mockRandom, width: '1 month' });

        const { x } = result;
        expect(result.data[0][x]).toBeTypeOf('object');
        expect(result.data[0][x].getTime).toBeTypeOf('function');
        expect(result.data[0][x]).toStrictEqual(new Date(Date.UTC(2020, 0, 16)));
    });
});

describe('jitterY', () => {
    it('should add uniform jitter to x values with default options', () => {
        // Create a deterministic random source that returns exactly what we need
        const mockRandom = () => 1; // This will produce exactly +0.1 in range [-0.35, 0.35]

        const data = [{ x: 5 }, { x: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterY({ data, y: 'x' }, { source: mockRandom });
        // The result should add the jitter values to the original x values
        const { y } = result;
        // Check approximate values
        expect(result.data[0][y]).toBe(5.35, 2);
        expect(result.data[1][y]).toBe(10.35, 2);
    });

    it('should add uniform jitter to x values with custom width', () => {
        // Create a deterministic random source that returns exactly what we need
        const mockRandom = () => 1; // This will produce exactly +0.1 in range [-0.35, 0.35]

        const data = [{ x: 5 }, { x: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterY({ data, y: 'x' }, { width: 0.5, source: mockRandom });
        // The result should add the jitter values to the original x values
        const { y } = result;
        // Check approximate values
        expect(result.data[0][y]).toBe(5.5, 2);
        expect(result.data[1][y]).toBe(10.5, 2);
    });

    it('should add normal jitter to x values', () => {
        // We'll simplify this test by not trying to mock d3-random directly
        // Instead, we'll provide a source function that controls the output values
        const data = [{ x: 5 }, { x: 10 }];

        // Custom source function that controls the exact jitter values
        let values = [0.05, -0.1]; // The exact jitter values we want
        let index = 0;

        const mockSource = randomLcg(42);

        // @ts-ignore - Bypassing type checking for tests
        const result = jitterY(
            { data, y: 'x' },
            {
                type: 'normal',
                std: 0.2,
                // Use our custom function as the source
                // This effectively hijacks the normal distribution calculation
                source: mockSource
            }
        );

        // The result should add the jitter values to the original x values
        const { y } = result;
        expect(result.data[0][y]).toBeCloseTo(4.9318, 3);
        expect(result.data[1][y]).toBeCloseTo(9.9589, 3);
    });

    // // Note: Date jittering is not yet supported, test will be added when implemented

    it('should not modify data if y channel is not provided', () => {
        const mockRandom = () => 0.5;

        const data = [{ x: 5 }, { x: 10 }];
        // @ts-ignore - Bypassing type checking for tests
        const result = jitterY({ data, x: 'x' }, { source: mockRandom });

        // The result should be the same as the input
        expect(result.data).toEqual(data);
        expect(result.x).toBe('x');
    });
});
