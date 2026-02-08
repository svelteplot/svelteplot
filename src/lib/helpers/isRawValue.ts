import type { RawValue } from '../types/index.js';
import { isDate } from './typeChecks.js';

export default function (value: any): value is RawValue {
    const t = typeof value;
    return (
        t === 'string' ||
        t === 'number' ||
        t === 'boolean' ||
        t === 'object' ||
        isDate(value) ||
        t === null
    );
}
