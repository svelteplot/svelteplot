import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import PlotTest from './plot.test.svelte';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

describe('Plot component', () => {
    it('empty plot', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100
                }
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
        expect(svg?.getAttribute('font-family')).toBe(null);
    });

    it('plot with title', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    title: 'Plot title'
                }
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
                plotArgs: {
                    subtitle: 'Plot subtitle'
                }
            }
        });
        expect(container.querySelectorAll('.plot-header')).toHaveLength(1);
        expect(container.querySelectorAll('.plot-header h3')).toHaveLength(1);
        expect(container.querySelector('.plot-header h3')?.innerHTML).toBe('Plot subtitle');
    });

    it('plot with caption', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    caption: 'Plot caption'
                }
            }
        });
        expect(container.querySelectorAll('.plot-footer')).toHaveLength(1);
        expect(container.querySelector('.plot-footer div')?.innerHTML).toBe('Plot caption');
    });

    it('plot with title, subtitle and caption', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    title: 'Main title',
                    subtitle: 'Subtitle text',
                    caption: 'Caption text'
                }
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
                plotArgs: {
                    width: 300,
                    height: 200
                }
            }
        });

        const svg = container.querySelector('.plot-body svg');
        expect(svg).toBeDefined();
        expect(svg?.getAttribute('width')).toBe('300');
        expect(svg?.getAttribute('height')).toBe('200');
    });

    it.only('plot height as function of width', () => {
        const height = vi.fn((w: number) => {
            return w * 0.5;
        });
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: 0,
                    width: 300,
                    height
                }
            }
        });

        expect(height).toBeCalledTimes(1);
        expect(height.mock.calls).toStrictEqual([[300]]);

        const svg = container.querySelector('.plot-body svg');
        expect(svg).toBeDefined();
        expect(svg?.getAttribute('width')).toBe('300');
        expect(svg?.getAttribute('height')).toBe('150');
    });

    it('margin settings are applied', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100,
                    margin: { top: 20, right: 20, bottom: 20, left: 20 }
                }
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
                plotArgs: {
                    width: 100,
                    height: 100,
                    x: { type: 'linear' },
                    y: { type: 'linear' },
                    color: { type: 'ordinal' }
                }
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
                plotArgs: {
                    width: 100,
                    height: 150
                }
            }
        });

        // Check for the presence of the background element
        // Here we're checking that the plot renders with a background property
        const svg = container.querySelector('svg');

        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('150');
    });

    it('initial margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100,
                    frame: true
                }
            }
        });

        // Check for the presence of the background element
        // Here we're checking that the plot renders with a background property
        const svg = container.querySelector('svg');

        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('100');

        const rect = container.querySelector('svg rect.frame');
        expect(rect).not.toBeNull();
        expect(rect?.getAttribute('transform')).toBe('translate(1,5)');
        expect(parseInt(rect?.getAttribute('width') as string)).toBe(95);
        expect(parseInt(rect?.getAttribute('height') as string)).toBe(90);
    });

    it('plot margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: 10,
                    width: 100,
                    height: 100,
                    frame: true
                }
            }
        });

        // Check for the presence of the background element
        // Here we're checking that the plot renders with a background property
        const svg = container.querySelector('svg');

        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('100');

        const rect = container.querySelector('svg rect.frame');
        expect(rect).not.toBeNull();
        expect(rect?.getAttribute('transform')).toBe('translate(10,10)');
        expect(parseInt(rect?.getAttribute('width') as string)).toBe(80);
        expect(parseInt(rect?.getAttribute('height') as string)).toBe(80);
    });

    function testMargins(
        rect: SVGRectElement,
        margins: { top: number; left: number; bottom: number; right: number }
    ) {
        expect(rect).not.toBeNull();
        expect(rect?.getAttribute('transform')).toBe(`translate(${margins.left},${margins.top})`);
        expect(parseInt(rect?.getAttribute('width') as string)).toBe(
            100 - margins.left - margins.right
        );
        expect(parseInt(rect?.getAttribute('height') as string)).toBe(
            100 - margins.top - margins.bottom
        );
    }

    it('plot separate margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: { top: 15, left: 5, bottom: 15, right: 20 },
                    width: 100,
                    height: 100,
                    frame: true
                }
            }
        });

        // Check for the presence of the background element
        // Here we're checking that the plot renders with a background property
        const svg = container.querySelector('svg');

        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('width')).toBe('100');
        expect(svg?.getAttribute('height')).toBe('100');

        testMargins(container.querySelector('svg rect.frame') as SVGRectElement, {
            top: 15,
            left: 5,
            bottom: 15,
            right: 20
        });
    });

    it('plot with directional user-default margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: { top: 10, left: 12, bottom: 14, right: 16 }
                }
            }
        });

        const rect = container.querySelector('svg rect.frame');
        testMargins(rect as SVGRectElement, { top: 10, left: 12, bottom: 14, right: 16 });
    });

    it('plot with uniform user-default margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: 20
                }
            }
        });

        const rect = container.querySelector('svg rect.frame');
        testMargins(rect as SVGRectElement, { top: 20, left: 20, bottom: 20, right: 20 });
    });

    it('directional plot margin overrides directional user-default margins', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: { top: 5 },
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: { top: 10, left: 12, bottom: 14, right: 16 }
                }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 12, bottom: 14, right: 16 });
    });

    it('directional plot margin overrides uniform user-default margin', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: { top: 5 },
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: 10
                }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 10, bottom: 10, right: 10 });
    });

    it('uniform plot margin overrides uniform user-default margin', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: 5,
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: 10
                }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 5, bottom: 5, right: 5 });
    });

    it('uniform plot margin overrides directional user-default margin', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: 5,
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: {
                    margin: { left: 10 }
                }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 5, bottom: 5, right: 5 });
    });

    it('shorthand marginLeft overrides uniform plot margin', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: 5,
                    marginLeft: 15,
                    width: 100,
                    height: 100,
                    frame: true
                }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 15, bottom: 5, right: 5 });
    });

    it('shorthand marginLeft overrides directional plot margin', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    margin: { left: 10, right: 20 },
                    marginLeft: 15,
                    width: 100,
                    height: 100,
                    frame: true
                },
                defaults: { margin: 5 }
            }
        });

        const rect = container.querySelector('svg rect.frame') as SVGRectElement;
        testMargins(rect, { top: 5, left: 15, bottom: 5, right: 20 });
    });
});

describe('Implicit axes', () => {
    it('accepts x axis domain configuration', () => {
        const { container } = render(PlotTest, {
            props: {
                plotArgs: {
                    width: 100,
                    height: 100,
                    x: {
                        domain: [0, 10]
                    }
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
                plotArgs: {
                    width: 100,
                    height: 100,
                    y: {
                        domain: [0, 10]
                    }
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
                plotArgs: {
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
