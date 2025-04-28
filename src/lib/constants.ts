import type { ScaleName, ScaleType, ScaledChannelName } from './types.js';

export const SCALE_TYPES: Record<ScaleName, symbol> = {
    opacity: Symbol('opacity'),
    color: Symbol('color'),
    x: Symbol('position'),
    y: Symbol('position'),
    symbol: Symbol('symbol'),
    r: Symbol('radius'),
    length: Symbol('length'),
    fx: Symbol('fx'),
    fy: Symbol('fy'),
    projection: Symbol('projection')
};

export const SCALES: ScaleName[] = [
    'x',
    'y',
    'color',
    'opacity',
    'symbol',
    'r',
    'length',
    'fx',
    'fy',
    'projection'
];

export const VALID_SCALE_TYPES: Record<ScaleName, Set<ScaleType>> = {
    color: new Set([
        'linear',
        'categorical',
        'ordinal',
        'diverging',
        'quantile',
        'quantize',
        'quantile-cont',
        'threshold',
        'log',
        'symlog',
        'pow',
        'sqrt',
        'diverging-log',
        'diverging-pow',
        'diverging-sqrt',
        'diverging-symlog'
    ]),
    x: new Set([
        'linear',
        'log',
        'symlog',
        'time',
        'ordinal',
        'band',
        'point',
        'quantile',
        'quantize',
        'threshold'
    ]),
    y: new Set([
        'linear',
        'log',
        'symlog',
        'time',
        'ordinal',
        'band',
        'point',
        'quantile',
        'quantize',
        'threshold'
    ])
    // ...
};

/**
 * Map of all scaled channels
 */
export const CHANNEL_SCALE: Record<ScaledChannelName, ScaleName> = {
    x: 'x',
    x1: 'x',
    x2: 'x',
    y: 'y',
    y1: 'y',
    y2: 'y',
    r: 'r',
    length: 'length',
    fx: 'fx',
    fy: 'fy',
    symbol: 'symbol',
    fill: 'color',
    stroke: 'color',
    opacity: 'opacity',
    fillOpacity: 'opacity',
    strokeOpacity: 'opacity'
};

export const CSS_VAR = /^var\(--([a-z-0-9,\s]+)\)$/;
export const CSS_COLOR = /^color\(/;
export const CSS_COLOR_MIX = /^color-mix\(/; // just check for prefix
export const CSS_COLOR_CONTRAST = /^color-contrast\(/; // just check for prefix
export const CSS_RGBA = /^rgba\(/; // just check for prefix
export const CSS_URL = /^url\(#/; // just check for prefix

export const INDEX = Symbol('index');

// export const CHANNEL_MAP: Record<ScaleName, ValueOf<typeof SCALE_TYPES>> = {
// 	x: SCALE_TYPES.x,
// 	y: SCALE_TYPES.y,
// 	opacity: SCALE_TYPES.opacity,
// 	strokeOpacity: SCALE_TYPES.opacity,
// 	strokeWidth: SCALE_TYPES.width,
// 	fillOpacity: SCALE_TYPES.opacity,
// 	stroke: SCALE_TYPES.color,
// 	fill: SCALE_TYPES.color,
// 	r: SCALE_TYPES.radius,
// 	rotate: SCALE_TYPES.angle,
// 	symbol: SCALE_TYPES.symbol
// };
