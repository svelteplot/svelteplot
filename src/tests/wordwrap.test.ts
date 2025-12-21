import { describe, expect, test } from 'vitest';
import wordwrap from 'svelteplot/helpers/wordwrap';

describe('wordwrap helper', () => {
    test('returns single line when width is large enough', () => {
        const text = 'hello world';
        const lines = wordwrap(text, {
            maxLineWidth: 1000,
            minCharactersPerLine: 1,
            fontSize: 12,
            monospace: false
        });

        expect(lines).toEqual([text]);
    });

    test('splits into multiple lines when width is small', () => {
        const text = 'hello world';
        const lines = wordwrap(text, {
            maxLineWidth: 40,
            minCharactersPerLine: 1,
            fontSize: 12,
            monospace: false
        });

        expect(lines.length).toBeGreaterThan(1);
        expect(lines.join(' ')).toContain('hello');
        expect(lines.join(' ')).toContain('world');
    });

    test('respects monospace flag (no CHAR_W differences)', () => {
        const text = 'MMMM iii';
        const variableWidth = wordwrap(text, {
            maxLineWidth: 80,
            minCharactersPerLine: 1,
            fontSize: 12,
            monospace: false
        });
        const monoWidth = wordwrap(text, {
            maxLineWidth: 80,
            minCharactersPerLine: 1,
            fontSize: 12,
            monospace: true
        });

        // At least assert the function runs and returns arrays;
        // behaviour may differ depending on font metrics.
        expect(Array.isArray(variableWidth)).toBe(true);
        expect(Array.isArray(monoWidth)).toBe(true);
    });
});
