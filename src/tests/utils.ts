import { parseSVG, makeAbsolute } from 'svg-path-parser';

export function getRectDims(rect: SVGRectElement) {
    const t = rect
        ?.getAttribute('transform')
        ?.match(/translate\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)/);
    return {
        x: Math.round(+t[1]),
        y: Math.round(+t[2]),
        w: Math.round(+rect.getAttribute('width')),
        h: Math.round(+rect.getAttribute('height')),
        fill: rect.style.fill,
        stroke: rect.style.stroke,
        strokeWidth: rect.style.strokeWidth
    };
}

export function getTranslate(element: SVGElement) {
    const t = element
        ?.getAttribute('transform')
        ?.match(/translate\((\d+(?:\.\d+)?), *(\d+(?:\.\d+)?)\)/);
    if (!t) return [0, 0];
    return [+t[1], +t[2]];
}

export function getPathDims(path: SVGPathElement) {
    const r = makeAbsolute(parseSVG(path.getAttribute('d')));
    const x = r.flatMap((d) => [d.x, d.x0, d.x1]).filter((x) => x != null);
    const y = r.flatMap((d) => [d.y, d.y0, d.y1]).filter((y) => y != null);
    const [tx, ty] = getTranslate(path);
    return {
        x: Math.round(Math.min(...x)) + tx,
        y: Math.round(Math.min(...y)) + ty,
        w: Math.round(Math.max(...x) - Math.min(...x)),
        h: Math.round(Math.max(...y) - Math.min(...y)),
        fill: path.style.fill,
        stroke: path.style.stroke,
        strokeWidth: path.style.strokeWidth
    };
}
