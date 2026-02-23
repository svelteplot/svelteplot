import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import DifferenceYTest from './differenceY.test.svelte';

const data = [
    { time: 0, actual: 10, forecast: 20 },
    { time: 1, actual: 30, forecast: 25 },
    { time: 2, actual: 15, forecast: 30 }
];

const baseArgs = {
    data,
    x: 'time' as const,
    y1: 'actual' as const,
    y2: 'forecast' as const
};

describe('DifferenceY mark', () => {
    it('renders positive and negative difference groups', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        expect(container.querySelector('g.positive.difference')).not.toBeNull();
        expect(container.querySelector('g.negative.difference')).not.toBeNull();
    });

    it('renders clipPath elements in each group', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        const posGroup = container.querySelector('g.positive.difference')!;
        const negGroup = container.querySelector('g.negative.difference')!;

        const posClip = posGroup.querySelector('clipPath');
        const negClip = negGroup.querySelector('clipPath');

        expect(posClip).not.toBeNull();
        expect(negClip).not.toBeNull();
        expect(posClip!.id).toMatch(/^pos-clip-.+/);
        expect(negClip!.id).toMatch(/^neg-clip-.+/);

        // visible areas reference the clip paths
        const posVisibleArea = posGroup.querySelector(':scope > path.area');
        const negVisibleArea = negGroup.querySelector(':scope > path.area');
        expect(posVisibleArea?.getAttribute('clip-path')).toMatch(/url\(#pos-clip-.+\)/);
        expect(negVisibleArea?.getAttribute('clip-path')).toMatch(/url\(#neg-clip-.+\)/);
    });

    it('renders four area paths total', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        const allAreas = container.querySelectorAll('path.area');
        expect(allAreas).toHaveLength(4);
    });

    it('applies default fill colors', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        const posVisible = container.querySelector(
            'g.positive.difference > path.area'
        ) as SVGPathElement;
        const negVisible = container.querySelector(
            'g.negative.difference > path.area'
        ) as SVGPathElement;

        expect(posVisible.style.fill).toBe('red');
        expect(negVisible.style.fill).toBe('blue');
    });

    it('applies custom fill colors', () => {
        const { container } = render(DifferenceYTest, {
            props: {
                diffArgs: {
                    ...baseArgs,
                    positiveFill: 'green',
                    negativeFill: 'orange'
                }
            }
        });

        const posVisible = container.querySelector(
            'g.positive.difference > path.area'
        ) as SVGPathElement;
        const negVisible = container.querySelector(
            'g.negative.difference > path.area'
        ) as SVGPathElement;

        expect(posVisible.style.fill).toBe('green');
        expect(negVisible.style.fill).toBe('orange');
    });

    it('applies fill opacity', () => {
        const { container } = render(DifferenceYTest, {
            props: {
                diffArgs: {
                    ...baseArgs,
                    positiveFillOpacity: 0.5,
                    negativeFillOpacity: 0.3
                }
            }
        });

        const posVisible = container.querySelector(
            'g.positive.difference > path.area'
        ) as SVGPathElement;
        const negVisible = container.querySelector(
            'g.negative.difference > path.area'
        ) as SVGPathElement;

        expect(posVisible.style.fillOpacity).toBe('0.5');
        expect(negVisible.style.fillOpacity).toBe('0.3');
    });

    it('does not render Line when stroke is not set', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        expect(container.querySelector('g.lines')).toBeNull();
    });

    it('renders Line when stroke is set', () => {
        const { container } = render(DifferenceYTest, {
            props: {
                diffArgs: {
                    ...baseArgs,
                    stroke: 'steelblue'
                }
            }
        });

        const linePath = container.querySelector('g.lines > g > path') as SVGPathElement;
        expect(linePath).not.toBeNull();
        expect(linePath.style.stroke).toBe('steelblue');
    });

    it('applies custom CSS class to groups', () => {
        const { container } = render(DifferenceYTest, {
            props: {
                diffArgs: {
                    ...baseArgs,
                    class: 'temp-diff'
                }
            }
        });

        expect(container.querySelector('g.positive.difference.temp-diff')).not.toBeNull();
        expect(container.querySelector('g.negative.difference.temp-diff')).not.toBeNull();
    });

    it('all area paths have valid geometry', () => {
        const { container } = render(DifferenceYTest, {
            props: { diffArgs: baseArgs }
        });

        const areas = container.querySelectorAll('path.area');
        expect(areas).toHaveLength(4);

        areas.forEach((area) => {
            const d = area.getAttribute('d');
            expect(d).not.toBeNull();
            expect(d).toMatch(/^M[\d.-]/);
        });
    });
});
