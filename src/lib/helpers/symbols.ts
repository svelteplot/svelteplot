import {
    symbolAsterisk,
    symbolDiamond2,
    symbolPlus,
    symbolSquare2,
    symbolTriangle2,
    symbolX as symbolTimes,
    symbolCircle,
    symbolCross,
    symbolDiamond,
    symbolSquare,
    symbolStar,
    symbolTriangle,
    symbolWye,
    type SymbolType
} from 'd3-shape';

export const sqrt3 = Math.sqrt(3);
export const sqrt4_3 = 2 / sqrt3;

const symbolHexagon = {
    draw(context: CanvasRenderingContext2D, size: number) {
        const rx = Math.sqrt(size / Math.PI),
            ry = rx * sqrt4_3,
            hy = ry / 2;
        context.moveTo(0, ry);
        context.lineTo(rx, hy);
        context.lineTo(rx, -hy);
        context.lineTo(0, -ry);
        context.lineTo(-rx, -hy);
        context.lineTo(-rx, hy);
        context.closePath();
    }
};

type BuiltinSymbol =
    | 'asterisk'
    | 'circle'
    | 'cross'
    | 'diamond'
    | 'diamond2'
    | 'hexagon'
    | 'plus'
    | 'square'
    | 'square2'
    | 'star'
    | 'times'
    | 'triangle'
    | 'triangle2'
    | 'wye';

const symbols: Map<BuiltinSymbol, SymbolType> = new Map([
    ['asterisk', symbolAsterisk],
    ['circle', symbolCircle],
    ['cross', symbolCross],
    ['diamond', symbolDiamond],
    ['diamond2', symbolDiamond2],
    ['hexagon', symbolHexagon],
    ['plus', symbolPlus],
    ['square', symbolSquare],
    ['square2', symbolSquare2],
    ['star', symbolStar],
    ['times', symbolTimes],
    ['triangle', symbolTriangle],
    ['triangle2', symbolTriangle2],
    ['wye', symbolWye]
]);

function isSymbolObject(value: SymbolType | string): value is SymbolType {
    if (typeof value === 'string') return false;
    return value && typeof value.draw === 'function';
}

export function isSymbol(value: any): value is SymbolType | BuiltinSymbol {
    if (isSymbolObject(value)) return true;
    if (typeof value !== 'string') return false;
    return symbols.has(value.toLowerCase() as BuiltinSymbol);
}

export function maybeSymbol(symbol: SymbolType | string) {
    if (symbol == null || isSymbolObject(symbol)) return symbol;
    const value = symbols.get(`${symbol}`.toLowerCase() as BuiltinSymbol);
    if (value) return value;
    throw new Error(`invalid symbol: ${symbol}`);
}
