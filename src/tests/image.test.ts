import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ImageTest from './image.test.svelte';

const testData = [
    { x: 10, y: 20, value: 5 },
    { x: 15, y: 25, value: 10 }
];

describe('Image mark', () => {
    it('renders images with basic props and defaults', () => {
        const { container } = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    // use defaults: width=20, height=width
                    src: 'https://example.com/pic.png',
                    title: 'My Image',
                    imageClass: 'thumb'
                }
            }
        });

        const images = container.querySelectorAll('image') as NodeListOf<SVGImageElement>;
        expect(images.length).toBe(2);

        // default width/height
        expect(images[0].getAttribute('width')).toBe('20');
        expect(images[0].getAttribute('height')).toBe('20');
        expect(images[1].getAttribute('width')).toBe('20');
        expect(images[1].getAttribute('height')).toBe('20');

        // preserveAspectRatio default
        expect(images[0].getAttribute('preserveAspectRatio')).toBe('xMidYMin slice');

        // href/src handling
        expect(images[0].getAttribute('href')).toBe('https://example.com/pic.png');
        expect(images[1].getAttribute('href')).toBe('https://example.com/pic.png');

        // title element
        const title0 = images[0].querySelector('title');
        const title1 = images[1].querySelector('title');
        expect(title0?.textContent).toBe('My Image');
        expect(title1?.textContent).toBe('My Image');

        // class
        expect(images[0].classList.contains('thumb')).toBe(true);
        expect(images[1].classList.contains('thumb')).toBe(true);

        // positions: based on known plot scaling from other tests
        // centers are [1,95] and [96,5]; image x/y are center - w/2, center - h/2
        const x0 = parseFloat(images[0].getAttribute('x') || 'NaN');
        const y0 = parseFloat(images[0].getAttribute('y') || 'NaN');
        const x1 = parseFloat(images[1].getAttribute('x') || 'NaN');
        const y1 = parseFloat(images[1].getAttribute('y') || 'NaN');
        expect(x0).toBeCloseTo(1 - 10);
        expect(y0).toBeCloseTo(95 - 10);
        expect(x1).toBeCloseTo(96 - 10);
        expect(y1).toBeCloseTo(5 - 10);
    });

    it('wraps images with <a> when href is provided', () => {
        const { container } = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    src: 'img.png',
                    href: (d: any) => `https://example.com/${d.value}`
                }
            }
        });

        const links = container.querySelectorAll('a[aria-label="link"]') as NodeListOf<SVGAElement>;
        const images = container.querySelectorAll('a[aria-label="link"] > image') as NodeListOf<SVGImageElement>;

        expect(links.length).toBe(testData.length);
        expect(images.length).toBe(testData.length);

        const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
        expect(hrefs).toStrictEqual(testData.map((d) => `https://example.com/${d.value}`));
    });

    it('applies r to size and clip-path', () => {
        const { container } = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: [{ x: 10, y: 20 }],
                    x: 'x',
                    y: 'y',
                    r: 10,
                    src: 'img.png'
                }
            }
        });

        const image = container.querySelector('image') as SVGImageElement;
        expect(image).not.toBeNull();

        // r sets width/height to 2*r
        expect(image.getAttribute('width')).toBe('20');
        expect(image.getAttribute('height')).toBe('20');

        // clip-path reflects radius
        expect(image.getAttribute('clip-path')).toBe('circle(10px)');
    });

    it('supports data-driven width/height, src and class', () => {
        const { container } = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    width: (d: any) => d.value, // 5, 10
                    height: (d: any) => d.value * 2, // 10, 20
                    src: (d: any) => `img-${d.value}.png`,
                    imageClass: (d: any) => (d.value > 7 ? 'big' : 'small')
                }
            }
        });

        const images = container.querySelectorAll('image') as NodeListOf<SVGImageElement>;
        expect(images.length).toBe(2);

        expect(images[0].getAttribute('width')).toBe('5');
        expect(images[0].getAttribute('height')).toBe('10');
        expect(images[0].getAttribute('href')).toBe('img-5.png');
        expect(images[0].classList.contains('small')).toBe(true);

        expect(images[1].getAttribute('width')).toBe('10');
        expect(images[1].getAttribute('height')).toBe('20');
        expect(images[1].getAttribute('href')).toBe('img-10.png');
        expect(images[1].classList.contains('big')).toBe(true);
    });

    it('applies dx and dy offsets', () => {
        const base = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: [{ x: 10, y: 20 }],
                    x: 'x',
                    y: 'y',
                    dx: 0,
                    dy: 0,
                    width: 20,
                    src: 'img.png'
                }
            }
        });
        const img0 = base.container.querySelector('image') as SVGImageElement;
        const x0 = parseFloat(img0.getAttribute('x') || 'NaN');
        const y0 = parseFloat(img0.getAttribute('y') || 'NaN');

        const withOffset = render(ImageTest, {
            props: {
                plotArgs: {},
                imageArgs: {
                    data: [{ x: 10, y: 20 }],
                    x: 'x',
                    y: 'y',
                    dx: 5,
                    dy: 5,
                    width: 20,
                    src: 'img.png'
                }
            }
        });
        const img1 = withOffset.container.querySelector('image') as SVGImageElement;
        const x1 = parseFloat(img1.getAttribute('x') || 'NaN');
        const y1 = parseFloat(img1.getAttribute('y') || 'NaN');

        // dx/dy should shift the center; since width is constant,
        // the x/y attributes also shift by the same delta
        expect(x1 - x0).toBeCloseTo(5);
        expect(y1 - y0).toBeCloseTo(5);
    });
});
