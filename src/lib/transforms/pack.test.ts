import { describe, it, expect } from 'vitest';
import { packNode } from './pack.js';

// ── Test data ──

const idData = [
    { id: 'root', parentId: null, value: 0 },
    { id: 'a', parentId: 'root', value: 10 },
    { id: 'b', parentId: 'root', value: 20 },
    { id: 'c', parentId: 'root', value: 30 }
];

const pathData = [
    { path: '/root', value: 0 },
    { path: '/root/a', value: 10 },
    { path: '/root/b', value: 20 },
    { path: '/root/a/a1', value: 5 },
    { path: '/root/a/a2', value: 5 }
];

describe('packNode', () => {
    it('returns nodes with x, y, r positions', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        for (const node of result.data) {
            expect(typeof node.x).toBe('number');
            expect(typeof node.y).toBe('number');
            expect(typeof node.r).toBe('number');
            expect(Number.isFinite(node.x)).toBe(true);
            expect(Number.isFinite(node.y)).toBe(true);
            expect(Number.isFinite(node.r)).toBe(true);
            expect(node.r).toBeGreaterThanOrEqual(0);
        }
    });

    it('returns correct number of nodes', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        expect(result.data).toHaveLength(idData.length);
    });

    it('returns x, y, r string channel names', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        expect(result.x).toBe('x');
        expect(result.y).toBe('y');
        expect(result.r).toBe('r');
    });

    it('root circle encloses all children', () => {
        const result = packNode({ value: 'value', size: [100, 100] })({ data: idData });

        const root = result.data.find((n) => n.depth === 0);
        expect(root).toBeDefined();
        expect(root!.r).toBeGreaterThan(0);

        // Every child center should be within root radius
        const children = result.data.filter((n) => n.depth === 1);
        for (const child of children) {
            const dist = Math.sqrt((child.x - root!.x) ** 2 + (child.y - root!.y) ** 2);
            expect(dist + child.r).toBeLessThanOrEqual(root!.r + 0.01);
        }
    });

    it('larger values produce larger circles', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        const leaves = result.data.filter((n) => n.height === 0);
        const aNode = leaves.find((n) => n.id === 'a')!;
        const cNode = leaves.find((n) => n.id === 'c')!;

        // c has value 30, a has value 10 → c should be larger
        expect(cNode.r).toBeGreaterThan(aNode.r);
    });

    it('preserves original datum fields', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        const aNode = result.data.find((n) => n.id === 'a');
        expect(aNode).toBeDefined();
    });

    it('adds depth and height properties', () => {
        const result = packNode({ value: 'value' })({ data: idData });

        const root = result.data.find((n) => n.id === 'root');
        expect(root!.depth).toBe(0);

        const leaves = result.data.filter((n) => n.height === 0);
        expect(leaves).toHaveLength(3);
        for (const leaf of leaves) {
            expect(leaf.height).toBe(0);
        }
    });

    it('path-based stratification works', () => {
        const result = packNode({ path: 'path', value: 'value' })({ data: pathData });

        expect(result.data).toHaveLength(pathData.length);
    });

    it('custom size option scales layout', () => {
        const r1 = packNode({ value: 'value', size: [100, 100] })({ data: idData });
        const r2 = packNode({ value: 'value', size: [200, 200] })({ data: idData });

        const root1 = r1.data.find((n) => n.depth === 0)!;
        const root2 = r2.data.find((n) => n.depth === 0)!;

        // Larger size → larger root radius
        expect(root2.r).toBeGreaterThan(root1.r);
    });

    it('preserves extra channels in args', () => {
        const result = packNode({ value: 'value' })({ data: idData, fill: 'depth' });

        expect(result.fill).toBe('depth');
    });

    it('function-based value accessor', () => {
        const data = [
            { id: 'root', parentId: null, size: 0 },
            { id: 'a', parentId: 'root', size: 15 },
            { id: 'b', parentId: 'root', size: 30 }
        ];

        const result = packNode({ value: (d: any) => d.size })({ data });

        expect(result.data).toHaveLength(3);
    });
});
