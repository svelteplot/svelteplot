import { describe, it, expect } from 'vitest';
import { reduceOutputs, type ReducerName } from './reduce.js';
import type { Channels, ChannelName, DataRecord } from '../types/index.js';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

describe('reduceOutputs', () => {
    it('should correctly reduce outputs', () => {
        const newDatum: DataRecord = {};
        const data: DataRecord[] = [{ value: 10 }, { value: 20 }, { value: 30 }];
        const options = {
            y: 'sum',
            y1: 'mean',
            y2: 'max'
        } as Record<ChannelName, ReducerName>;
        const outputs: ChannelName[] = ['y', 'y1', 'y2'];
        const channels: Channels<DataRecord> = {
            y: 'value',
            y1: 'value',
            y2: 'value'
        };
        const newChannels: Channels<DataRecord> = {};

        reduceOutputs(newDatum, data, options, outputs, channels, newChannels);

        expect(newDatum['__y']).toBe(60);
        expect(newDatum['__y1']).toBe(20);
        expect(newDatum['__y2']).toBe(30);
        expect(newChannels.y).toBe('__y');
        expect(newChannels[ORIGINAL_NAME_KEYS.y]).toBe('Sum\u2009(\u2009value\u2009)');
        expect(newChannels[ORIGINAL_NAME_KEYS.y1]).toBe('Average\u2009(\u2009value\u2009)');
        expect(newChannels[ORIGINAL_NAME_KEYS.y2]).toBe('Max\u2009(\u2009value\u2009)');
    });
});
