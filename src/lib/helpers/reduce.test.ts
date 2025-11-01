import { describe, it, expect } from 'vitest';
import { reduceOutputs, type ReducerName } from './reduce.js';
import type { ChannelAccessor, ChannelName } from '$lib/types/index.js';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

describe('reduceOutputs', () => {
    it('should correctly reduce outputs', () => {
        const newDatum = {};
        const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
        const options: Record<ChannelName, ReducerName> = {
            y: 'sum',
            y1: 'mean',
            y2: 'max'
        };
        const outputs: ChannelName[] = ['y', 'y1', 'y2'];
        const channels: Record<ChannelName, ChannelAccessor> = {
            y: 'value',
            y1: 'value',
            y2: 'value'
        };
        const newChannels: Partial<Record<ChannelName, ChannelAccessor>> = {};

        reduceOutputs(newDatum, data, options, outputs, channels, newChannels);

        expect(newDatum.__y).toBe(60);
        expect(newDatum.__y1).toBe(20);
        expect(newDatum.__y2).toBe(30);
        expect(newChannels.y).toBe('__y');
        expect(newChannels[ORIGINAL_NAME_KEYS.y]).toBe('Sum ( value )');
        expect(newChannels[ORIGINAL_NAME_KEYS.y1]).toBe('Average ( value )');
        expect(newChannels[ORIGINAL_NAME_KEYS.y2]).toBe('Max ( value )');
    });
});
