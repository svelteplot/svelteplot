<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface TextCanvasProps<Datum> {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            x?: ChannelAccessor<Datum>;
            y?: ChannelAccessor<Datum>;
            text: ConstantAccessor<string | null | false | undefined, Datum>;
            title?: ConstantAccessor<string, Datum>;
            fontFamily?: ConstantAccessor<CSS.Property.FontFamily, Datum>;
            fontSize?: ConstantAccessor<CSS.Property.FontSize | number, Datum>;
            fontWeight?: ConstantAccessor<CSS.Property.FontWeight, Datum>;
            fontStyle?: ConstantAccessor<CSS.Property.FontStyle, Datum>;
            fontVariant?: ConstantAccessor<CSS.Property.FontVariant, Datum>;
            letterSpacing?: ConstantAccessor<CSS.Property.LetterSpacing, Datum>;
            wordSpacing?: ConstantAccessor<CSS.Property.WordSpacing, Datum>;
            textTransform?: ConstantAccessor<CSS.Property.TextTransform, Datum>;
            textDecoration?: ConstantAccessor<CSS.Property.TextDecoration, Datum>;
            textAnchor?: ConstantAccessor<CSS.Property.TextAnchor, Datum>;
            lineAnchor?: ConstantAccessor<'bottom' | 'top' | 'middle'>;
            lineHeight?: ConstantAccessor<number, Datum>;
            frameAnchor?: ConstantAccessor<
                | 'bottom'
                | 'top'
                | 'left'
                | 'right'
                | 'top-left'
                | 'bottom-left'
                | 'top-right'
                | 'bottom-right'
                | 'middle',
                Datum
            >;
            rotate?: ConstantAccessor<number, Datum>;
        };
        usedScales: UsedScales;
    }

    import type * as CSS from 'csstype';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import type {
        BaseMarkProps,
        ChannelAccessor,
        ConstantAccessor,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import { CSS_VAR } from 'svelteplot/constants';
    import { maybeFromPixel, maybeFromRem } from 'svelteplot/helpers/getBaseStyles';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';

    const plot = usePlot();

    const LINE_ANCHOR = {
        bottom: 'alphabetic',
        middle: 'middle',
        top: 'hanging'
    } as const;

    const DEFAULT_TEXT_OPTIONS = {
        strokeWidth: 1.6
    } as const;

    let { data, options, usedScales }: TextCanvasProps<Datum> = $props();

    function maybeOpacity(value: unknown) {
        return value == null ? 1 : +value;
    }

    function normalizeTextAlign(value: unknown): CanvasTextAlign {
        if (value === 'end' || value === 'right') return 'right';
        if (value === 'middle' || value === 'center') return 'center';
        return 'left';
    }

    function normalizeLineCap(value: unknown): CanvasLineCap {
        return value === 'round' || value === 'square' || value === 'butt' ? value : 'butt';
    }

    function normalizeLineJoin(value: unknown): CanvasLineJoin {
        return value === 'round' || value === 'bevel' || value === 'miter' ? value : 'miter';
    }

    function normalizeLineAnchor(value: unknown): 'bottom' | 'middle' | 'top' {
        return value === 'top' || value === 'bottom' || value === 'middle' ? value : 'middle';
    }

    function toPixels(value: unknown, canvas: HTMLCanvasElement, fallback = 12): number {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value !== 'string') return fallback;

        const raw = value.trim();
        if (!raw) return fallback;

        const fromVar = CSS_VAR.exec(raw);
        const resolved = fromVar
            ? getComputedStyle(canvas).getPropertyValue(`--${fromVar[1]}`).trim()
            : raw;

        const rootFontSize = maybeFromPixel(
            getComputedStyle(canvas.ownerDocument.documentElement).fontSize
        );
        const maybeRem = maybeFromRem(resolved, Number(rootFontSize));
        const maybePx = maybeFromPixel(maybeRem);
        const numeric =
            typeof maybePx === 'number'
                ? maybePx
                : Number.isFinite(+maybePx)
                  ? +maybePx
                  : parseFloat(resolved);

        return Number.isFinite(numeric) ? numeric : fallback;
    }

    function toFontSize(value: unknown, canvas: HTMLCanvasElement, fallback = 12) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return { css: `${value}px`, numeric: value };
        }
        if (typeof value !== 'string') {
            return { css: `${fallback}px`, numeric: fallback };
        }

        const raw = value.trim();
        if (!raw) return { css: `${fallback}px`, numeric: fallback };

        const fromVar = CSS_VAR.exec(raw);
        const resolved = fromVar
            ? getComputedStyle(canvas).getPropertyValue(`--${fromVar[1]}`).trim()
            : raw;
        const numeric = toPixels(resolved, canvas, fallback);
        const css = /^\d+(?:\.\d+)?$/.test(resolved) ? `${resolved}px` : resolved;

        return {
            css: css || `${fallback}px`,
            numeric
        };
    }

    function textTransform(line: string, transform: unknown) {
        if (transform === 'uppercase') return line.toUpperCase();
        if (transform === 'lowercase') return line.toLowerCase();
        if (transform === 'capitalize') {
            return line.replace(/\b[a-z]/gi, (letter) => letter.toUpperCase());
        }
        return line;
    }

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                const inheritedFontStyles = getComputedStyle(
                    (canvas.parentElement?.parentElement as Element) || plot.body || canvas
                );
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const datum of data) {
                    if (!datum.valid) continue;

                    const frameAnchor = resolveProp(
                        options.frameAnchor,
                        datum.datum as any,
                        'middle'
                    );
                    const isLeft =
                        frameAnchor === 'left' ||
                        frameAnchor === 'top-left' ||
                        frameAnchor === 'bottom-left';
                    const isRight =
                        frameAnchor === 'right' ||
                        frameAnchor === 'top-right' ||
                        frameAnchor === 'bottom-right';
                    const isTop =
                        frameAnchor === 'top' ||
                        frameAnchor === 'top-left' ||
                        frameAnchor === 'top-right';
                    const isBottom =
                        frameAnchor === 'bottom' ||
                        frameAnchor === 'bottom-left' ||
                        frameAnchor === 'bottom-right';

                    const x =
                        options.x != null
                            ? datum.x
                            : (isLeft
                                  ? plot.options.marginLeft
                                  : isRight
                                    ? plot.options.marginLeft + plot.facetWidth
                                    : plot.options.marginLeft + plot.facetWidth * 0.5) +
                              (datum.dx ?? 0);
                    const y =
                        options.y != null
                            ? datum.y
                            : (isTop
                                  ? plot.options.marginTop
                                  : isBottom
                                    ? plot.options.marginTop + plot.facetHeight
                                    : plot.options.marginTop + plot.facetHeight * 0.5) +
                              (datum.dy ?? 0);

                    if (x == null || y == null) continue;

                    const lineAnchor = normalizeLineAnchor(
                        resolveProp(
                            options.lineAnchor,
                            datum.datum as any,
                            options.y != null
                                ? 'middle'
                                : isTop
                                  ? 'top'
                                  : isBottom
                                    ? 'bottom'
                                    : 'middle'
                        )
                    );
                    const defaultTextAnchor = isLeft ? 'start' : isRight ? 'end' : 'middle';
                    const styleProps = resolveScaledStyleProps(
                        datum.datum as any,
                        {
                            ...DEFAULT_TEXT_OPTIONS,
                            textAnchor: defaultTextAnchor,
                            ...options
                        },
                        usedScales,
                        plot,
                        'fill'
                    ) as Record<string, unknown>;

                    const inheritedFontSize = inheritedFontStyles.fontSize || '12px';
                    const { css: fontSize, numeric: fontSizePx } = toFontSize(
                        styleProps['font-size'] ?? inheritedFontSize,
                        canvas,
                        toPixels(inheritedFontSize, canvas, 12)
                    );
                    const fontStyle = String(
                        styleProps['font-style'] || inheritedFontStyles.fontStyle || 'normal'
                    );
                    const fontVariant = String(
                        styleProps['font-variant'] || inheritedFontStyles.fontVariant || 'normal'
                    );
                    const fontWeight = String(
                        styleProps['font-weight'] || inheritedFontStyles.fontWeight || 'normal'
                    );
                    const fontFamily = String(
                        styleProps['font-family'] || inheritedFontStyles.fontFamily || 'sans-serif'
                    );
                    const textTransformValue =
                        styleProps['text-transform'] || inheritedFontStyles.textTransform || 'none';
                    const lineHeightAccessor = options.lineHeight;
                    const rotateAccessor = options.rotate;
                    const lineHeight = Number(
                        resolveProp<number, Datum>(lineHeightAccessor, datum.datum, 1.2)
                    );
                    const rotate =
                        (Number(resolveProp<number, Datum>(rotateAccessor, datum.datum, 0)) *
                            Math.PI) /
                        180;

                    const textLines = String(resolveProp(options.text, datum.datum as any, ''))
                        .split('\n')
                        .map((line) => textTransform(line, textTransformValue));

                    const multilineOffset =
                        textLines.length > 1
                            ? (lineAnchor === 'bottom'
                                  ? textLines.length - 1
                                  : lineAnchor === 'middle'
                                    ? (textLines.length - 1) * 0.5
                                    : 0) *
                              fontSizePx *
                              lineHeight
                            : 0;

                    const opacity = maybeOpacity(styleProps['opacity']);
                    const fillOpacity = maybeOpacity(styleProps['fill-opacity']);
                    const strokeOpacity = maybeOpacity(styleProps['stroke-opacity']);

                    const fillValue = String(styleProps.fill || 'currentColor');
                    const strokeValue = String(styleProps.stroke || 'none');

                    const fill = resolveColor(fillValue, canvas);
                    const stroke = resolveColor(strokeValue, canvas);
                    const strokeWidth = toPixels(styleProps['stroke-width'], canvas, 1.6);

                    context.save();
                    context.translate(Math.round(x), Math.round(y - multilineOffset));
                    context.rotate(rotate);

                    context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
                    context.textAlign = normalizeTextAlign(styleProps['text-anchor']);
                    context.textBaseline = LINE_ANCHOR[lineAnchor];
                    context.lineWidth = strokeWidth;
                    context.lineCap = normalizeLineCap(styleProps['stroke-linecap']);
                    context.lineJoin = normalizeLineJoin(styleProps['stroke-linejoin']);

                    for (let index = 0; index < textLines.length; index += 1) {
                        const line = textLines[index];
                        const yOffset = index ? fontSizePx * lineHeight * index : 0;

                        if (stroke && stroke !== 'none') {
                            context.strokeStyle = stroke;
                            context.globalAlpha = opacity * strokeOpacity;
                            context.strokeText(line, 0, yOffset);
                        }

                        if (fill && fill !== 'none') {
                            context.fillStyle = fill;
                            context.globalAlpha = opacity * fillOpacity;
                            context.fillText(line, 0, yOffset);
                        }
                    }

                    context.restore();
                }
            }

            return () => {
                context?.clearRect(
                    0,
                    0,
                    plot.width * (devicePixelRatio.current ?? 1),
                    plot.height * (devicePixelRatio.current ?? 1)
                );
            };
        });
    };
</script>

<CanvasLayer {@attach render} />
