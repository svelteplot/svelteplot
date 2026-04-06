import { describe, it, expect } from 'vitest';
import { forceLayout, forceNode, forceLink } from './force.js';
import type { ForceNode } from './force.js';

// ── Helpers ──

const sampleNodes = [
    { id: 'A', group: 1 },
    { id: 'B', group: 2 },
    { id: 'C', group: 1 }
];

const sampleLinks = [
    { source: 'A', target: 'B', value: 4 },
    { source: 'B', target: 'C', value: 2 }
];

describe('forceLayout', () => {
    it('returns empty nodes and links for empty input', () => {
        const result = forceLayout([], []);

        expect(result.nodes).toEqual([]);
        expect(result.links).toEqual([]);
    });

    it('positions nodes with finite x/y after layout', () => {
        const result = forceLayout(sampleNodes, sampleLinks);

        expect(result.nodes).toHaveLength(3);
        for (const n of result.nodes) {
            expect(typeof n.x).toBe('number');
            expect(typeof n.y).toBe('number');
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
        }

        expect(result.links).toHaveLength(2);
    });

    it('supports custom nodeId field', () => {
        const nodes = [
            { name: 'X', group: 1 },
            { name: 'Y', group: 2 }
        ];
        const links = [{ source: 'X', target: 'Y' }];

        const result = forceLayout(nodes, links, { nodeId: 'name' });

        expect(result.nodes).toHaveLength(2);
        const ids = result.nodes.map((n) => n.id);
        expect(ids).toContain('X');
        expect(ids).toContain('Y');

        for (const n of result.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
        }
    });

    it('preserves original node fields', () => {
        const nodes = [
            { id: 'A', group: 3, label: 'Alpha' },
            { id: 'B', group: 7, label: 'Beta' }
        ];

        const result = forceLayout(nodes, [{ source: 'A', target: 'B' }]);

        const a = result.nodes.find((n) => n.id === 'A')!;
        const b = result.nodes.find((n) => n.id === 'B')!;
        expect(a.group).toBe(3);
        expect(a.label).toBe('Alpha');
        expect(b.group).toBe(7);
        expect(b.label).toBe('Beta');
    });

    it('preserves original link fields', () => {
        const result = forceLayout(sampleNodes, sampleLinks);

        expect(result.links[0].value).toBe(4);
        expect(result.links[1].value).toBe(2);
    });

    it('filters out links with invalid source or target', () => {
        const nodes = [
            { id: 'A', group: 1 },
            { id: 'B', group: 2 }
        ];
        const links = [
            { source: 'A', target: 'B', value: 1 },
            { source: 'A', target: 'MISSING', value: 2 },
            { source: 'GHOST', target: 'B', value: 3 }
        ];

        const result = forceLayout(nodes, links);

        expect(result.links).toHaveLength(1);
        expect(result.links[0].value).toBe(1);
    });

    it('option shorthands: number, object, and false all produce valid output', () => {
        // Number shorthands
        const r1 = forceLayout(sampleNodes, sampleLinks, {
            charge: -100,
            center: 0.5,
            link: 30,
            collide: 5,
            ticks: 50
        });
        expect(r1.nodes).toHaveLength(3);

        // Disable with false
        const r2 = forceLayout(sampleNodes, sampleLinks, {
            charge: false,
            center: false,
            collide: false,
            ticks: 50
        });
        expect(r2.nodes).toHaveLength(3);

        for (const n of [...r1.nodes, ...r2.nodes]) {
            expect(Number.isFinite(n.x)).toBe(true);
        }
    });

    it('setup callback modifies simulation', () => {
        const result = forceLayout(sampleNodes, sampleLinks, {
            setup: (sim) => {
                sim.force('charge', null);
            }
        });

        expect(result.nodes).toHaveLength(3);
        for (const n of result.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
        }
    });

    it('does not mutate input arrays', () => {
        const nodes = [{ id: 'A' }, { id: 'B' }];
        const links = [{ source: 'A', target: 'B' }];

        const nodesCopy = JSON.parse(JSON.stringify(nodes));
        const linksCopy = JSON.parse(JSON.stringify(links));

        forceLayout(nodes, links);

        expect(nodes).toEqual(nodesCopy);
        expect(links).toEqual(linksCopy);
    });
});

describe('forceNode / forceLink transforms', () => {
    it('forceNode returns data with x/y channels and positioned ForceNodes', () => {
        const result = forceNode(sampleLinks)({ data: sampleNodes });

        expect(result.x).toBe('x');
        expect(result.y).toBe('y');
        expect(result.data).toHaveLength(3);
        for (const n of result.data) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
        }
    });

    it('forceLink returns data with x1/y1/x2/y2 string channel names', () => {
        const result = forceLink(sampleNodes)({ data: sampleLinks });

        expect(result.x1).toBe('x1');
        expect(result.y1).toBe('y1');
        expect(result.x2).toBe('x2');
        expect(result.y2).toBe('y2');
        expect(result.data).toHaveLength(2);
    });

    it('forceLink records have correct source/target coordinates embedded', () => {
        const result = forceLink(sampleNodes)({ data: sampleLinks });
        const link = result.data[0];

        expect(link.x1).toBe(link.source.x);
        expect(link.y1).toBe(link.source.y);
        expect(link.x2).toBe(link.target.x);
        expect(link.y2).toBe(link.target.y);
        expect(Number.isFinite(link.x1)).toBe(true);
    });

    it('forceNode preserves extra channels in args', () => {
        const result = forceNode(sampleLinks)({ data: sampleNodes, fill: 'group' });

        expect(result.fill).toBe('group');
        expect(result.x).toBe('x');
        expect(result.y).toBe('y');
    });

    it('forceLink preserves extra channels in args', () => {
        const result = forceLink(sampleNodes)({
            data: sampleLinks,
            stroke: 'value',
            strokeWidth: 2
        });

        expect(result.stroke).toBe('value');
        expect(result.strokeWidth).toBe(2);
    });

    it('both return correct data lengths matching input', () => {
        const nodeResult = forceNode(sampleLinks)({ data: sampleNodes });
        const linkResult = forceLink(sampleNodes)({ data: sampleLinks });

        expect(nodeResult.data).toHaveLength(sampleNodes.length);
        expect(linkResult.data).toHaveLength(sampleLinks.length);
    });

    it('forceNode handles empty input', () => {
        const result = forceNode([])({ data: [] as Record<string, unknown>[] });

        expect(result.data).toEqual([]);
        expect(result.x).toBe('x');
        expect(result.y).toBe('y');
    });

    it('forceLink handles empty links input', () => {
        const result = forceLink(sampleNodes)({ data: [] as Record<string, unknown>[] });

        expect(result.data).toEqual([]);
        expect(result.x1).toBe('x1');
    });
});

describe('forceLayout edge cases', () => {
    it('single-node graph with zero links', () => {
        const result = forceLayout([{ id: 'solo' }], []);

        expect(result.nodes).toHaveLength(1);
        expect(result.links).toHaveLength(0);
        expect(Number.isFinite(result.nodes[0].x)).toBe(true);
        expect(Number.isFinite(result.nodes[0].y)).toBe(true);
    });

    it('disconnected graph (two components, no links between them)', () => {
        const nodes = [
            { id: 'A', group: 1 },
            { id: 'B', group: 1 },
            { id: 'X', group: 2 },
            { id: 'Y', group: 2 }
        ];
        const links = [
            { source: 'A', target: 'B' },
            { source: 'X', target: 'Y' }
        ];

        const result = forceLayout(nodes, links);

        expect(result.nodes).toHaveLength(4);
        expect(result.links).toHaveLength(2);
        for (const n of result.nodes) {
            expect(Number.isFinite(n.x)).toBe(true);
            expect(Number.isFinite(n.y)).toBe(true);
        }
    });

    it('forceNode/forceLink cache: same inputs produce same result reference', () => {
        const nodes = [{ id: 'A' }, { id: 'B' }];
        const links = [{ source: 'A', target: 'B' }];
        const opts = { ticks: 50 };

        const nodeResult1 = forceNode(links, opts)({ data: nodes });
        const linkResult = forceLink(nodes, opts)({ data: links });

        // The underlying ForceNode objects should be shared — link source/target
        // reference the same positioned node objects as the node result
        const nodeA = nodeResult1.data.find((n: ForceNode) => n.id === 'A')!;
        const linkData = linkResult.data[0];
        expect(linkData.source).toBe(nodeA);
    });
});
