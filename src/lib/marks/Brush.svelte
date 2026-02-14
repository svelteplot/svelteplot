<!--
    @component
    For creating a two-dimensional brush selection
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface BrushMarkProps extends Pick<
        BaseMarkProps<Datum>,
        | 'cursor'
        | 'stroke'
        | 'strokeDasharray'
        | 'strokeOpacity'
        | 'strokeWidth'
        | 'strokeLinecap'
        | 'strokeDashoffset'
        | 'strokeLinejoin'
        | 'strokeMiterlimit'
    > {
        /** the brush state object (bindable); contains x1, x2, y1, y2, and enabled */
        brush: Brush;
        /**
         * limit brushing to x or y dimension
         */
        limitDimension?: false | 'x' | 'y';
        /**
         * whether brush can move/resize outside domain
         */
        constrainToDomain?: boolean;
        /**
         * size of the (invisible) drag resize area around the edges of the brush selection
         */
        resizeHandleSize?: number;
        /** called when the user starts dragging to create or move a brush */
        onbrushstart?: (evt: BrushEvent) => void;
        /** called when the user finishes dragging the brush */
        onbrushend?: (evt: BrushEvent) => void;
        /** called continuously while the user is dragging the brush */
        onbrush?: (evt: BrushEvent) => void;
    }
    import { getContext, untrack } from 'svelte';
    import Rect from './Rect.svelte';
    import type { BaseMarkProps, DataRecord } from 'svelteplot/types/index.js';
    import { clientToLayerCoordinates } from './helpers/events.js';
    import Frame from './Frame.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let { brush: brushExternal = $bindable({ enabled: false }), ...markProps }: BrushMarkProps =
        $props();

    let brush = $state<Brush>(brushExternal);

    const DEFAULTS = {
        stroke: 'currentColor',
        strokeDasharray: '2,3',
        strokeOpacity: 0.6,
        resizeHandleSize: 10,
        constrainToDomain: false,
        ...getPlotDefaults().brush
    };

    type Brush = {
        x1?: number | Date;
        x2?: number | Date;
        y1?: number | Date;
        y2?: number | Date;
        enabled: boolean;
    };

    type BrushEvent = MouseEvent & { brush: Brush };

    const {
        data = [{} as Datum],
        stroke,
        strokeWidth,
        strokeDasharray,
        strokeOpacity,
        strokeLinecap,
        strokeDashoffset,
        strokeLinejoin,
        strokeMiterlimit,
        cursor: forceCursor,
        limitDimension = false,
        constrainToDomain,
        resizeHandleSize,
        onbrushstart,
        onbrushend,
        onbrush
    }: BrushMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const xScaleFn = $derived(plot.scales.x.fn);
    const yScaleFn = $derived(plot.scales.y.fn);

    const xDomain = $derived(plot.scales.x.domain) as [number, number] | [Date, Date];
    const xRange = $derived(plot.scales.x.range) as [number, number];
    const yDomain = $derived(plot.scales.y.domain) as [number, number] | [Date, Date];
    const yRange = $derived(plot.scales.y.range) as [number, number];

    $effect(() => {
        if (limitDimension !== 'y' && !xScaleFn.invert) {
            throw new Error('brushing does not work with band/point scales');
        }
        if (limitDimension !== 'x' && !yScaleFn.invert) {
            throw new Error('brushing does not work with band/point scales');
        }
    });

    let x1 = $state(brush.x1 as Date | number);
    let x2 = $state(brush.x2 as Date | number);
    let y1 = $state(brush.y1 as Date | number);
    let y2 = $state(brush.y2 as Date | number);

    type ActionType =
        | 'move'
        | 'draw'
        | 'n-resize'
        | 's-resize'
        | 'w-resize'
        | 'e-resize'
        | 'ne-resize'
        | 'nw-resize'
        | 'se-resize'
        | 'sw-resize'
        | false;

    let dragging = false;
    let action: ActionType = $state(false);

    let dragStart: [number, number];

    let pxPointer = $state([0, 0]);

    const pxBrush = $derived({
        x1: xScaleFn(brush.x1 as Date | number),
        x2: xScaleFn(brush.x2 as Date | number),
        y1: yScaleFn(brush.y1 as Date | number),
        y2: yScaleFn(brush.y2 as Date | number)
    });

    const HALF_EDGE = $derived(resizeHandleSize * 0.5);

    const isInsideBrush = $derived(
        (limitDimension === 'y' || pxPointer[0] > pxBrush.x1 + HALF_EDGE) &&
            (limitDimension === 'y' || pxPointer[0] < pxBrush.x2 - HALF_EDGE) &&
            (limitDimension === 'x' || pxPointer[1] > pxBrush.y2 + HALF_EDGE) &&
            (limitDimension === 'x' || pxPointer[1] < pxBrush.y1 - HALF_EDGE)
    );

    const isXEdge: false | 'left' | 'right' = $derived(
        pxPointer[0] > pxBrush.x1 - HALF_EDGE && pxPointer[0] < pxBrush.x1 + HALF_EDGE
            ? 'left'
            : pxPointer[0] > pxBrush.x2 - HALF_EDGE && pxPointer[0] < pxBrush.x2 + HALF_EDGE
              ? 'right'
              : false
    );
    const isYEdge: false | 'top' | 'bottom' = $derived(
        pxPointer[1] > pxBrush.y1 - HALF_EDGE && pxPointer[1] < pxBrush.y1 + HALF_EDGE
            ? 'top'
            : pxPointer[1] > pxBrush.y2 - HALF_EDGE && pxPointer[1] < pxBrush.y2 + HALF_EDGE
              ? 'bottom'
              : false
    );

    const CURSOR_MAP = { left: 'w', right: 'e', top: 's', bottom: 'n' };

    const cursor = $derived(
        forceCursor
            ? forceCursor
            : action
              ? action === 'draw'
                  ? 'crosshair'
                  : action
              : brush.enabled && isInsideBrush
                ? 'move'
                : brush.enabled && (isXEdge || isYEdge)
                  ? `${[isYEdge, isXEdge]
                        .filter((d) => !!d)
                        .map((c) => CURSOR_MAP[c])
                        .join('')}-resize`
                  : 'crosshair'
    );

    $effect(() => {
        // update brush prop when internal state changes
        brush.x1 =
            !brush.enabled || limitDimension === 'y'
                ? undefined
                : constrain((x1 < x2 ? x1 : x2) as Date | number, xDomain);
        brush.x2 =
            !brush.enabled || limitDimension === 'y'
                ? undefined
                : constrain(x1 > x2 ? x1 : x2, xDomain);
        brush.y1 =
            !brush.enabled || limitDimension === 'x'
                ? undefined
                : constrain(y1 < y2 ? y1 : y2, yDomain);
        brush.y2 =
            !brush.enabled || limitDimension === 'x'
                ? undefined
                : constrain(y1 > y2 ? y1 : y2, yDomain);
    });

    // update internal state when external brush prop changes
    $effect(() => {
        const brushInt = untrack(() => brush);
        if (!brushIdentical(brushInt, brushExternal)) {
            brush = brushExternal;
            // also keep internal x1,x2,y1,y2 in sync
            x1 = brush.x1 as Date | number;
            x2 = brush.x2 as Date | number;
            y1 = brush.y1 as Date | number;
            y2 = brush.y2 as Date | number;
        }
    });

    // update external brush when internal state changes
    $effect(() => {
        const brushExt = untrack(() => brushExternal);
        if (!brushIdentical(brush, brushExt)) {
            // avoid cycles
            brushExternal = brush;
        }
    });

    function brushIdentical(b1: Brush, b2: Brush) {
        return (
            b1.enabled === b2.enabled &&
            b1.x1 === b2.x1 &&
            b1.x2 === b2.x2 &&
            b1.y1 === b2.y1 &&
            b1.y2 === b2.y2
        );
    }

    function constrain<T extends number | Date>(x: T, extent: [typeof x, typeof x]) {
        const minE = extent[0] < extent[1] ? extent[0] : extent[1];
        const maxE = extent[0] > extent[1] ? extent[0] : extent[1];
        if (x < minE) return minE;
        if (x > maxE) return maxE;
        return x;
    }

    const DRAG_MIN_DISTANCE = 5;

    /**
     * fallback to clientX/clientY to support basic user event testing
     */
    function getLayerPos(e: MouseEvent): [number, number] {
        // Use the clientToLayerCoordinates helper function
        return clientToLayerCoordinates(e, plot.body);
    }

    $effect(() => {
        plot.body?.ownerDocument.body.addEventListener('pointerup', onpointerup);
        plot.body?.ownerDocument.body.addEventListener('pointermove', onpointermove);

        return () => {
            plot.body?.ownerDocument.body.removeEventListener('pointerup', onpointerup);
            plot.body?.ownerDocument.body.removeEventListener('pointermove', onpointermove);
        };
    });

    function onpointerdown(e: MouseEvent) {
        dragging = true;
        dragStart = getLayerPos(e);
        pxPointer = getLayerPos(e);

        if (brush.enabled && isInsideBrush) {
            // drag starts inside existing brush, if so, move the brush
            action = 'move';
        } else if (brush.enabled && (isXEdge || isYEdge)) {
            // drag starts on a brush edge, so resize the brush
            action = `${[isYEdge, isXEdge]
                .filter((d) => !!d)
                .map((c) => CURSOR_MAP[c])
                .join('')}-resize` as ActionType;
        } else {
            // draw new brush selection
            action = 'draw';
            if (typeof xScaleFn.invert === 'function' && limitDimension !== 'y') {
                x1 = x2 = xScaleFn.invert(dragStart[0]);
            }
            if (typeof yScaleFn.invert === 'function' && limitDimension !== 'x') {
                y1 = y2 = yScaleFn.invert(dragStart[1]);
            }
        }
        onbrushstart?.({ ...e, brush });
    }

    const EAST: Set<ActionType> = new Set(['e-resize', 'ne-resize', 'se-resize']);
    const WEST: Set<ActionType> = new Set(['w-resize', 'nw-resize', 'sw-resize']);
    const NORTH: Set<ActionType> = new Set(['n-resize', 'ne-resize', 'nw-resize']);
    const SOUTH: Set<ActionType> = new Set(['s-resize', 'se-resize', 'sw-resize']);

    function onpointermove(e: MouseEvent) {
        const newPos = getLayerPos(e);

        if (dragging) {
            let px = newPos[0] - pxPointer[0];
            let py = newPos[1] - pxPointer[1];

            if (constrainToDomain) {
                if (action === 'move') {
                    // limit selection movement
                    px = constrain(px, [xRange[0] - pxBrush.x1, xRange[1] - pxBrush.x2]);
                    py = constrain(py, [yRange[0] - pxBrush.y1, yRange[1] - pxBrush.y2]);
                } else if (action !== 'draw') {
                    // limit horizontal resizing
                    if (EAST.has(action)) {
                        px = constrain(px, [xRange[0] - pxBrush.x2, xRange[1] - pxBrush.x2]);
                    } else if (WEST.has(action)) {
                        px = constrain(px, [xRange[0] - pxBrush.x1, xRange[1] - pxBrush.x1]);
                    }
                    // limit vertical resizing
                    if (NORTH.has(action)) {
                        py = constrain(py, [yRange[0] - pxBrush.y2, yRange[1] - pxBrush.y2]);
                    } else if (SOUTH.has(action)) {
                        py = constrain(py, [yRange[0] - pxBrush.y1, yRange[1] - pxBrush.y1]);
                    }
                }
            }

            const hasX = limitDimension !== 'y';
            const hasY = limitDimension !== 'x';

            const dx1 = !hasX ? 0 : xScaleFn.invert(xScaleFn(x1) + px);
            const dx2 = !hasX ? 0 : xScaleFn.invert(xScaleFn(x2) + px);
            const dy1 = !hasY ? 0 : yScaleFn.invert(yScaleFn(y1) + py);
            const dy2 = !hasY ? 0 : yScaleFn.invert(yScaleFn(y2) + py);

            if (action === 'move') {
                // move edges
                x1 = dx1;
                x2 = dx2;
                y1 = dy1;
                y2 = dy2;
            } else if (action === 'draw') {
                x2 = !hasX ? 0 : xScaleFn.invert(newPos[0]);
                y2 = !hasY ? 0 : yScaleFn.invert(newPos[1]);

                if (constrainToDomain) {
                    x2 = constrain(x2, xDomain as [typeof x2, typeof x2]);
                    y2 = constrain(y2, yDomain as [typeof y2, typeof y2]);
                }
            } else {
                if (EAST.has(action)) {
                    x2 = dx2;
                } else if (WEST.has(action)) {
                    x1 = dx1;
                }
                if (NORTH.has(action)) {
                    y2 = dy2;
                } else if (SOUTH.has(action)) {
                    y1 = dy1;
                }

                // if the user drag-resizes a brush edge over the opposite edge we need to
                // flip the coordinates and invert the resize action name

                [x1, x2, action] = swapIfNeeded(x1, x2, action, 'e', 'w');
                [y1, y2, action] = swapIfNeeded(y1, y2, action, 'n', 's');
            }

            const dist = Math.sqrt(
                (dragStart[0] - pxPointer[0]) ** 2 + (dragStart[1] - pxPointer[1]) ** 2
            );
            if (dist > DRAG_MIN_DISTANCE) brush.enabled = true;
            onbrush?.({ ...e, brush });

            pxPointer = [pxPointer[0] + px, pxPointer[1] + py];
        } else {
            pxPointer = getLayerPos(e);
        }
    }

    function swapIfNeeded(
        v1: number | Date,
        v2: number | Date,
        action: ActionType,
        swapDir1: string,
        swapDir2: string
    ) {
        if (action && v2 < v1) {
            return [
                v2,
                v1,
                `${action.split('-')[0].replace(swapDir1, 'X').replace(swapDir2, swapDir1).replace('X', swapDir2)}-resize` as ActionType
            ];
        }
        return [v1, v2, action];
    }

    function onpointerup(e: MouseEvent) {
        if (dragging) {
            dragging = false;
            action = false;

            brush.enabled =
                Math.sqrt((dragStart[0] - pxPointer[0]) ** 2 + (dragStart[1] - pxPointer[1]) ** 2) >
                DRAG_MIN_DISTANCE;
            onbrushend?.({ ...e, brush });
        }
    }
</script>

{#if stroke && brush.enabled}
    <Rect
        class="brush-rect"
        {...limitDimension === 'x' ? {} : { y1: brush.y1, y2: brush.y2 }}
        {...limitDimension === 'y' ? {} : { x1: brush.x1, x2: brush.x2 }}
        {stroke}
        {strokeDasharray}
        {strokeOpacity}
        {strokeDashoffset}
        {strokeLinecap}
        {strokeLinejoin}
        {strokeMiterlimit}
        {strokeWidth} />
{/if}
<Frame
    fill="transparent"
    stroke="transparent"
    inset={-20}
    {cursor}
    {onpointerdown}
    {onpointermove} />
