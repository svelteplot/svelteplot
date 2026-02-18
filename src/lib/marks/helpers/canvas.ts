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
        if (!m) return color;
        const gradientId = m[1];
        const gradient = canvas.ownerDocument.querySelector(gradientId) as
            | SVGLinearGradientElement
            | SVGRadialGradientElement;
        if (gradient) {
            // parse gradient
            if (gradient.nodeName.toLowerCase() === 'lineargradient') {
                const x0 = +(gradient.getAttribute('x1') ?? 0);
                const x1 = +(gradient.getAttribute('x2') ?? 0);
                const y0 = +(gradient.getAttribute('y1') ?? 0);
                const y1 = +(gradient.getAttribute('y2') ?? 0);
                const ctx = canvas.getContext('2d');
                // If we cannot obtain a 2D context, fall back to a safe color instead of returning
                // the original gradient URL (e.g., "url(#gradient1)"), which is not a valid canvas color.
                if (!ctx) return 'transparent';
                const ctxGradient = ctx.createLinearGradient(x0, y0, x1, y1);
                for (const stop of gradient.querySelectorAll('stop')) {
                    const offset = +(stop.getAttribute('offset') ?? 0);
                    const stopColor = resolveColor(stop.getAttribute('stop-color') ?? '', canvas);
                    ctxGradient.addColorStop(Math.min(1, Math.max(0, offset)), stopColor as string);
                }
                return ctxGradient;
            }
        }
    }
    return color;
}
