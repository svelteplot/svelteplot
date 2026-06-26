import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import CssTransformMarginsTest from './css-transform-margins.test.svelte';

const MOCK_BBOX = { x: 0, y: 0, width: 30, height: 12 };
const SCALE = 1.3;

function installGeometryMocks() {
    const textProto = Object.getPrototypeOf(
        document.createElementNS('http://www.w3.org/2000/svg', 'text')
    ) as SVGTextElement;

    const originalGbcr = Element.prototype.getBoundingClientRect;
    const originalGetBBox = (textProto as { getBBox?: () => DOMRect }).getBBox;

    Element.prototype.getBoundingClientRect = function (this: Element) {
        const isSvgText =
            this.namespaceURI === 'http://www.w3.org/2000/svg' && this.localName === 'text';
        if (isSvgText) {
            const bbox =
                typeof (this as SVGTextElement).getBBox === 'function'
                    ? (this as SVGTextElement).getBBox()
                    : { width: MOCK_BBOX.width, height: MOCK_BBOX.height };
            return {
                x: 0,
                y: 0,
                width: bbox.width * SCALE,
                height: bbox.height * SCALE,
                top: 0,
                left: 0,
                right: bbox.width * SCALE,
                bottom: bbox.height * SCALE,
                toJSON: () => ({})
            } as DOMRect;
        }
        return originalGbcr.call(this);
    };

    textProto.getBBox = function () {
        return MOCK_BBOX as DOMRect;
    };

    return () => {
        Element.prototype.getBoundingClientRect = originalGbcr;
        if (originalGetBBox) {
            textProto.getBBox = originalGetBBox;
        } else {
            delete (textProto as { getBBox?: () => DOMRect }).getBBox;
        }
    };
}

describe('css transform auto margins', () => {
    let restoreMocks: () => void;
    const errors: string[] = [];

    const onError = (event: Event) => {
        const msg = (event as ErrorEvent).message ?? String(event);
        errors.push(msg);
    };

    beforeEach(() => {
        restoreMocks = installGeometryMocks();
        errors.length = 0;
        window.addEventListener('error', onError);
    });

    afterEach(() => {
        window.removeEventListener('error', onError);
        restoreMocks();
    });

    it(
        'uses unscaled SVG layout units for auto margins under mocked CSS scale',
        async () => {
        const { container, rerender } = render(CssTransformMarginsTest, { props: { width: 300 } });

        for (let w = 303; w <= 500; w += 3) {
            await rerender({ width: w });
            await new Promise((r) => setTimeout(r, 0));
        }

        const marginBottom = Number(
            container.querySelector('[data-testid="margin-probe-bottom"]')?.textContent
        );
        const marginLeft = Number(
            container.querySelector('[data-testid="margin-probe-left"]')?.textContent
        );

        // ceil(12) + tickPadding(3) + tickSize(6) = 21; inflated gbcr yields 25
        expect(marginBottom).toBe(21);
        expect(marginBottom).toBeLessThan(25);
        expect(marginLeft).toBeGreaterThan(0);

        expect(errors.some((e) => e.includes('effect_update_depth_exceeded'))).toBe(false);
        },
        15000
    );
});