import { describe, it, expect } from 'vitest';
import { RENAME, renameChannels } from './rename.js';
import type { DataRecord } from '../types/index.js';
import type { ScaledChannelName } from '../types/channel.js';

const inputData: DataRecord[] = [
    { year: 2000, facet: 'A', value: 10 },
    { year: 2000, facet: 'A', value: 20 },
    { year: 2001, facet: 'B', value: 15 },
    { year: 2001, facet: 'B', value: 25 },
    { year: 2002, facet: 'A', value: 10 },
    { year: 2002, facet: 'B', value: 20 },
    { year: 2002, facet: 'B', value: 30 }
];

describe('renameChannels', () => {
    it('renames channels', () => {
        const { data, ...channels } = renameChannels(
            { data: inputData, x: 'year' },
            { x: 'year2' as ScaledChannelName }
        );
        expect(data).toStrictEqual(inputData);
        expect(channels).toStrictEqual({ year2: 'year', [RENAME]: { year2: 'x' } });
    });

    it('does not rename channels that do not exist', () => {
        const { data, ...channels } = renameChannels({ data: inputData, x: 'year' }, {
            x2: 'year2' as ScaledChannelName
        } as Partial<Record<ScaledChannelName, ScaledChannelName>>);
        expect(data).toStrictEqual(inputData);
        expect(channels).toStrictEqual({ x: 'year' });
    });
});
