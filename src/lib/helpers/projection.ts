import type { GeoPermissibleObjects, GeoStream, GeoStreamWrapper } from 'd3-geo';
import { geoClipRectangle, geoPath, geoTransform } from 'd3-geo';

import { constant, isObject } from './index.js';

const identity = constant({ stream: (stream: GeoStream) => stream });

const defaultAspectRatio = 0.618;

export type Clip = boolean | null | number | 'frame';

type ClipFunction = (s: GeoStream) => GeoStream;

type ProjectionFactory = (options: {
    width: number;
    height: number;
    clip: Clip;
    [key: string]: unknown;
}) => GeoStreamWrapper | null;

type ProjectionOptions = {
    type: ProjectionFactory;
    domain: GeoPermissibleObjects;
    inset: number;
    insetTop: number;
    insetBottom: number;
    insetLeft: number;
    insetRight: number;
    clip: Clip;
};
type Dimensions = {
    width: number;
    height: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
};

export function createProjection(
    {
        projOptions,
        inset: globalInset = 2,
        insetTop = globalInset,
        insetRight = globalInset,
        insetBottom = globalInset,
        insetLeft = globalInset
    }: {
        projOptions?: ProjectionOptions | GeoStreamWrapper;
        inset?: number;
        insetTop?: number;
        insetRight?: number;
        insetBottom?: number;
        insetLeft?: number;
    } = {},
    dimensions: Dimensions
) {
    // no projection defined
    if (projOptions == null) return;
    // projection function passed as projection option
    if ('stream' in projOptions && typeof projOptions.stream === 'function') {
        return projOptions; // d3 projection
    }

    let options: Record<string, unknown> | undefined;
    let domain: GeoPermissibleObjects | undefined;
    let clip: Clip = 'frame';

    // If the projection was specified as an object with additional options,
    // extract those. The order of precedence for insetTop (and other insets) is:
    // projection.insetTop, projection.inset, (global) insetTop, (global) inset.
    // Any other options on this object will be passed through to the initializer.
    let projFactory: ProjectionFactory | undefined;
    if (isObject(projOptions)) {
        let inset;
        let type: ProjectionFactory;

        ({
            type,
            domain,
            inset,
            insetTop = inset !== undefined ? inset : insetTop,
            insetRight = inset !== undefined ? inset : insetRight,
            insetBottom = inset !== undefined ? inset : insetBottom,
            insetLeft = inset !== undefined ? inset : insetLeft,
            clip = clip,
            ...options
        } = projOptions as ProjectionOptions);
        projFactory = type;
        if (projFactory == null) return;
    }

    // let projFactory;
    let aspectRatio: number = defaultAspectRatio;

    // Compute the frame dimensions and invoke the projection initializer.
    const { width, height, marginLeft, marginRight, marginTop, marginBottom } = dimensions;

    const dx = width - marginLeft - marginRight - insetLeft - insetRight;
    const dy = height - marginTop - marginBottom - insetTop - insetBottom;

    const projInstance = projFactory?.({ width: dx, height: dy, clip, ...options });

    // The projection initializer might decide to not use a projection.
    if (projInstance == null) return;
    const clipFn: ClipFunction = maybePostClip(
        clip,
        marginLeft,
        marginTop,
        width - marginRight,
        height - marginBottom
    );

    // Translate the origin to the top-left corner, respecting margins and insets.
    let tx = marginLeft + insetLeft;
    let ty = marginTop + insetTop;
    let transform: { stream: (s: GeoStream) => GeoStream } | undefined;
    let invertTransform: (d: [number, number]) => [number, number] = (d) => d;

    // If a domain is specified, fit the projection to the frame.
    if (domain != null && dx > 0 && dy > 0) {
        const [[x0, y0], [x1, y1]] = geoPath(projInstance).bounds(domain as GeoPermissibleObjects);
        const k = Math.min(dx / (x1 - x0), dy / (y1 - y0));

        aspectRatio = (y1 - y0) / (x1 - x0);
        // aspectRatio = 1/k;
        if (k > 0) {
            tx -= (k * (x0 + x1) - dx) / 2;
            ty -= (k * (y0 + y1) - dy) / 2;
            transform = geoTransform({
                point(x, y) {
                    this.stream.point(x * k + tx, y * k + ty);
                }
            });
            invertTransform = ([x, y]: [number, number]): [number, number] => [
                (x - tx) / k,
                (y - ty) / k
            ];
        } else {
            // eslint-disable-next-line no-console
            console.warn(
                `Warning: the projection could not be fit to the specified domain; using the default scale.`
            );
        }
    } else if (domain != null) {
        // eslint-disable-next-line no-console
        console.warn(
            `Warning: the projection could not be fit to the specified domain; using the default scale.`
        );
    }

    transform ??=
        tx === 0 && ty === 0
            ? identity()
            : geoTransform({
                  point(x, y) {
                      this.stream.point(x + tx, y + ty);
                  }
              });

    invertTransform ??= ([x, y]: [number, number]): [number, number] => [x - tx, y - ty];

    return {
        aspectRatio,
        invert([x, y]: [number, number]) {
            return (projInstance as any).invert(invertTransform([x, y]));
        },
        stream: (s: GeoStream) => projInstance.stream(transform!.stream(clipFn(s)))
    };
}

function maybePostClip(clip: Clip, x1: number, y1: number, x2: number, y2: number): ClipFunction {
    if (clip === false || clip == null || typeof clip === 'number') return (s: GeoStream) => s;
    if (clip === true) clip = 'frame';
    switch (`${clip}`.toLowerCase()) {
        case 'frame':
            return geoClipRectangle(x1, y1, x2, y2);
        default:
            throw new Error(`unknown projection clip type: ${clip}`);
    }
}
