import removeIdenticalLines from './removeIdenticalLines.js';
import { describe, it, expect } from 'vitest';

describe('removeIdenticalLines', () => {
    it('returns an empty array if input is empty', () => {
        expect(removeIdenticalLines([])).toEqual([]);
    });

    it('returns the same array if there are no identical lines', () => {
        const input = [
            { text: ['line 1', 'line 2', 'line 3'] },
            { text: ['line 4', 'line 5', 'line 6'] },
            { text: ['line 7', 'line 8', 'line 9'] }
        ];
        expect(removeIdenticalLines(input)).toEqual(input);
    });

    it('removes identical lines from the input array', () => {
        const input = [
            { text: ['line 1', 'line 2', 'line 3'] },
            { text: ['line 1', 'line 5', 'line 6'] },
            { text: ['line 1', 'line 8', 'line 9'] }
        ];
        const expectedOutput = [
            { text: ['line 2', 'line 3'] },
            { text: ['line 5', 'line 6'] },
            { text: ['line 8', 'line 9'] }
        ];
        expect(removeIdenticalLines(input)).toEqual(expectedOutput);
    });

    it('handles input arrays with different lengths', () => {
        const input = [
            { text: ['line 1', 'line 2', 'line 3'] },
            { text: ['line 1', 'line 5', 'line 6'] },
            { text: ['line 1', 'line 8'] }
        ];
        const expectedOutput = [
            { text: ['line 2', 'line 3'] },
            { text: ['line 5', 'line 6'] },
            { text: ['line 8'] }
        ];
        expect(removeIdenticalLines(input)).toEqual(expectedOutput);
    });
});
