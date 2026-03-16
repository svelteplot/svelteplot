import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore
import ContourTest from './contour.test.svelte';

// A simple 10×10 dense grid with values linearly increasing from 0 to 1.
const GRID_W = 10;
const GRID_H = 10;
const linearGrid = Array.from({ length: GRID_W * GRID_H }, (_, i) => i / (GRID_W * GRID_H - 1));

function paths(container: Element) {
    return container.querySelectorAll('path');
}

describe('Contour mark — dense grid mode', () => {
    it('renders path elements', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('renders exactly as many paths as explicit thresholds', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    thresholds: [0.25, 0.5, 0.75]
                }
            }
        });
        expect(paths(container).length).toBe(3);
    });

    it('renders one path per interval step within the data range', () => {
        // values in [0, 1] with interval=0.2 → thresholds at 0.2, 0.4, 0.6, 0.8
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    interval: 0.2
                }
            }
        });
        // thresholds: 0, 0.2, 0.4, 0.6, 0.8  (1.0 excluded because >= max)
        expect(paths(container).length).toBe(5);
    });

    it('renders fewer paths with a higher thresholds count', () => {
        const { container: c2 } = render(ContourTest, {
            props: {
                contourArgs: { data: linearGrid, width: GRID_W, height: GRID_H, thresholds: 2 }
            }
        });
        const { container: c10 } = render(ContourTest, {
            props: {
                contourArgs: { data: linearGrid, width: GRID_W, height: GRID_H, thresholds: 10 }
            }
        });
        expect(paths(c2).length).toBeLessThan(paths(c10).length);
    });

    it('smooth=false still renders paths', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    smooth: false
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('blur still renders paths', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    blur: 2
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('renders no paths when grid is empty', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: [],
                    width: 0,
                    height: 0
                }
            }
        });
        expect(paths(container).length).toBe(0);
    });

    it('defaults stroke to none when fill is provided', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    thresholds: [0.5],
                    fill: 'steelblue'
                }
            }
        });
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/stroke:\s*none/);
    });

    it('defaults stroke to currentColor when no fill is provided', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    thresholds: [0.5]
                }
            }
        });
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/stroke:\s*currentColor/);
    });

    it('applies constant fill style to paths', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    thresholds: [0.5],
                    fill: 'steelblue',
                    stroke: 'none'
                }
            }
        });
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/fill:\s*steelblue/);
    });

    it('applies constant stroke style to paths', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    thresholds: [0.5],
                    fill: 'none',
                    stroke: 'red',
                    strokeWidth: 2
                }
            }
        });
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/stroke:\s*red/);
        expect(p?.getAttribute('style')).toMatch(/stroke-width:\s*2/);
    });
});

describe('Contour mark — fill/stroke shorthand promotion', () => {
    it('promotes fill field name to value when value is omitted', () => {
        const grid = linearGrid.map((v, i) => ({ val: v, i }));
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: grid,
                    x: 'i',
                    y: 'i',
                    fill: 'val',
                    thresholds: [0.5]
                }
            }
        });
        // fill="val" should be promoted to value="val", fill="value"
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('promotes fill function to value when value is omitted', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    fill: (d: number) => d,
                    thresholds: [0.5]
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('does not promote fill when value is explicitly set', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    fill: 'steelblue',
                    value: (d: number) => d,
                    thresholds: [0.5]
                }
            }
        });
        // fill should stay as constant steelblue (not promoted)
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/fill:\s*steelblue/);
    });

    it('does not promote CSS color strings', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: linearGrid,
                    width: GRID_W,
                    height: GRID_H,
                    fill: 'steelblue',
                    thresholds: [0.5]
                }
            }
        });
        const p = paths(container)[0];
        expect(p?.getAttribute('style')).toMatch(/fill:\s*steelblue/);
    });
});

describe('Contour mark — function sampling mode', () => {
    it('renders path elements', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    value: (x: number, y: number) => x + y,
                    x1: -1,
                    x2: 1,
                    y1: 1,
                    y2: -1
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('renders exactly as many paths as explicit thresholds', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    value: (x: number, y: number) => x * y,
                    x1: -1,
                    x2: 1,
                    y1: 1,
                    y2: -1,
                    thresholds: [-0.5, 0, 0.5]
                }
            }
        });
        expect(paths(container).length).toBe(3);
    });
});

describe('Contour mark — scatter interpolation mode', () => {
    it('renders path elements with nearest interpolation', () => {
        const { container } = render(ContourTest, {
            props: {
                contourArgs: {
                    data: [
                        { x: 0, y: 0, v: 0 },
                        { x: 1, y: 0, v: 1 },
                        { x: 0, y: 1, v: 0.5 },
                        { x: 1, y: 1, v: 1 }
                    ],
                    x: 'x',
                    y: 'y',
                    value: 'v',
                    interpolate: 'nearest',
                    thresholds: [0.25, 0.75]
                }
            }
        });
        expect(paths(container).length).toBeGreaterThan(0);
    });

    it('calls the custom interpolate function with normalised grid coordinates', () => {
        const interpolate = vi.fn((_index: number[], width: number, height: number) =>
            new Array(width * height).fill(0.5)
        );

        render(ContourTest, {
            props: {
                plotArgs: {
                    marginLeft: 20,
                    marginTop: 10,
                    marginRight: 0,
                    marginBottom: 0,
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                contourArgs: {
                    data: [
                        { x: 0, y: 1, v: 0 }, // top-left corner of data domain
                        { x: 1, y: 0, v: 1 }, // bottom-right corner
                        { x: 0.5, y: 0.5, v: 0.5 }
                    ],
                    x: 'x',
                    y: 'y',
                    value: 'v',
                    interpolate,
                    thresholds: [0.4]
                }
            }
        });

        expect(interpolate).toHaveBeenCalled();
        const [, width, height, X, Y] = interpolate.mock.calls.at(-1)! as unknown as [
            number[],
            number,
            number,
            Float64Array,
            Float64Array
        ];
        // Top-left corner (x=0, y=1 in data → top in screen) should map to grid (0, 0)
        expect(X[0]).toBeCloseTo(0, 6);
        expect(Y[0]).toBeCloseTo(0, 6);
        // Bottom-right corner (x=1, y=0 in data → bottom in screen) should map to grid (width, height)
        expect(X[1]).toBeCloseTo(width, 6);
        expect(Y[1]).toBeCloseTo(height, 6);
    });
});
