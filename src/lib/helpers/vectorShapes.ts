import { pathRound as path } from 'd3-path';

type D3Path = ReturnType<typeof path>;

export type ShapeRenderer = {
    draw(context: D3Path, l: number, r: number): void;
};

const defaultRadius = 3;
const wingRatio = defaultRadius * 5;

export const shapeArrow: ShapeRenderer = {
    draw(context: D3Path, l: number, r: number) {
        const wing = (l * r) / wingRatio;
        context.moveTo(0, 0);
        context.lineTo(0, -l);
        context.moveTo(-wing, wing - l);
        context.lineTo(0, -l);
        context.lineTo(wing, wing - l);
    }
};

export const shapeSpike: ShapeRenderer = {
    draw(context: D3Path, l: number, r: number) {
        context.moveTo(-r, 0);
        context.lineTo(0, -l);
        context.lineTo(r, 0);
    }
};

export const shapeArrowFilled: ShapeRenderer = {
    draw(context: D3Path, l: number, r: number) {
        const headLength = Math.max(3, l * 0.3);
        const headSpike = headLength * 0.2;
        const headWidth = Math.max(2, l * 0.3);
        const tailWidth = Math.max(2, l * 0.3) * 0.3;

        context.moveTo(0, 0);
        context.lineTo(tailWidth * 0.5, -l + headLength - headSpike);
        context.lineTo(headWidth * 0.5, -l + headLength);
        context.lineTo(0, -l);
        context.lineTo(-headWidth * 0.5, -l + headLength);
        context.lineTo(-tailWidth * 0.5, -l + headLength - headSpike);
        context.closePath();
    }
};

const shapes = new Map<string, ShapeRenderer>([
    ['arrow', shapeArrow],
    ['arrow-filled', shapeArrowFilled],
    ['spike', shapeSpike]
]);

export function isShapeObject(value: unknown): value is ShapeRenderer {
    return value != null && typeof (value as ShapeRenderer).draw === 'function';
}

export function maybeShape(shape: string | ShapeRenderer): ShapeRenderer {
    if (isShapeObject(shape)) return shape;
    const value = shapes.get(`${shape}`.toLowerCase());
    if (value) return value;
    throw new Error(`invalid shape: ${shape}`);
}

export function shapePath(shape: string | ShapeRenderer, l: number, r: number): string {
    const context = path();
    maybeShape(shape).draw(context, l, r);
    return context.toString();
}

export { defaultRadius };
