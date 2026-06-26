type BBox = { x: number; y: number; width: number; height: number };

type AffineMatrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};

function getTextBBox(text: SVGTextElement): BBox | null | 'error' {
    if (typeof text.getBBox !== 'function') {
        return null;
    }

    try {
        const bbox = text.getBBox();
        if (bbox.width > 0 || bbox.height > 0) {
            return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
        }

        const tspans = text.querySelectorAll('tspan');
        if (tspans.length === 0) return null;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const tspan of tspans) {
            const tb = (tspan as SVGTSpanElement).getBBox();
            if (tb.width === 0 && tb.height === 0) continue;
            minX = Math.min(minX, tb.x);
            minY = Math.min(minY, tb.y);
            maxX = Math.max(maxX, tb.x + tb.width);
            maxY = Math.max(maxY, tb.y + tb.height);
        }

        if (!Number.isFinite(minX)) return null;
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } catch {
        return 'error';
    }
}

function transformPoint(matrix: AffineMatrix, x: number, y: number): [number, number] {
    return [
        matrix.a * x + matrix.c * y + matrix.e,
        matrix.b * x + matrix.d * y + matrix.f
    ];
}

function axisAlignedExtent(
    bbox: BBox,
    matrix: AffineMatrix | null,
    axis: 'width' | 'height'
): number {
    const corners: [number, number][] = [
        [bbox.x, bbox.y],
        [bbox.x + bbox.width, bbox.y],
        [bbox.x, bbox.y + bbox.height],
        [bbox.x + bbox.width, bbox.y + bbox.height]
    ];

    const points = matrix
        ? corners.map(([x, y]) => transformPoint(matrix, x, y))
        : corners;

    if (axis === 'width') {
        const xs = points.map(([x]) => x);
        return Math.max(...xs) - Math.min(...xs);
    }

    const ys = points.map(([, y]) => y);
    return Math.max(...ys) - Math.min(...ys);
}

function matrixFromConsolidated(consolidated: { matrix: AffineMatrix } | null): AffineMatrix | null {
    if (!consolidated?.matrix) return null;
    const { a, b, c, d, e, f } = consolidated.matrix;
    if ([a, b, c, d, e, f].every((n) => typeof n === 'number' && Number.isFinite(n))) {
        return { a, b, c, d, e, f };
    }
    return null;
}

function getLocalTransformMatrix(text: SVGTextElement): AffineMatrix | null {
    const consolidated = text.transform?.baseVal?.consolidate?.() ?? null;
    return matrixFromConsolidated(consolidated as { matrix: AffineMatrix } | null);
}

export function measureSvgTextLayoutExtent(
    text: SVGTextElement,
    axis: 'width' | 'height'
): number {
    const bbox = getTextBBox(text);
    if (bbox === 'error') {
        return 0;
    }
    if (bbox) {
        const matrix = getLocalTransformMatrix(text);
        return axisAlignedExtent(bbox, matrix, axis);
    }

    // @vitest-environment jsdom — getBBox unavailable; last-resort viewport geometry
    try {
        const rect = text.getBoundingClientRect();
        return axis === 'width' ? rect.width : rect.height;
    } catch {
        return 0;
    }
}