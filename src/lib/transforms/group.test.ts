import { describe, it, expect } from 'vitest';
import { group, groupX, groupY, groupZ } from './group.js';
import type { DataRecord } from '$lib/types/index.js';
import { csvParse } from 'd3-dsv';
import { readFileSync } from 'fs';
import { ORIGINAL_NAME_KEYS } from 'svelteplot/constants.js';

const inputData: DataRecord[] = [
    { year: 2000, facet: 'A', value: 10 },
    { year: 2000, facet: 'A', value: 20 },
    { year: 2001, facet: 'B', value: 15 },
    { year: 2001, facet: 'B', value: 25 },
    { year: 2002, facet: 'A', value: 10 },
    { year: 2002, facet: 'B', value: 20 },
    { year: 2002, facet: 'B', value: 30 }
];

describe('groupX', () => {
    it('groups by x channel', () => {
        const { data, ...channels } = groupX({ data: inputData, x: 'year' });
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(channels).toStrictEqual({ x: 'year' });
    });

    it('groups by x channel with prop name', () => {
        const { data, ...channels } = groupX({ data: inputData, x: 'year' }, { xPropName: 'YR' });
        expect(data).toHaveLength(3);
        expect(data[0].YR).toBe(2000);
        expect(data[1].YR).toBe(2001);
        expect(data[2].YR).toBe(2002);
        expect(channels).toStrictEqual({ x: 'YR' });
    });

    it('groups by x channel and facets', () => {
        const { data, ...channels } = groupX({ data: inputData, x: 'year', fx: 'facet' });
        expect(data).toHaveLength(4);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(data[3].year).toBe(2002);
        expect(channels).toStrictEqual({ x: 'year', fx: 'facet' });
    });

    it('groups by x channel', () => {
        const { data, ...channels } = groupX({ data: inputData, x: 'year' });
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(channels).toStrictEqual({ x: 'year' });
    });

    it('throws error if there is no x channel', () => {
        expect(() => groupX({ data: inputData })).toThrowError(
            'you must provide a channel to group on x'
        );
    });

    it('groups by x channel accessor', () => {
        const { data, ...channels } = groupX({ data: inputData, x: (d) => d.year });
        expect(data).toHaveLength(3);
        expect(data[0].__x).toBe(2000);
        expect(data[1].__x).toBe(2001);
        expect(data[2].__x).toBe(2002);
        expect(channels).toStrictEqual({ x: '__x' });
    });

    it('groups by x channel and reduces count as y channel', () => {
        const { data, ...channels } = groupX(
            { data: inputData, x: 'year', y1: 'value' },
            { y: 'count', y1: 'sum' }
        );
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(data[0].__y).toBe(2);
        expect(data[1].__y).toBe(2);
        expect(data[2].__y).toBe(3);
        expect(data[0].__y1).toBe(30);
        expect(data[1].__y1).toBe(40);
        expect(data[2].__y1).toBe(60);
        expect(channels).toStrictEqual({
            x: 'year',
            y: '__y',
            y1: '__y1',
            [ORIGINAL_NAME_KEYS.y]: 'Frequency',
            [ORIGINAL_NAME_KEYS.y1]: 'Sum ( value )'
        });
    });

    it('copies attributes into groups', () => {
        const { data, ...channels } = groupX({ data: inputData, x: 'year' }, { copy: ['facet'] });
        expect(data).toHaveLength(3);
        expect(data[0].facet).toBe('A');
        expect(data[1].facet).toBe('B');
        expect(data[2].facet).toBe('A');
        expect(channels).toStrictEqual({ x: 'year' });
    });
});

describe('groupY', () => {
    it('groups by y channel', () => {
        const { data, ...channels } = groupY({ data: inputData, y: 'year' });
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(channels).toStrictEqual({ y: 'year' });
    });

    it('throws error if there is no y channel', () => {
        expect(() => groupY({ data: inputData })).toThrowError(
            'you must provide a channel to group on y'
        );
    });

    it('groups by y channel and reduces count as x channel', () => {
        const { data, ...channels } = groupY(
            { data: inputData, y: 'year', x1: 'value' },
            { x: 'count', x1: 'sum' }
        );
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(data[0].__x).toBe(2);
        expect(data[1].__x).toBe(2);
        expect(data[2].__x).toBe(3);
        expect(data[0].__x1).toBe(30);
        expect(data[1].__x1).toBe(40);
        expect(data[2].__x1).toBe(60);
        expect(channels).toStrictEqual({
            y: 'year',
            x: '__x',
            x1: '__x1',
            [ORIGINAL_NAME_KEYS.x]: 'Frequency',
            [ORIGINAL_NAME_KEYS.x1]: 'Sum ( value )'
        });
    });
});

describe('groupZ', () => {
    it('groups by z channel', () => {
        const { data, ...channels } = groupZ({ data: inputData, z: 'year' });
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(channels).toStrictEqual({ z: 'year' });
    });

    it('groups by fill channel if no z is present', () => {
        const { data, ...channels } = groupZ(
            { data: inputData, fill: 'year', opacity: 'value' },
            { opacity: 'count' }
        );
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(data[0].__opacity).toBe(2);
        expect(data[1].__opacity).toBe(2);
        expect(data[2].__opacity).toBe(3);
        expect(channels).toStrictEqual({ fill: 'year', opacity: '__opacity' });
    });

    it('groups by fx channel if no z is present', () => {
        const { data, ...channels } = groupZ(
            { data: inputData, fx: 'facet', opacity: 'value' },
            { opacity: 'count' }
        );
        expect(data).toHaveLength(2);
        expect(data[0].facet).toBe('A');
        expect(data[1].facet).toBe('B');
        expect(data[0].__opacity).toBe(3);
        expect(data[1].__opacity).toBe(4);
        expect(channels).toStrictEqual({ fx: 'facet', opacity: '__opacity' });
    });

    it('groups by fy channel if no z is present', () => {
        const { data, ...channels } = groupZ(
            { data: inputData, fy: 'facet', opacity: 'value' },
            { opacity: 'count' }
        );
        expect(data).toHaveLength(2);
        expect(data[0].facet).toBe('A');
        expect(data[1].facet).toBe('B');
        expect(data[0].__opacity).toBe(3);
        expect(data[1].__opacity).toBe(4);
        expect(channels).toStrictEqual({ fy: 'facet', opacity: '__opacity' });
    });

    it('groups by z channel accessor', () => {
        const { data, ...channels } = groupZ({ data: inputData, z: (d) => d.year });
        expect(data).toHaveLength(3);
        expect(data[0].__group_z).toBe(2000);
        expect(data[1].__group_z).toBe(2001);
        expect(data[2].__group_z).toBe(2002);
        expect(channels).toStrictEqual({ z: '__group_z' });
    });

    it('groups by z channel and reduces count as x channel', () => {
        const { data, ...channels } = groupZ(
            { data: inputData, z: 'year', y: 'value' },
            { x: 'count', y: 'sum' }
        );
        expect(data).toHaveLength(3);
        expect(data[0].year).toBe(2000);
        expect(data[1].year).toBe(2001);
        expect(data[2].year).toBe(2002);
        expect(data[0].__x).toBe(2);
        expect(data[1].__x).toBe(2);
        expect(data[2].__x).toBe(3);
        expect(data[0].__y).toBe(30);
        expect(data[1].__y).toBe(40);
        expect(data[2].__y).toBe(60);
        expect(channels).toStrictEqual({
            z: 'year',
            x: '__x',
            y: '__y',
            [ORIGINAL_NAME_KEYS.x]: 'Frequency',
            [ORIGINAL_NAME_KEYS.y]: 'Sum ( value )'
        });
    });
});

const penguins: DataRecord[] = csvParse(readFileSync('./static/data/penguins.csv', 'utf-8'));

describe('group', () => {
    it('groups by x and y', () => {
        const { data, ...channels } = group(
            { data: penguins, x: 'island', y: 'species' },
            { r: 'count' }
        );
        expect(channels).toStrictEqual({ x: 'island', y: 'species', r: '__r' });
        expect(data).toStrictEqual([
            { island: 'Torgersen', species: 'Adelie', __r: 52 },
            { island: 'Biscoe', species: 'Adelie', __r: 44 },
            { island: 'Biscoe', species: 'Gentoo', __r: 124 },
            { island: 'Dream', species: 'Adelie', __r: 56 },
            { island: 'Dream', species: 'Chinstrap', __r: 68 }
        ]);
    });

    it('throws error if there is no x channel', () => {
        expect(() => group({ data: penguins })).toThrowError(
            'you must provide an x and y channel to group on'
        );
    });
});
