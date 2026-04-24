import { describe, it, expect } from 'vitest';
import { filter } from './filter.js';
import type { DataRecord } from '../types/index.js';

describe('filter transform', () => {
    it('should filter data based on the provided channels', () => {
        const data: DataRecord[] = [{ value: 10 }, { value: 20 }, { value: 30 }];

        const channels = {
            filter: (d: DataRecord) => (d.value as number) > 15
        };

        const result = filter<DataRecord>({ data, ...channels });

        expect(result.data).toEqual([{ value: 20 }, { value: 30 }]);
    });

    it('should return an empty array if no data matches the filter', () => {
        const data: DataRecord[] = [{ value: 10 }, { value: 20 }, { value: 30 }];

        const channels = {
            filter: (d: DataRecord) => (d.value as number) > 50
        };

        const result = filter<DataRecord>({ data, ...channels });

        expect(result.data).toEqual([]);
    });

    it('should return the original data if no filter is provided', () => {
        const data: DataRecord[] = [{ value: 10 }, { value: 20 }, { value: 30 }];

        const channels = {};

        const result = filter<DataRecord>({ data, ...channels });

        expect(result.data).toEqual(data);
    });
});
