import { sum } from 'd3-array';

// Per-character width table for a typical proportional font.
// This is not perfect for all fonts, but is better than treating
// all characters as equal width. Set `monospace = true` to bypass.
const CHAR_W: Record<string, number> = {
    A: 7,
    a: 7,
    B: 8,
    b: 7,
    C: 8,
    c: 6,
    D: 9,
    d: 7,
    E: 7,
    e: 7,
    F: 7,
    f: 4,
    G: 9,
    g: 7,
    H: 9,
    h: 7,
    I: 3,
    i: 3,
    J: 5,
    j: 3,
    K: 8,
    k: 6,
    L: 7,
    l: 3,
    M: 11,
    m: 11,
    N: 9,
    n: 7,
    O: 9,
    o: 7,
    P: 8,
    p: 7,
    Q: 9,
    q: 7,
    R: 8,
    r: 4,
    S: 8,
    s: 6,
    T: 7,
    t: 4,
    U: 9,
    u: 7,
    V: 7,
    v: 6,
    W: 11,
    w: 9,
    X: 7,
    x: 6,
    Y: 7,
    y: 6,
    Z: 7,
    z: 5,
    '.': 2,
    ',': 2,
    ':': 2,
    ';': 2
};

/**
 * Greedy word-wrapping that approximates visual width by character widths.
 *
 * - Splits input into words, additionally breaking on `-` to avoid very long segments.
 * - Uses a rough character width table to approximate line widths.
 * - Wraps once the maximum visual width is exceeded, but only after a minimum.
 */
export default function wordwrap(
    line: string,
    options: {
        minCharactersPerLine?: number;
        minLineWidth?: number;
        maxCharactersPerLine?: number;
        maxLineWidth?: number;
        fontSize?: number;
        monospace?: boolean;
    } = {}
): string[] {
    let {
        minCharactersPerLine,
        minLineWidth,
        maxCharactersPerLine,
        maxLineWidth,
        fontSize,
        monospace
    } = { fontSize: 12, maxCharactersPerLine: 10, ...options };
    // Tokenized words (with hyphen-splitting applied) including trailing spaces/hyphens.
    const tokens: string[] = [];

    // First split by spaces, then further split by hyphens so we can
    // wrap inside hyphenated words if necessary.
    const spaceSeparated = line.split(' ');

    spaceSeparated.forEach((word, wordIndex) => {
        const hyphenParts = word.split('-');
        const trailingWhitespace = wordIndex < spaceSeparated.length - 1 ? ' ' : '';

        if (hyphenParts.length > 1) {
            hyphenParts.forEach((part, partIndex) => {
                const suffix = partIndex < hyphenParts.length - 1 ? '-' : trailingWhitespace;
                tokens.push(part + suffix);
            });
        } else {
            tokens.push(word + trailingWhitespace);
        }
    });

    if (!maxLineWidth) {
        // Fallback for max characters per line if not provided / falsy.
        // Convert character counts into approximate visual widths.
        maxLineWidth = maxCharactersPerLine * CHAR_W.a;
    }

    if (!minLineWidth) {
        // Estimate a good minimum line length:
        //  - start from either a provided value or
        //  - clamp a scaled median word length between 3 and half of maxCharactersPerLine.
        const sortedWordLengths = tokens.map((t) => t.length).sort((a, b) => a - b);
        const medianIndex = Math.round(tokens.length / 2);
        const medianWordLength = sortedWordLengths[medianIndex] ?? maxCharactersPerLine;

        const minChars =
            minCharactersPerLine ||
            Math.max(3, Math.min(maxCharactersPerLine * 0.5, 0.75 * medianWordLength));

        minLineWidth = minChars * CHAR_W.a;
    }

    const lines: string[] = [];
    const currentWords: string[] = [];
    let currentWidth = 0;

    // Helper to look up a character width, falling back to "a" if unknown
    // or when monospace mode is enabled.
    const charWidth = (char: string): number =>
        (fontSize / 12) * (!monospace ? CHAR_W[char] : CHAR_W.a);

    // Greedy line construction: append tokens until the next one would exceed
    // max visual width, but only break if the line has passed the minimum width.
    tokens.forEach((token) => {
        const tokenWidth = sum(token.split('').map(charWidth));

        if (currentWidth + tokenWidth > maxLineWidth && currentWidth > minLineWidth) {
            lines.push(currentWords.join(''));
            currentWords.length = 0;
            currentWidth = 0;
        }

        currentWidth += tokenWidth;
        currentWords.push(token);
    });

    // Flush trailing tokens into the last line.
    if (currentWords.length > 0) {
        lines.push(currentWords.join(''));
    }

    // Filter out any empty lines that may have been created.
    return lines.filter((d) => d !== '');
}
