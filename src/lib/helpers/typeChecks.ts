import type { RawValue } from '$lib/types/index.js';
import { isSymbol } from './symbols.js';
import { color } from 'd3-color';
import {
    CSS_COLOR,
    CSS_COLOR_MIX,
    CSS_COLOR_CONTRAST,
    CSS_VAR,
    CSS_URL,
    CSS_RGBA
} from '$lib/constants.js';

export function isBooleanOrNull(v: RawValue) {
    return v == null || typeof v === 'boolean';
}

export function isDate(v: RawValue): v is Date {
    return v instanceof Date && !isNaN(v.getTime());
}

export function isDateOrNull(v: RawValue | null | undefined) {
    return v == null || isDate(v);
}

export function isNumberOrNull(v: RawValue | null | undefined) {
    return v == null || Number.isFinite(v) || (typeof v === 'string' && !Number.isNaN(+v));
}

export function isNumberOrNullOrNaN(v: RawValue | null | undefined) {
    return (
        v == null ||
        Number.isFinite(v) ||
        Number.isNaN(v) ||
        (typeof v === 'string' && !Number.isNaN(+v))
    );
}

export function isStringOrNull(v: RawValue | null | undefined) {
    return v == null || typeof v === 'string';
}

export function isSymbolOrNull(v: RawValue | null | undefined) {
    return v == null || ((typeof v === 'string' || typeof v === 'object') && isSymbol(v));
}

export function isColorOrNull(v: RawValue | null | undefined) {
    if (v == null) return true;
    if (typeof v === 'string') {
        v = `${v}`.toLowerCase();
        return (
            v === 'currentcolor' ||
            CSS_VAR.test(v) ||
            CSS_COLOR.test(v) ||
            CSS_COLOR_MIX.test(v) ||
            CSS_COLOR_CONTRAST.test(v) ||
            CSS_RGBA.test(v) ||
            CSS_URL.test(v) ||
            color(v) !== null
        );
    }
    return false;
}

export function isOpacityOrNull(v: RawValue) {
    return v == null || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1);
}
