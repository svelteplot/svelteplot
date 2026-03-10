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
                data: [0, 1, 2, 3],
                width: 2,
                height: 2
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
        expect(image?.getAttribute('href')).toBe('data:image/png;base64,');
    });

    it('renders an image element in function sampling mode', () => {
        const { container } = render(RasterTest, {
            props: {
                fill: (x: number, y: number) => x + y,
                x1: 0,
                x2: 1,
                y1: 0,
                y2: 1
            }
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
    });

    it('renders an image element in scatter interpolation mode', () => {
        const { container } = render(RasterTest, {
            props: {
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
        });
        const image = container.querySelector('image');
        expect(image).not.toBeNull();
    });

    it('skips rendering when grid dimensions are zero', () => {
        const { container } = render(RasterTest, {
            props: {
                data: [],
                width: 0,
                height: 0
            }
        });
        const image = container.querySelector('image');
        expect(image).toBeNull();
    });
});
