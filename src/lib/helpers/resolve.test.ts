import { describe, it, expect } from 'vitest';
import { resolveChannel, resolveProp } from './resolve.js';
import { RAW_VALUE } from '$lib/transforms/recordize.js';

describe('resolveProp', () => {
    it('resolves string keys', () => {
        expect(resolveProp('key', { key: 42 })).toBe(42);
    });
    it('resolves default values if accessor is undefined', () => {
        expect(resolveProp(undefined, { foo: 42 })).toBe(null);
        expect(resolveProp(undefined, { foo: 42 }, 'normal')).toBe('normal');
    });
    it('resolves function keys', () => {
        expect(resolveProp((d) => d.key, { key: 42 })).toBe(42);
    });
    it('resolves numeric constants', () => {
        expect(resolveProp(42, { foo: 'bar' })).toBe(42);
    });
    it("resolves string constants that aren't props", () => {
        expect(resolveProp('bar', { foo: 42 })).toBe('bar');
    });
    it('passes original value to accessor function', () => {
        expect(resolveProp((d) => d * 2, { [RAW_VALUE]: 42 })).toBe(84);
    });
});

describe('resolveChannel', () => {
    it('resolves constant', () => {
        expect(resolveChannel('x', { foo: 42 }, { x: 123 })).toBe(123);
    });
    // it('fallback to channel name', () => {
    //     expect(resolveChannel('x', { x: 42 }, { })).toBe(42);
    // });
    it('resolves string keys', () => {
        expect(resolveChannel('x', { value: 42 }, { x: 'value' })).toBe(42);
    });
    it('resolves accessor function', () => {
        expect(resolveChannel('x', { foo: 42 }, { x: (d) => d.foo })).toBe(42);
    });
    it('alias to different channel', () => {
        expect(resolveChannel('x', { foo: 42 }, { x: { channel: 'y' }, y: 'foo' })).toBe(42);
    });
});
