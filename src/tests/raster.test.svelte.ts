import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import RasterTest from './raster.test.svelte';

// jsdom has HTMLCanvasElement but no 2D rendering support.
// Provide minimal stubs so computeCanvas can run without crashing.
beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
        createImageData: (w: number, h: number) => ({
            data: new Uint8ClampedArray(w * h * 4)
        }),
        putImageData: vi.fn()
    }) as any;
    HTMLCanvasElement.prototype.toDataURL = vi
        .fn()
        .mockReturnValue('data:image/png;base64,') as any;
});

describe('Raster mark', () => {
    it('renders an image element in dense grid mode', () => {
        const { container } = render(RasterTest, {
            props: {
                rasterArgs: {
                    data: [0, 1, 2, 3],
                    width: 2,
                    height: 2
                }
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
        expect(image?.getAttribute('href')).toBe('data:image/png;base64,');
    });

    it('renders an image element in function sampling mode', () => {
        const { container } = render(RasterTest, {
            props: {
                rasterArgs: {
                    fill: (x: number, y: number) => x + y,
                    x1: 0,
                    x2: 1,
                    y1: 0,
                    y2: 1
                }
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
    });

    it('renders an image element in function sampling mode with fixed aspect ratio', () => {
        const { container } = render(RasterTest, {
            props: {
                plotArgs: { aspectRatio: 1 },
                rasterArgs: {
                    fill: (x: number, y: number) => x + y,
                    x1: 0,
                    x2: 1,
                    y1: 0,
                    y2: 1
                }
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
    });

    it('renders an image element in scatter interpolation mode', () => {
        const { container } = render(RasterTest, {
            props: {
                rasterArgs: {
                    data: [
                        { x: 0, y: 0, v: 1 },
                        { x: 1, y: 0, v: 2 },
                        { x: 0, y: 1, v: 3 },
                        { x: 1, y: 1, v: 4 }
                    ],
                    x: 'x',
                    y: 'y',
                    fill: 'v',
                    interpolate: 'nearest'
                }
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
    });

    it('normalizes scatter interpolation coordinates to the plot area', () => {
        const interpolate = vi.fn(
            (_index: number[], width: number, height: number, _X: Float64Array, _Y: Float64Array) =>
                new Array(width * height).fill(0)
        );

        render(RasterTest, {
            props: {
                plotArgs: {
                    marginLeft: 20,
                    marginTop: 10,
                    marginRight: 0,
                    marginBottom: 0,
                    x: { domain: [0, 1] },
                    y: { domain: [0, 1] }
                },
                rasterArgs: {
                    data: [
                        { x: 0, y: 1, v: 1 }, // top-left corner of data domain
                        { x: 1, y: 0, v: 2 }, // bottom-right corner
                        { x: 0.5, y: 0.5, v: 3 }
                    ],
                    x: 'x',
                    y: 'y',
                    fill: 'v',
                    interpolate
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
        expect(X[0]).toBeCloseTo(0, 6);
        expect(Y[0]).toBeCloseTo(0, 6);
        expect(X[1]).toBeCloseTo(width, 6);
        expect(Y[1]).toBeCloseTo(height, 6);
    });

    it('skips rendering when grid dimensions are zero', () => {
        const { container } = render(RasterTest, {
            props: {
                rasterArgs: {
                    data: [],
                    width: 0,
                    height: 0
                }
            }
        });
        const image = container.querySelector('image');
        expect(image).toBeNull();
    });
});
