import {
    isColorOrNull,
    isBooleanOrNull,
    isDateOrNull,
    isNumberOrNull,
    isOpacityOrNull,
    isStringOrNull,
    isSymbolOrNull
} from './typeChecks.js';
import { describe, it, expect } from 'vitest';
import { symbolAsterisk } from 'd3-shape';

describe('isColorOrNull', () => {
    it('returns true for null', () => {
        expect(isColorOrNull(null)).toBe(true);
    });

    it('returns true for "currentColor"', () => {
        expect(isColorOrNull('currentColor')).toBe(true);
        expect(isColorOrNull('currentcolor')).toBe(true);
    });

    it('returns true for valid CSS variable', () => {
        expect(isColorOrNull('var(--primary-color)')).toBe(true);
    });

    it('returns true for a CSS color-mix expression', () => {
        expect(isColorOrNull('color-mix(in srgb --primary-color #ff0000, 0.5)')).toBe(true);
    });

    it('returns true for valid color string', () => {
        expect(isColorOrNull('#ff0000')).toBe(true);
    });

    it('returns false for invalid color string', () => {
        expect(isColorOrNull('invalid-color')).toBe(false);
    });

    it('returns false for non-string values', () => {
        expect(isColorOrNull(42)).toBe(false);
        expect(isColorOrNull(true)).toBe(false);
        expect(isColorOrNull([])).toBe(false);
        expect(isColorOrNull({})).toBe(false);
    });
});

describe('isBooleanOrNull', () => {
    it('returns true for null', () => {
        expect(isBooleanOrNull(null)).toBe(true);
    });

    it('returns true for boolean value', () => {
        expect(isBooleanOrNull(true)).toBe(true);
        expect(isBooleanOrNull(false)).toBe(true);
    });

    it('returns false for non-boolean values', () => {
        expect(isBooleanOrNull(42)).toBe(false);
        expect(isBooleanOrNull('true')).toBe(false);
        expect(isBooleanOrNull([])).toBe(false);
        expect(isBooleanOrNull({})).toBe(false);
    });
});

describe('isDateOrNull', () => {
    it('returns true for null', () => {
        expect(isDateOrNull(null)).toBe(true);
    });

    it('returns true for valid date', () => {
        expect(isDateOrNull(new Date())).toBe(true);
    });

    it('returns false for non-date values', () => {
        expect(isDateOrNull(42)).toBe(false);
        expect(isDateOrNull('2022-01-01')).toBe(false);
        expect(isDateOrNull([])).toBe(false);
        expect(isDateOrNull({})).toBe(false);
    });
});

describe('isNumberOrNull', () => {
    it('returns true for null', () => {
        expect(isNumberOrNull(null)).toBe(true);
        expect(isNumberOrNull(undefined)).toBe(true);
    });

    it('returns true for finite number', () => {
        expect(isNumberOrNull(42)).toBe(true);
        expect(isNumberOrNull('42')).toBe(true);
        expect(isNumberOrNull('4e8')).toBe(true);
    });

    it('returns true for infinite number', () => {
        expect(isNumberOrNull(Infinity)).toBe(false);
    });

    it('returns false for non-number values', () => {
        expect(isNumberOrNull(true)).toBe(false);
        expect(isNumberOrNull([])).toBe(false);
        expect(isNumberOrNull({})).toBe(false);
    });
});

describe('isStringOrNull', () => {
    it('returns true for null', () => {
        expect(isStringOrNull(null)).toBe(true);
    });

    it('returns true for string value', () => {
        expect(isStringOrNull('hello')).toBe(true);
    });

    it('returns false for non-string values', () => {
        expect(isStringOrNull(42)).toBe(false);
        expect(isStringOrNull(true)).toBe(false);
        expect(isStringOrNull([])).toBe(false);
        expect(isStringOrNull({})).toBe(false);
    });
});

describe('isSymbolOrNull', () => {
    it('returns true for null', () => {
        expect(isSymbolOrNull(null)).toBe(true);
    });

    it('returns true for symbol value', () => {
        expect(isSymbolOrNull(symbolAsterisk)).toBe(true);
    });

    it('returns true for string symbol', () => {
        expect(isSymbolOrNull('circle')).toBe(true);
    });

    it('returns false for non-symbol values', () => {
        expect(isSymbolOrNull(42)).toBe(false);
        expect(isSymbolOrNull(true)).toBe(false);
        expect(isSymbolOrNull([])).toBe(false);
        expect(isSymbolOrNull({})).toBe(false);
    });
});

describe('isColorOrNull', () => {
    it('returns true for null', () => {
        expect(isColorOrNull(null)).toBe(true);
    });

    it('returns true for "currentColor"', () => {
        expect(isColorOrNull('currentColor')).toBe(true);
    });

    it('returns true for valid CSS variable', () => {
        expect(isColorOrNull('var(--primary-color)')).toBe(true);
    });

    it('returns true for valid color string', () => {
        expect(isColorOrNull('#ff0000')).toBe(true);
    });

    it('returns false for invalid color string', () => {
        expect(isColorOrNull('invalid-color')).toBe(false);
    });

    it('returns false for non-string values', () => {
        expect(isColorOrNull(42)).toBe(false);
        expect(isColorOrNull(true)).toBe(false);
        expect(isColorOrNull([])).toBe(false);
        expect(isColorOrNull({})).toBe(false);
    });
});

describe('isOpacityOrNull', () => {
    it('returns true for null', () => {
        expect(isOpacityOrNull(null)).toBe(true);
    });

    it('returns true for valid opacity value', () => {
        expect(isOpacityOrNull(0)).toBe(true);
        expect(isOpacityOrNull(0.5)).toBe(true);
        expect(isOpacityOrNull(1)).toBe(true);
    });

    it('returns false for invalid opacity value', () => {
        expect(isOpacityOrNull(-0.5)).toBe(false);
        expect(isOpacityOrNull(1.5)).toBe(false);
        expect(isOpacityOrNull('0.5')).toBe(false);
        expect(isOpacityOrNull([])).toBe(false);
        expect(isOpacityOrNull({})).toBe(false);
    });

    it('returns false for non-number values', () => {
        expect(isOpacityOrNull(true)).toBe(false);
        expect(isOpacityOrNull('0.5')).toBe(false);
        expect(isOpacityOrNull([])).toBe(false);
        expect(isOpacityOrNull({})).toBe(false);
    });
});
