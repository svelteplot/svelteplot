import type { DecorationItem, ShikiTransformer } from 'shiki';

export function shikiFileHeader(className = 'line--file-header'): ShikiTransformer {
    return {
        name: 'shiki-file-header',
        line(node) {
            const text = node.children
                .flatMap((child) => (child.type === 'element' ? child.children : []))
                .filter((n) => n.type === 'text')
                .map((n) => n.value)
                .join('');
            if (text.startsWith('/// file:')) {
                this.addClassToHast(node, className);
            }
        }
    };
}

interface ShikiDiffNotationOptions {
    classLineAdd?: string;
    classLineRemove?: string;
    classInlineAdd?: string;
    classInlineRemove?: string;
    classActivePre?: string;
}

/** Strip inline +++text+++ or ---text--- markers from a line, returning the clean
 *  line text and any decoration ranges (positions are offsets into the clean text). */
function processInlineMarkers(
    line: string,
    lineIndex: number,
    marker: '+++' | '---',
    className: string,
    decorations: DecorationItem[]
): string {
    if (!line.includes(marker)) return line;
    const parts = line.split(marker);
    let cleanLine = '';
    let charPos = 0;
    for (let i = 0; i < parts.length; i++) {
        cleanLine += parts[i];
        if (i % 2 === 1 && parts[i].length > 0) {
            decorations.push({
                start: { line: lineIndex, character: charPos },
                end: { line: lineIndex, character: charPos + parts[i].length },
                properties: { class: className }
            });
        }
        charPos += parts[i].length;
    }
    return cleanLine;
}

export function shikiDiffNotation(options: ShikiDiffNotationOptions = {}): ShikiTransformer {
    const {
        classLineAdd = 'add',
        classLineRemove = 'remove',
        classInlineAdd = 'inline-add',
        classInlineRemove = 'inline-remove',
        classActivePre = 'diff'
    } = options;

    return {
        name: 'shiki-diff-notation',
        preprocess(code) {
            let hasDiff = false;
            const decorations: DecorationItem[] = [];

            const lines = code.split('\n').map((line, lineIndex) => {
                // Whole-line additions/deletions: lines starting with + or -
                // (the code hook strips the prefix and adds line classes)
                if (
                    (line.startsWith('+') && !line.startsWith('+++')) ||
                    (line.startsWith('-') && !line.startsWith('---'))
                ) {
                    hasDiff = true;
                    return line;
                }

                // Inline: strip +++text+++ / ---text--- markers and record decorations.
                // Process --- first so that +++ positions are computed against the
                // already-stripped text (correct offsets when both appear on one line).
                if (line.includes('---')) {
                    line = processInlineMarkers(
                        line,
                        lineIndex,
                        '---',
                        classInlineRemove,
                        decorations
                    );
                    hasDiff = true;
                }
                if (line.includes('+++')) {
                    line = processInlineMarkers(
                        line,
                        lineIndex,
                        '+++',
                        classInlineAdd,
                        decorations
                    );
                    hasDiff = true;
                }

                return line;
            });

            if (hasDiff) {
                (this.meta as Record<string, unknown>).hasDiff = true;
                if (decorations.length > 0) {
                    if (!this.options.decorations) this.options.decorations = [];
                    this.options.decorations.push(...decorations);
                }
                return lines.join('\n');
            }
        },
        code(node) {
            const active =
                (this.meta as Record<string, unknown>).hasDiff || this.options.meta?.diff;
            if (!active) return;
            this.addClassToHast(this.pre, classActivePre);

            for (const line of node.children) {
                if (line.type !== 'element') continue;
                for (const child of line.children) {
                    if (child.type !== 'element') continue;
                    const text = child.children[0];
                    if (!text || text.type !== 'text') continue;

                    if (text.value.startsWith('+')) {
                        text.value = text.value.slice(1);
                        this.addClassToHast(line, classLineAdd);
                        break;
                    }
                    if (text.value.startsWith('-')) {
                        text.value = text.value.slice(1);
                        this.addClassToHast(line, classLineRemove);
                        break;
                    }
                }
            }
        }
    };
}
