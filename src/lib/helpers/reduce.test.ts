import { describe, it, expect } from 'vitest';
import { reduceOutputs, type ReducerName } from './reduce.js';
import type { ChannelAccessor, ChannelName } from '../types/index.js';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

describe('reduceOutputs', () => {
    it('should correctly reduce outputs', () => {
        const newDatum = {};
        const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
        const options = {
            y: 'sum',
            y1: 'mean',
            y2: 'max'
        } as Record<ChannelName, ReducerName>;
        const outputs: ChannelName[] = ['y', 'y1', 'y2'];
        const channels = {
            y: 'value',
            y1: 'value',
            y2: 'value'
        } as Record<ChannelName, ChannelAccessor>;
        const newChannels: Partial<Record<ChannelName, ChannelAccessor>> = {};

        reduceOutputs(newDatum, data, options, outputs, channels, newChannels);

        expect((newDatum as any).__y).toBe(60);
        expect((newDatum as any).__y1).toBe(20);
        expect((newDatum as any).__y2).toBe(30);
        expect(newChannels.y).toBe('__y');
        expect((newChannels as any)[ORIGINAL_NAME_KEYS.y]).toBe('Sum ( value )');
        expect((newChannels as any)[ORIGINAL_NAME_KEYS.y1]).toBe('Average ( value )');
        expect((newChannels as any)[ORIGINAL_NAME_KEYS.y2]).toBe('Max ( value )');
    });
});
