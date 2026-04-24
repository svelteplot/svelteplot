import { describe, it, expect } from 'vitest';
import { partitionNode, partitionLink } from './partition.js';

// ── Test data ──

const idData = [
    { id: 'root', parentId: null, value: 0 },
    { id: 'a', parentId: 'root', value: 10 },
    { id: 'b', parentId: 'root', value: 20 },
    { id: 'a1', parentId: 'a', value: 5 },
    { id: 'a2', parentId: 'a', value: 5 }
];

const pathData = [
    { path: '/root', value: 0 },
    { path: '/root/a', value: 10 },
    { path: '/root/b', value: 20 },
    { path: '/root/a/a1', value: 5 },
    { path: '/root/a/a2', value: 5 }
];

describe('partitionNode', () => {
    it('returns nodes with rectangular bounds (x0, y0, x1, y1)', () => {
        const result = partitionNode({ value: 'value' })({ data: idData });

        for (const node of result.data) {
            expect(typeof node.x0).toBe('number');
            expect(typeof node.y0).toBe('number');
            expect(typeof node.x1).toBe('number');
            expect(typeof node.y1).toBe('number');
            expect(Number.isFinite(node.x0)).toBe(true);
            expect(Number.isFinite(node.y1)).toBe(true);
        }
    });

    it('returns correct number of nodes', () => {
        const result = partitionNode({ value: 'value' })({ data: idData });

        expect(result.data).toHaveLength(idData.length);
    });

    it('returns x1/y1/x2/y2 string channel names', () => {
        const result = partitionNode({ value: 'value' })({ data: idData });

        expect(result.x1).toBe('x0');
        expect(result.y1).toBe('y0');
        expect(result.x2).toBe('x1');
        expect(result.y2).toBe('y1');
    });

    it('root node spans the full width', () => {
        const result = partitionNode({ value: 'value', size: [1, 1] })({ data: idData });

        const root = result.data.find((n) => n.depth === 0);
        expect(root).toBeDefined();
        expect(root!.x0).toBeCloseTo(0, 5);
        expect(root!.x1).toBeCloseTo(1, 5);
    });

    it('nodes at same depth tile without overlap', () => {
        const result = partitionNode({ value: 'value', size: [100, 100] })({ data: idData });

        const depth1 = result.data.filter((n) => n.depth === 1);
        expect(depth1.length).toBeGreaterThan(1);

        // Sort by x0 and check no overlap
        depth1.sort((a, b) => a.x0 - b.x0);
        for (let i = 1; i < depth1.length; i++) {
            expect(depth1[i].x0).toBeGreaterThanOrEqual(depth1[i - 1].x1 - 0.01);
        }
    });

    it('preserves original datum fields', () => {
        const result = partitionNode({ value: 'value' })({ data: idData });

        const aNode = result.data.find((n) => n.id === 'a');
        expect(aNode).toBeDefined();
    });

    it('adds depth, height, and value properties', () => {
        const result = partitionNode({ value: 'value' })({ data: idData });

        for (const node of result.data) {
            expect(typeof node.depth).toBe('number');
            expect(typeof node.height).toBe('number');
            expect(typeof node.value).toBe('number');
        }

        const root = result.data.find((n) => n.id === 'root');
        expect(root!.depth).toBe(0);
    });

    it('horizontal option swaps x/y coordinates', () => {
        const vertical = partitionNode({ value: 'value' })({ data: idData });
        const horizontal = partitionNode({ value: 'value', horizontal: true })({ data: idData });

        expect(vertical.data).toHaveLength(horizontal.data.length);

        for (let i = 0; i < vertical.data.length; i++) {
            expect(vertical.data[i].x0).toBeCloseTo(horizontal.data[i].y0, 10);
            expect(vertical.data[i].y0).toBeCloseTo(horizontal.data[i].x0, 10);
            expect(vertical.data[i].x1).toBeCloseTo(horizontal.data[i].y1, 10);
            expect(vertical.data[i].y1).toBeCloseTo(horizontal.data[i].x1, 10);
        }
    });

    it('path-based stratification works', () => {
        const result = partitionNode({ path: 'path', value: 'value' })({ data: pathData });

        expect(result.data).toHaveLength(pathData.length);
    });

    it('preserves extra channels in args', () => {
        const result = partitionNode({ value: 'value' })({ data: idData, fill: 'depth' });

        expect(result.fill).toBe('depth');
    });
});

describe('partitionLink', () => {
    it('returns links with x1, y1, x2, y2 string channel names', () => {
        const result = partitionLink({ value: 'value' })({ data: idData });

        expect(result.x1).toBe('x1');
        expect(result.y1).toBe('y1');
        expect(result.x2).toBe('x2');
        expect(result.y2).toBe('y2');
    });

    it('link count equals nodes - 1', () => {
        const result = partitionLink({ value: 'value' })({ data: idData });

        expect(result.data).toHaveLength(idData.length - 1);
    });

    it('each link has finite coordinates', () => {
        const result = partitionLink({ value: 'value' })({ data: idData });

        for (const link of result.data) {
            expect(Number.isFinite(link.x1)).toBe(true);
            expect(Number.isFinite(link.y1)).toBe(true);
            expect(Number.isFinite(link.x2)).toBe(true);
            expect(Number.isFinite(link.y2)).toBe(true);
        }
    });

    it('links have source and target references', () => {
        const result = partitionLink({ value: 'value' })({ data: idData });

        for (const link of result.data) {
            expect(link.source).toBeDefined();
            expect(link.target).toBeDefined();
        }

        const a1Link = result.data.find((l) => l.target.id === 'a1');
        expect(a1Link).toBeDefined();
        expect(a1Link!.source.id).toBe('a');
    });

    it('horizontal option swaps link coordinates', () => {
        const vertical = partitionLink({ value: 'value' })({ data: idData });
        const horizontal = partitionLink({ value: 'value', horizontal: true })({ data: idData });

        expect(vertical.data).toHaveLength(horizontal.data.length);
        for (let i = 0; i < vertical.data.length; i++) {
            expect(vertical.data[i].x1).toBeCloseTo(horizontal.data[i].y1, 10);
            expect(vertical.data[i].y1).toBeCloseTo(horizontal.data[i].x1, 10);
        }
    });

    it('preserves extra channels in args', () => {
        const result = partitionLink({ value: 'value' })({ data: idData, stroke: 'depth' });

        expect(result.stroke).toBe('depth');
    });
});
