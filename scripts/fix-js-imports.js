import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MagicString from 'magic-string';

/**
 * Post-packaging import fixer for files in `dist/`.
 *
 * `svelte-package` can emit extensionless relative imports (for example `./foo`
 * or `./bar` where `bar/index.js` exists). Some strict ESM environments, such
 * as Svelte REPL, require fully specified import paths. This script rewrites
 * those relative specifiers to `*.js` or `/index.js` after packaging.
 */
const SOURCE_FILE_EXTENSIONS = new Set(['.js', '.svelte', '.d.ts']);

const regexImportFrom =
    /import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s[^;]*|[^;{]*)\s+from\s+['"]([^'"]*)['"]/g;
const regexExportFrom =
    /export\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s[^;]*|\*)\s+from\s+['"]([^'"]*)['"]/g;
const regexDynamicImport = /\bimport\s*\(\s*['"]([^'"]*)['"]\s*\)/g;

const pathExists = async (targetPath) => {
    try {
        return await stat(targetPath);
    } catch {
        return null;
    }
};

const splitSpecifier = (specifier) => {
    const suffixIndex = specifier.search(/[?#]/);
    if (suffixIndex === -1) {
        return { base: specifier, suffix: '' };
    }

    return {
        base: specifier.slice(0, suffixIndex),
        suffix: specifier.slice(suffixIndex)
    };
};

const hasExtension = (specifier) => Boolean(path.extname(splitSpecifier(specifier).base));

const withIndexJs = (specifier) => `${specifier.replace(/\/$/, '')}/index.js`;

const collectImportSpecifiers = (code) => {
    const matches = [];
    const patterns = [regexImportFrom, regexExportFrom, regexDynamicImport];

    for (const pattern of patterns) {
        pattern.lastIndex = 0;
        let match;

        while ((match = pattern.exec(code)) !== null) {
            const specifier = match[1];
            const relativeIndex = match[0].indexOf(specifier);
            if (relativeIndex === -1) continue;

            const start = match.index + relativeIndex;
            matches.push({
                start,
                end: start + specifier.length,
                specifier
            });
        }
    }

    matches.sort((a, b) => a.start - b.start);

    // De-duplicate overlapping captures from different patterns.
    return matches.filter(
        (match, index) =>
            index === 0 ||
            match.start !== matches[index - 1].start ||
            match.end !== matches[index - 1].end
    );
};

const resolveRelativeSpecifierOnDisk = async (specifier, importerFilePath) => {
    const { base, suffix } = splitSpecifier(specifier);

    if (!base.startsWith('.') || hasExtension(base)) return null;

    const absoluteBasePath = path.resolve(path.dirname(importerFilePath), base);

    const fileCandidate = await pathExists(`${absoluteBasePath}.js`);
    if (fileCandidate?.isFile()) return `${base}.js${suffix}`;

    const indexCandidate = await pathExists(path.join(absoluteBasePath, 'index.js'));
    if (indexCandidate?.isFile()) return `${withIndexJs(base)}${suffix}`;

    return null;
};

async function* walkFiles(rootDir) {
    const entries = await readdir(rootDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(rootDir, entry.name);

        if (entry.isDirectory()) {
            yield* walkFiles(fullPath);
            continue;
        }

        if (SOURCE_FILE_EXTENSIONS.has(path.extname(entry.name)) || fullPath.endsWith('.d.ts')) {
            yield fullPath;
        }
    }
}

const rewriteContent = (code, replacements) => {
    const ms = new MagicString(code);
    let changed = false;

    for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
        ms.overwrite(replacement.start, replacement.end, replacement.value);
        changed = true;
    }

    return {
        changed,
        code: changed ? ms.toString() : code,
        map: changed ? ms.generateMap({ hires: true }) : null
    };
};

export async function fullySpecifyImportsInDirectory(rootDir = 'dist') {
    let updatedFiles = 0;
    const absoluteRoot = path.resolve(rootDir);

    for await (const filePath of walkFiles(absoluteRoot)) {
        const code = await readFile(filePath, 'utf8');
        const matches = collectImportSpecifiers(code);

        if (matches.length === 0) continue;

        const replacements = [];
        for (const match of matches) {
            const replacement = await resolveRelativeSpecifierOnDisk(match.specifier, filePath);
            if (replacement && replacement !== match.specifier) {
                replacements.push({
                    start: match.start,
                    end: match.end,
                    value: replacement
                });
            }
        }

        if (replacements.length === 0) continue;

        const rewritten = rewriteContent(code, replacements);
        if (!rewritten.changed) continue;

        await writeFile(filePath, rewritten.code);
        updatedFiles++;
    }

    return { updatedFiles };
}

async function main() {
    const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
    const currentPath = fileURLToPath(import.meta.url);
    if (invokedPath !== currentPath) return;

    const rootDir = process.argv[2] || 'dist';
    const { updatedFiles } = await fullySpecifyImportsInDirectory(rootDir);
    console.log(`fully-specified-imports: updated ${updatedFiles} file(s) in ${rootDir}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
