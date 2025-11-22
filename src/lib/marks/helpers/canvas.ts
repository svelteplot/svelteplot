import { CSS_URL, CSS_VAR } from 'svelteplot/constants';

export function resolveColor(color: string, canvas: HTMLCanvasElement) {
    if (`${color}`.toLowerCase() === 'currentcolor') {
        color = getComputedStyle(canvas?.parentElement?.parentElement as Element).getPropertyValue(
            'color'
        );
    }
    if (CSS_VAR.test(color)) {
        color = getComputedStyle(canvas).getPropertyValue(color.slice(4, -1));
    }
    if (CSS_URL.test(color)) {
        // might be a gradient we can parse!
        const m = color.match(/^url\((#[^)]+)\)/);
        const gradientId = m[1];
        const gradient = canvas.ownerDocument.querySelector(gradientId) as
            | SVGLinearGradientElement
            | SVGRadialGradientElement;
        if (gradient) {
            // parse gradient
            if (gradient.nodeName.toLowerCase() === 'lineargradient') {
                const x0 = +gradient.getAttribute('x1');
                const x1 = +gradient.getAttribute('x2');
                const y0 = +gradient.getAttribute('y1');
                const y1 = +gradient.getAttribute('y2');
                const ctxGradient = canvas.getContext('2d').createLinearGradient(x0, y0, x1, y1);
                for (const stop of gradient.querySelectorAll('stop')) {
                    const offset = +stop.getAttribute('offset');
                    const color = resolveColor(stop.getAttribute('stop-color'), canvas);
                    ctxGradient.addColorStop(Math.min(1, Math.max(0, offset)), color);
                }
                return ctxGradient;
            }
        }
    }
    return color;
}
