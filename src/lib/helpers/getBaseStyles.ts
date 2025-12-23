import type { Channels } from '$lib/types/index.js';
import type { MarkStyleProps, DataRow } from '$lib/types/index.js';
import { resolveProp } from './resolve.js';

/**
 * all style props that can be applied via channels but
 * are not scaled
 */
const styleProps: Partial<Record<MarkStyleProps, string | null>> = {
    strokeWidth: 'stroke-width',
    strokeDasharray: 'stroke-dasharray',
    strokeLinejoin: 'stroke-linejoin',
    strokeLinecap: 'stroke-linecap',
    blend: 'mix-blend-mode',
    clipPath: 'clip-path',
    mask: 'mask',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontStyle: 'font-style',
    fontWeight: 'font-weight',
    textAnchor: 'text-anchor',
    fontVariant: 'font-variant',
    letterSpacing: 'letter-spacing',
    textDecoration: 'text-decoration',
    textTransform: 'text-transform',
    wordSpacing: 'word-spacing',
    cursor: 'cursor',
    pointerEvents: 'pointer-events'
};

const styleDefaults: Partial<Record<MarkStyleProps, string | null>> = {
    fontWeight: 'normal'
};

export function getBaseStylesObject<T>(datum: T, props: Partial<Channels<T>>) {
    return Object.fromEntries(
        (Object.entries(styleProps) as [MarkStyleProps, string][])
            .filter(([key, cssKey]) => cssKey && props[key] != null)
            .map(([key, cssKey]) => [
                cssKey,
                maybeToPixel(
                    cssKey,
                    (resolveProp(props[key] as any, datum as T, styleDefaults[key] || null) ??
                        '') as string | number
                )
            ])
    );
}

export default function <T>(datum: T, props: Partial<Channels<T>>) {
    return Object.entries(getBaseStylesObject(datum, props))
        .map(([key, value]) => `${key}: ${value}`)
        .join(';');
}

export function maybeToPixel(cssKey: string, value: string | number) {
    if (cssKey === 'font-size' || cssKey === 'stroke-width') {
        return typeof value === 'number' ? `${value}px` : value;
    }
    return value;
}

export function maybeFromPixel(value: string | number) {
    return typeof value === 'string' && value.endsWith('px') ? +value.slice(0, -2) : value;
}

export function maybeFromRem(value: string | number, rootFontSize: number = 16) {
    return typeof value === 'string' && value.endsWith('rem')
        ? +value.slice(0, -3) * rootFontSize
        : value;
}

let nextClipId = 0;
let nextPatternId = 0;

export function getClipId() {
    return `svp-clip-${++nextClipId}`;
}

export function getPatternId() {
    return `svp-pattern-${++nextPatternId}`;
}
