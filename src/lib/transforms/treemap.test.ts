import { describe, it, expect } from 'vitest';
import { treemapNode } from './treemap.js';

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

describe('treemapNode', () => {
	it('returns nodes with rectangular bounds (x0, y0, x1, y1)', () => {
		const result = treemapNode({ value: 'value' })({ data: idData });

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
		const result = treemapNode({ value: 'value' })({ data: idData });

		expect(result.data).toHaveLength(idData.length);
	});

	it('returns x1/y1/x2/y2 string channel names', () => {
		const result = treemapNode({ value: 'value' })({ data: idData });

		expect(result.x1).toBe('x0');
		expect(result.y1).toBe('y0');
		expect(result.x2).toBe('x1');
		expect(result.y2).toBe('y1');
	});

	it('root node spans the full layout size', () => {
		const result = treemapNode({ value: 'value', size: [1, 1] })({ data: idData });

		const root = result.data.find((n) => n.depth === 0);
		expect(root).toBeDefined();
		expect(root!.x0).toBeCloseTo(0, 5);
		expect(root!.y0).toBeCloseTo(0, 5);
		expect(root!.x1).toBeCloseTo(1, 5);
		expect(root!.y1).toBeCloseTo(1, 5);
	});

	it('leaf areas are proportional to values', () => {
		const result = treemapNode({ value: 'value' })({ data: idData });

		const leaves = result.data.filter((n) => n.height === 0);
		expect(leaves).toHaveLength(3);

		const areas = leaves.map((n) => (n.x1 - n.x0) * (n.y1 - n.y0));
		const totalArea = areas.reduce((s, a) => s + a, 0);

		// 'b' has value 20 out of 60 total → ~1/3 of area
		const bNode = leaves.find((n) => n.id === 'b');
		expect(bNode).toBeDefined();
		const bArea = (bNode!.x1 - bNode!.x0) * (bNode!.y1 - bNode!.y0);
		expect(bArea / totalArea).toBeCloseTo(20 / 60, 1);
	});

	it('preserves original datum fields', () => {
		const result = treemapNode({ value: 'value' })({ data: idData });

		const aNode = result.data.find((n) => n.id === 'a');
		expect(aNode).toBeDefined();
		expect(aNode!.value).toBe(10);
	});

	it('adds depth and height properties', () => {
		const result = treemapNode({ value: 'value' })({ data: idData });

		for (const node of result.data) {
			expect(typeof node.depth).toBe('number');
			expect(typeof node.height).toBe('number');
		}

		const root = result.data.find((n) => n.id === 'root');
		expect(root!.depth).toBe(0);

		const leaves = result.data.filter((n) => n.height === 0);
		expect(leaves.length).toBeGreaterThan(0);
	});

	it('path-based stratification works', () => {
		const result = treemapNode({ path: 'path', value: 'value' })({ data: pathData });

		expect(result.data).toHaveLength(pathData.length);

		const root = result.data.find((n) => n.depth === 0);
		expect(root).toBeDefined();
		expect(root!.x0).toBeCloseTo(0, 5);
	});

	it('custom size option scales layout', () => {
		const result = treemapNode({ value: 'value', size: [100, 200] })({ data: idData });

		const root = result.data.find((n) => n.depth === 0);
		expect(root!.x1).toBeCloseTo(100, 5);
		expect(root!.y1).toBeCloseTo(200, 5);
	});

	it('preserves extra channels in args', () => {
		const result = treemapNode({ value: 'value' })({ data: idData, fill: 'depth' });

		expect(result.fill).toBe('depth');
	});

	it('function-based value accessor', () => {
		const data = [
			{ id: 'root', parentId: null, size: 0 },
			{ id: 'a', parentId: 'root', size: 15 },
			{ id: 'b', parentId: 'root', size: 30 }
		];

		const result = treemapNode({ value: (d: any) => d.size })({ data });

		expect(result.data).toHaveLength(3);
		const leaves = result.data.filter((n) => n.height === 0);
		expect(leaves).toHaveLength(2);
	});
});
