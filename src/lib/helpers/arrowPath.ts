/**
 * @license
 * Copyright 2020-2023 Observable, Inc.
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 */

import { ascending, descending } from 'd3-array';
const RADIANS = Math.PI / 180;

export function arrowPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    insetStart: number,
    insetEnd: number,
    headAngle: number,
    headLength: number,
    bend: number,
    strokeWidth: number,
    sweep: SweepFunc
) {
    // The angle between the arrow’s shaft and one of the wings; the “head”
    // angle between the wings is twice this value.
    const wingAngle = (headAngle * RADIANS) / 2;

    // The length of the arrowhead’s “wings” (the line segments that extend from
    // the end point) relative to the stroke width.
    const wingScale = headLength / 1.5;

    // The start ⟨x1,y1⟩ and end ⟨x2,y2⟩ points may be inset, and the
    // ending line angle may be altered for inset swoopy arrows.
    const lineLength = Math.hypot(x2 - x1, y2 - y1);
    if (lineLength <= insetStart + insetEnd) return null;
    let lineAngle = Math.atan2(y2 - y1, x2 - x1);

    // We don’t allow the wing length to be too large relative to the
    // length of the arrow. (Plot.vector allows arbitrarily large
    // wings, but that’s okay since vectors are usually small.)
    const headLength_ = Math.min(wingScale * strokeWidth, lineLength / 3);

    // When bending, the offset between the straight line between the two points
    // and the outgoing tangent from the start point. (Also the negative
    // incoming tangent to the end point.) This must be within ±π/2. A positive
    // angle will produce a clockwise curve; a negative angle will produce a
    // counterclockwise curve; zero will produce a straight line.
    const bendAngle = sweep(x1, y1, x2, y2) * bend * RADIANS;

    // The radius of the circle that intersects with the two endpoints
    // and has the specified bend angle.
    const r = Math.hypot(lineLength / Math.tan(bendAngle), lineLength) / 2;

    // Apply insets.
    if (insetStart || insetEnd) {
        if (r < 1e5) {
            // For inset swoopy arrows, compute the circle-circle
            // intersection between a circle centered around the
            // respective arrow endpoint and the center of the circle
            // segment that forms the shaft of the arrow.
            const sign = Math.sign(bendAngle);
            const [cx, cy] = pointPointCenter([x1, y1], [x2, y2], r, sign);
            if (insetStart) {
                [x1, y1] = circleCircleIntersect(
                    [cx, cy, r],
                    [x1, y1, insetStart],
                    -sign * Math.sign(insetStart)
                );
            }
            // For the end inset, rotate the arrowhead so that it aligns
            // with the truncated end of the arrow. Since the arrow is a
            // segment of the circle centered at ⟨cx,cy⟩, we can compute
            // the angular difference to the new endpoint.
            if (insetEnd) {
                const [x, y] = circleCircleIntersect(
                    [cx, cy, r],
                    [x2, y2, insetEnd],
                    sign * Math.sign(insetEnd)
                );
                lineAngle += Math.atan2(y - cy, x - cx) - Math.atan2(y2 - cy, x2 - cx);
                ((x2 = x), (y2 = y));
            }
        } else {
            // For inset straight arrows, offset along the straight line.
            const dx = x2 - x1,
                dy = y2 - y1,
                d = Math.hypot(dx, dy);
            if (insetStart) ((x1 += (dx / d) * insetStart), (y1 += (dy / d) * insetStart));
            if (insetEnd) ((x2 -= (dx / d) * insetEnd), (y2 -= (dy / d) * insetEnd));
        }
    }

    // The angle of the arrow as it approaches the endpoint, and the
    // angles of the adjacent wings. Here “left” refers to if the
    // arrow is pointing up.
    const endAngle = lineAngle + bendAngle;
    const leftAngle = endAngle + wingAngle;
    const rightAngle = endAngle - wingAngle;

    // The endpoints of the two wings.
    const x3 = x2 - headLength_ * Math.cos(leftAngle);
    const y3 = y2 - headLength_ * Math.sin(leftAngle);
    const x4 = x2 - headLength_ * Math.cos(rightAngle);
    const y4 = y2 - headLength_ * Math.sin(rightAngle);

    // If the radius is very large (or even infinite, as when the bend
    // angle is zero), then render a straight line.
    const a = r < 1e5 ? `A${r},${r} 0,0,${bendAngle > 0 ? 1 : 0} ` : `L`;
    const h = headLength_ ? `M${x3},${y3}L${x2},${y2}L${x4},${y4}` : '';
    return `M${x1},${y1}${a}${x2},${y2}${h}`;
}

// Returns the center of a circle that goes through the two given points ⟨ax,ay⟩
// and ⟨bx,by⟩ and has radius r. There are two such points; use the sign +1 or
// -1 to choose between them. Returns [NaN, NaN] if r is too small.
function pointPointCenter(
    [ax, ay]: [number, number],
    [bx, by]: [number, number],
    r: number,
    sign: number
) {
    const dx = bx - ax,
        dy = by - ay,
        d = Math.hypot(dx, dy);
    const k = (sign * Math.sqrt(r * r - (d * d) / 4)) / d;
    return [(ax + bx) / 2 - dy * k, (ay + by) / 2 + dx * k];
}

// Given two circles, one centered at ⟨ax,ay⟩ with radius ar, and the other
// centered at ⟨bx,by⟩ with radius br, returns a point at which the two circles
// intersect. There are typically two such points; use the sign +1 or -1 to
// chose between them. Returns [NaN, NaN] if there is no intersection.
// https://mathworld.wolfram.com/Circle-CircleIntersection.html
function circleCircleIntersect(
    [ax, ay, ar]: [number, number, number],
    [bx, by, br]: [number, number, number],
    sign: number
) {
    const dx = bx - ax,
        dy = by - ay,
        d = Math.hypot(dx, dy);
    const x = (dx * dx + dy * dy - br * br + ar * ar) / (2 * d);
    const y = sign * Math.sqrt(ar * ar - x * x);
    return [ax + (dx * x + dy * y) / d, ay + (dy * x - dx * y) / d];
}

export function constant<T>(x: T) {
    return () => x;
}

export type SweepFunc = (x1: number, y1: number, x2: number, y2: number) => number;

// Validates the specified required string against the allowed list of keywords.
export function keyword(input: string, name: string, allowed: string[]) {
    const i = `${input}`.toLowerCase();
    if (!allowed.includes(i)) throw new Error(`invalid ${name}: ${input}`);
    return i;
}

export type SweepOption = 1 | 0 | -1 | '+x' | '-x' | '+y' | '-y' | SweepFunc;

export function maybeSweep(sweep: SweepOption = 1): SweepFunc | undefined {
    if (typeof sweep === 'number') return constant(Math.sign(sweep));
    if (typeof sweep === 'function')
        return (x1: number, y1: number, x2: number, y2: number) => Math.sign(sweep(x1, y1, x2, y2));
    switch (keyword(sweep, 'sweep', ['+x', '-x', '+y', '-y'])) {
        case '+x':
            return (x1, y1, x2) => ascending(x1, x2);
        case '-x':
            return (x1, y1, x2) => descending(x1, x2);
        case '+y':
            return (x1, y1, x2, y2) => ascending(y1, y2);
        case '-y':
            return (x1, y1, x2, y2) => descending(y1, y2);
    }
}
