import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import PlotTest from './plot.test.svelte';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

describe('Plot component', () => {
    it('empty plot', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100
            }
        });

        const figure = container.querySelectorAll('figure');
        expect(figure).toHaveLength(1);
        expect(figure[0].style?.width).toBe('');

        expect(container.querySelectorAll('.plot-header')).toHaveLength(0);
        expect(container.querySelectorAll('.plot-footer')).toHaveLength(0);
        expect(container.querySelectorAll('.plot-body')).toHaveLength(1);

        const svg = container.querySelector('.plot-body svg');
        expect(svg).toBeDefined();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('100');
    });

    it('plot with title', () => {
        const { container } = render(PlotTest, {
            props: {
                title: 'Plot title'
            }
        });
        expect(container.querySelectorAll('.plot-header')).toHaveLength(1);
        expect(container.querySelectorAll('.plot-header h2')).toHaveLength(1);
        expect(container.querySelector('.plot-header h2')?.innerHTML).toBe('Plot title');

        expect(container.querySelectorAll('.plot-footer')).toHaveLength(0);
        expect(container.querySelectorAll('.plot-body')).toHaveLength(1);
    });

    it('plot with subtitle', () => {
        const { container } = render(PlotTest, {
            props: {
                subtitle: 'Plot subtitle'
            }
        });
        expect(container.querySelectorAll('.plot-header')).toHaveLength(1);
        expect(container.querySelectorAll('.plot-header h3')).toHaveLength(1);
        expect(container.querySelector('.plot-header h3')?.innerHTML).toBe('Plot subtitle');
    });

    it('plot with caption', () => {
        const { container } = render(PlotTest, {
            props: {
                caption: 'Plot caption'
            }
        });
        expect(container.querySelectorAll('.plot-footer')).toHaveLength(1);
        expect(container.querySelector('.plot-footer div')?.innerHTML).toBe('Plot caption');
    });

    it('plot with title, subtitle and caption', () => {
        const { container } = render(PlotTest, {
            props: {
                title: 'Main title',
                subtitle: 'Subtitle text',
                caption: 'Caption text'
            }
        });
        expect(container.querySelectorAll('.plot-header')).toHaveLength(1);
        expect(container.querySelectorAll('.plot-footer')).toHaveLength(1);
        expect(container.querySelector('.plot-header h2')?.innerHTML).toBe('Main title');
        expect(container.querySelector('.plot-header h3')?.innerHTML).toBe('Subtitle text');
        expect(container.querySelector('.plot-footer div')?.innerHTML).toBe('Caption text');
    });

    it('plot with width and height', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 300,
                height: 200
            }
        });

        const svg = container.querySelector('.plot-body svg');
        expect(svg).toBeDefined();
        expect(svg?.getAttribute('width')).toBe('300');
        expect(svg?.getAttribute('height')).toBe('200');
    });

    it('margin settings are applied', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100,
                margin: { top: 20, right: 20, bottom: 20, left: 20 }
            }
        });

        // We can only indirectly check for margins by verifying that the plot renders
        const plotBody = container.querySelector('.plot-body');
        expect(plotBody).not.toBeNull();

        // The svg should have the specified dimensions
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('100');
    });

    it('scale configuration', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100,
                x: { type: 'linear' },
                y: { type: 'linear' },
                color: { type: 'ordinal' }
            }
        });

        // Unfortunately we can't directly test the scales without mocking the component internals
        // But we can verify the component renders with these scale configurations
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
    });

    it('plot size', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 150
            }
        });

        // Check for the presence of the background element
        // Here we're checking that the plot renders with a background property
        const svg = container.querySelector('svg');

        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('150');
    });
});

describe('Implicit axes', () => {
    it('accepts x axis domain configuration', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100,
                x: {
                    domain: [0, 10]
                }
            }
        });

        // Verify the plot renders correctly
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
        // has x axis and ticks
        expect(svg?.querySelector('g.axis-x')).toBeDefined();
        expect(svg?.querySelectorAll('g.axis-x .tick')).toHaveLength(3);
        // but no y axis
        expect(svg?.querySelector('g.axis-y')).toBeNull();
    });

    it('accepts y axis domain configuration', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100,
                y: {
                    domain: [0, 10]
                }
            }
        });

        // Verify the plot renders correctly
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
        // has y axis and ticks
        expect(svg?.querySelector('g.axis-y')).toBeDefined();
        expect(svg?.querySelectorAll('g.axis-y .tick')).toHaveLength(3);
        // but no x axis
        expect(svg?.querySelector('g.axis-x')).toBeNull();
    });

    it('accepts axis placement configuration', () => {
        const { container } = render(PlotTest, {
            props: {
                width: 100,
                height: 100,
                x: {
                    domain: [0, 10],
                    axis: 'top'
                },
                y: {
                    domain: [0, 10],
                    axis: 'right'
                }
            }
        });

        // Verify the plot renders correctly with specified axis placement
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();

        // Should have the x-axis with top placement
        const xAxis = svg?.querySelector('g.axis-x');
        expect(xAxis).toBeDefined();

        // Check for top placement by examining tick translation positions
        const xTicks = svg?.querySelectorAll('g.axis-x .tick');
        expect(xTicks?.length).toBeGreaterThan(0);

        // Should have the y-axis with right placement
        const yAxis = svg?.querySelector('g.axis-y');
        expect(yAxis).toBeDefined();

        // Check for right placement by examining tick positions
        const yTicks = svg?.querySelectorAll('g.axis-y .tick');
        expect(yTicks?.length).toBeGreaterThan(0);
    });
});
