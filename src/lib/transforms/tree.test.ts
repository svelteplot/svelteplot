import { describe, it, expect } from 'vitest';
import { treeNode, treeLink } from './tree.js';

// ── Test data ──

const pathData = [
    { path: '/root' },
    { path: '/root/a' },
    { path: '/root/b' },
    { path: '/root/a/a1' },
    { path: '/root/a/a2' },
    { path: '/root/b/b1' }
];

const idData = [
    { id: 'root', parentId: null, label: 'Root' },
    { id: 'a', parentId: 'root', label: 'A' },
    { id: 'b', parentId: 'root', label: 'B' },
    { id: 'a1', parentId: 'a', label: 'A1' },
    { id: 'a2', parentId: 'a', label: 'A2' },
    { id: 'b1', parentId: 'b', label: 'B1' }
];

describe('treeNode', () => {
    it('returns nodes with finite x, y positions (path-based)', () => {
        const result = treeNode({ path: 'path' })({ data: pathData });

        for (const node of result.data) {
            expect(typeof node.x).toBe('number');
            expect(typeof node.y).toBe('number');
            expect(Number.isFinite(node.x)).toBe(true);
            expect(Number.isFinite(node.y)).toBe(true);
        }
    });

    it('returns correct number of nodes', () => {
        const result = treeNode({ path: 'path' })({ data: pathData });

        expect(result.data).toHaveLength(pathData.length);
    });

    it('preserves original datum fields', () => {
        const result = treeNode()({ data: idData });

        const rootNode = result.data.find((n) => n.id === 'root');
        expect(rootNode).toBeDefined();
        expect(rootNode!.label).toBe('Root');

        const aNode = result.data.find((n) => n.id === 'a');
        expect(aNode).toBeDefined();
        expect(aNode!.label).toBe('A');
    });

    it('sets x and y channel names to "x" and "y"', () => {
        const result = treeNode({ path: 'path' })({ data: pathData });

        expect(result.x).toBe('x');
        expect(result.y).toBe('y');
    });

    it('adds depth and height properties to each node', () => {
        const result = treeNode({ path: 'path' })({ data: pathData });

        for (const node of result.data) {
            expect(typeof node.depth).toBe('number');
            expect(typeof node.height).toBe('number');
            expect(Number.isFinite(node.depth)).toBe(true);
            expect(Number.isFinite(node.height)).toBe(true);
        }
    });

    it('root node has depth=0', () => {
        const result = treeNode()({ data: idData });

        const rootNode = result.data.find((n) => n.id === 'root');
        expect(rootNode).toBeDefined();
        expect(rootNode!.depth).toBe(0);
    });

    it('leaf nodes have height=0', () => {
        const result = treeNode()({ data: idData });

        const leaves = result.data.filter((n) => ['a1', 'a2', 'b1'].includes(n.id as string));
        expect(leaves).toHaveLength(3);
        for (const leaf of leaves) {
            expect(leaf.height).toBe(0);
        }
    });

    it('id/parentId stratification works', () => {
        const result = treeNode()({ data: idData });

        expect(result.data).toHaveLength(idData.length);

        // Check hierarchy structure via depth values
        const rootNode = result.data.find((n) => n.id === 'root');
        const aNode = result.data.find((n) => n.id === 'a');
        const a1Node = result.data.find((n) => n.id === 'a1');
        expect(rootNode!.depth).toBe(0);
        expect(aNode!.depth).toBe(1);
        expect(a1Node!.depth).toBe(2);
    });

    it('horizontal option swaps x/y coordinates', () => {
        const vertical = treeNode({ path: 'path' })({ data: pathData });
        const horizontal = treeNode({ path: 'path', horizontal: true })({ data: pathData });

        expect(vertical.data).toHaveLength(horizontal.data.length);

        // For each node, the vertical x should equal horizontal y and vice versa
        for (let i = 0; i < vertical.data.length; i++) {
            expect(vertical.data[i].x).toBeCloseTo(horizontal.data[i].y, 10);
            expect(vertical.data[i].y).toBeCloseTo(horizontal.data[i].x, 10);
        }
    });

    it('cluster layout positions all leaves at the same depth (y value)', () => {
        const result = treeNode({ path: 'path', layout: 'cluster' })({ data: pathData });

        // Leaf nodes (depth 2) should all share the same y value in cluster layout
        const leaves = result.data.filter((n) => n.height === 0);
        expect(leaves.length).toBeGreaterThan(1);

        const leafY = leaves[0].y;
        for (const leaf of leaves) {
            expect(leaf.y).toBeCloseTo(leafY, 10);
        }
    });
});

describe('treeLink', () => {
    it('returns links with x1, y1, x2, y2 string channel names', () => {
        const result = treeLink({ path: 'path' })({ data: pathData });

        expect(result.x1).toBe('x1');
        expect(result.y1).toBe('y1');
        expect(result.x2).toBe('x2');
        expect(result.y2).toBe('y2');
    });

    it('link count equals nodes - 1 for a proper tree', () => {
        const result = treeLink({ path: 'path' })({ data: pathData });

        // 6 nodes → 5 links
        expect(result.data).toHaveLength(pathData.length - 1);
    });

    it('each link has source and target with x, y coordinates', () => {
        const nodeResult = treeNode({ path: 'path' })({ data: pathData });
        const linkResult = treeLink({ path: 'path' })({ data: pathData });

        for (const link of linkResult.data) {
            expect(typeof link.x1).toBe('number');
            expect(typeof link.y1).toBe('number');
            expect(typeof link.x2).toBe('number');
            expect(typeof link.y2).toBe('number');
            expect(Number.isFinite(link.x1)).toBe(true);
            expect(Number.isFinite(link.y1)).toBe(true);
            expect(Number.isFinite(link.x2)).toBe(true);
            expect(Number.isFinite(link.y2)).toBe(true);

            // source and target objects should exist
            expect(link.source).toBeDefined();
            expect(link.target).toBeDefined();
        }

        // Link endpoint coordinates should match node positions
        const nodePositions = new Map(
            nodeResult.data.map((n) => [JSON.stringify({ x: n.x, y: n.y }), true])
        );
        for (const link of linkResult.data) {
            expect(nodePositions.has(JSON.stringify({ x: link.x1, y: link.y1 }))).toBe(true);
            expect(nodePositions.has(JSON.stringify({ x: link.x2, y: link.y2 }))).toBe(true);
        }
    });

    it('link source/target preserve original datum fields', () => {
        const result = treeLink()({ data: idData });

        for (const link of result.data) {
            // source and target should have label fields from original data
            expect(typeof link.source.label).toBe('string');
            expect(typeof link.target.label).toBe('string');
        }

        // Find a specific link: a1's parent is a, so there should be a link a→a1
        const a1Link = result.data.find((l) => l.target.id === 'a1');
        expect(a1Link).toBeDefined();
        expect(a1Link!.source.id).toBe('a');
        expect(a1Link!.source.label).toBe('A');
        expect(a1Link!.target.label).toBe('A1');
    });
});

describe('accessor variants', () => {
    it('function-based path accessor', () => {
        const data = [{ name: '/root' }, { name: '/root/child' }];
        const result = treeNode({ path: (d: any) => d.name })({ data });

        expect(result.data).toHaveLength(2);
        expect(result.data.find((n) => n.name === '/root')!.depth).toBe(0);
        expect(result.data.find((n) => n.name === '/root/child')!.depth).toBe(1);
    });

    it('string-based id/parentId with custom field names', () => {
        const data = [
            { key: 'root', parent: null },
            { key: 'a', parent: 'root' },
            { key: 'b', parent: 'root' }
        ];
        const result = treeNode({ id: 'key', parentId: 'parent' })({ data });

        expect(result.data).toHaveLength(3);
        expect(result.data.find((n) => n.key === 'root')!.depth).toBe(0);
        expect(result.data.find((n) => n.key === 'a')!.depth).toBe(1);
    });

    it('function-based id/parentId accessors', () => {
        const data = [
            { key: 'root', parent: null },
            { key: 'child', parent: 'root' }
        ];
        const result = treeNode({
            id: (d: any) => d.key,
            parentId: (d: any) => d.parent
        })({ data });

        expect(result.data).toHaveLength(2);
        expect(result.data.find((n) => n.key === 'root')!.depth).toBe(0);
        expect(result.data.find((n) => n.key === 'child')!.depth).toBe(1);
    });
});

describe('treeLink horizontal', () => {
    it('horizontal option swaps link x/y coordinates', () => {
        const vertical = treeLink({ path: 'path' })({ data: pathData });
        const horizontal = treeLink({ path: 'path', horizontal: true })({ data: pathData });

        expect(vertical.data).toHaveLength(horizontal.data.length);
        for (let i = 0; i < vertical.data.length; i++) {
            expect(vertical.data[i].x1).toBeCloseTo(horizontal.data[i].y1, 10);
            expect(vertical.data[i].y1).toBeCloseTo(horizontal.data[i].x1, 10);
            expect(vertical.data[i].x2).toBeCloseTo(horizontal.data[i].y2, 10);
            expect(vertical.data[i].y2).toBeCloseTo(horizontal.data[i].x2, 10);
        }
    });
});

describe('edge cases', () => {
    it('single-node tree: 1 node, 0 links', () => {
        const singleData = [{ path: '/root' }];

        const nodeResult = treeNode({ path: 'path' })({ data: singleData });
        const linkResult = treeLink({ path: 'path' })({ data: singleData });

        expect(nodeResult.data).toHaveLength(1);
        expect(linkResult.data).toHaveLength(0);

        // The single node should still have valid coordinates
        expect(Number.isFinite(nodeResult.data[0].x)).toBe(true);
        expect(Number.isFinite(nodeResult.data[0].y)).toBe(true);
        expect(nodeResult.data[0].depth).toBe(0);
        expect(nodeResult.data[0].height).toBe(0);
    });

    it('deep tree (depth=10) produces correct depth values', () => {
        // Build a chain: /a, /a/b, /a/b/c, ...
        const letters = 'abcdefghij';
        const deepData = [];
        for (let i = 0; i < letters.length; i++) {
            deepData.push({
                path:
                    '/' +
                    letters
                        .slice(0, i + 1)
                        .split('')
                        .join('/')
            });
        }

        const result = treeNode({ path: 'path' })({ data: deepData });

        expect(result.data).toHaveLength(10);

        // Depth should go from 0 to 9
        const depths = result.data.map((n) => n.depth).sort((a, b) => a - b);
        expect(depths[0]).toBe(0);
        expect(depths[depths.length - 1]).toBe(9);
    });

    it('wide tree (many siblings) positions all children', () => {
        const wideData = [
            { id: 'root', parentId: null },
            ...Array.from({ length: 20 }, (_, i) => ({ id: `child${i}`, parentId: 'root' }))
        ];

        const result = treeNode()({ data: wideData });

        expect(result.data).toHaveLength(21);

        // All children should have depth=1
        const children = result.data.filter((n) => n.depth === 1);
        expect(children).toHaveLength(20);

        // All children should have distinct x positions
        const xs = new Set(children.map((n) => n.x));
        expect(xs.size).toBe(20);
    });
});
