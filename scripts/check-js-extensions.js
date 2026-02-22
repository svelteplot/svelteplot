#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * This script checks for missing .js extensions in import statements.
 * It helps identify issues with ESM imports where TypeScript requires .js extensions.
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert file:// URLs to paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcLibDir = path.join(projectRoot, 'src/lib');

// Regular expressions to match import statements without .js extensions
const regexImportFrom =
    /import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s[^;]*|[^;{]*)\s+from\s+['"]([^'"]*)['"]/g;
const regexExportFrom =
    /export\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s[^;]*)\s+from\s+['"]([^'"]*)['"]/g;

// Skip node_modules and build directories
const excludedDirs = ['node_modules', 'build', '.svelte-kit', 'dist', '.git', 'examples', 'tests'];

// Only check certain file types
const includedExtensions = ['.ts', '.js', '.svelte'];
const sourceFileExtensions = ['.ts', '.js', '.svelte', '.mts', '.cts', '.tsx', '.jsx'];

const resolutionCache = new Map();

const pathExists = async (targetPath) => {
    try {
        return await stat(targetPath);
    } catch {
        return null;
    }
};

const resolveImportBasePath = (importPath, importerFilePath) => {
    if (importPath.startsWith('.')) {
        return path.resolve(path.dirname(importerFilePath), importPath);
    }

    if (importPath === '$lib') {
        return srcLibDir;
    }

    if (importPath.startsWith('$lib/')) {
        return path.join(srcLibDir, importPath.slice('$lib/'.length));
    }

    if (importPath === 'svelteplot') {
        return srcLibDir;
    }

    if (importPath.startsWith('svelteplot/')) {
        return path.join(srcLibDir, importPath.slice('svelteplot/'.length));
    }

    if (importPath.startsWith('/')) {
        return path.join(projectRoot, importPath.slice(1));
    }

    return null;
};

const resolveImportTargetType = async (basePath) => {
    if (resolutionCache.has(basePath)) {
        return resolutionCache.get(basePath);
    }

    const baseStat = await pathExists(basePath);
    if (baseStat?.isDirectory()) {
        for (const extension of sourceFileExtensions) {
            const indexStat = await pathExists(path.join(basePath, `index${extension}`));
            if (indexStat?.isFile()) {
                resolutionCache.set(basePath, 'directory');
                return 'directory';
            }
        }
    }

    if (baseStat?.isFile()) {
        resolutionCache.set(basePath, 'file');
        return 'file';
    }

    for (const extension of sourceFileExtensions) {
        const fileStat = await pathExists(`${basePath}${extension}`);
        if (fileStat?.isFile()) {
            resolutionCache.set(basePath, 'file');
            return 'file';
        }
    }

    resolutionCache.set(basePath, 'unknown');
    return 'unknown';
};

const isTypeOnlyStatement = (statement) => {
    const trimmedStatement = statement.trim();
    return (
        trimmedStatement.startsWith('import type ') || trimmedStatement.startsWith('export type ')
    );
};

const buildExpectedImportPath = (importPath, targetType) => {
    if (targetType === 'directory') {
        return `${importPath.replace(/\/$/, '')}/index.js`;
    }

    return `${importPath}.js`;
};

// Paths that should have .js extensions (relative paths and alias paths)
const checkImportPath = async (importPath, importerFilePath) => {
    // Skip Svelte imports
    if (importPath.endsWith('.svelte')) return { shouldFlag: false };

    // Skip npm package imports (those that don't start with . or /)
    if (
        !importPath.startsWith('.') &&
        !importPath.startsWith('/') &&
        !importPath.startsWith('$lib') &&
        !importPath.startsWith('svelteplot')
    )
        return { shouldFlag: false };

    // Skip imports with extensions already
    if (path.extname(importPath)) return { shouldFlag: false };

    if (importPath.includes('src/theme')) return { shouldFlag: false };

    const basePath = resolveImportBasePath(importPath, importerFilePath);
    if (!basePath) return { shouldFlag: false };

    const targetType = await resolveImportTargetType(basePath);

    // For Svelte REPL compatibility, both file and directory imports
    // should be explicit with .js (directories as /index.js).
    if (targetType === 'directory' || targetType === 'file') {
        return {
            shouldFlag: true,
            expectedPath: buildExpectedImportPath(importPath, targetType)
        };
    }

    return { shouldFlag: false };
};

async function* walkDirectory(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!excludedDirs.includes(entry.name)) {
                yield* walkDirectory(fullPath);
            }
        } else if (includedExtensions.includes(path.extname(entry.name))) {
            yield fullPath;
        }
    }
}

async function checkFile(filePath) {
    const content = await readFile(filePath, 'utf8');
    const issues = [];

    // ignore files in src/theme
    if (!filePath.includes('src/lib'))
        return {
            filePath,
            issues: []
        };

    // Find all import statements
    let match;

    // Check import statements
    regexImportFrom.lastIndex = 0;
    while ((match = regexImportFrom.exec(content)) !== null) {
        const importPath = match[1];
        if (isTypeOnlyStatement(match[0])) continue;
        const result = await checkImportPath(importPath, filePath);
        if (result.shouldFlag) {
            issues.push({
                line: content.substring(0, match.index).split('\n').length,
                importPath,
                expectedPath: result.expectedPath,
                statement: match[0]
            });
        }
    }

    // Check export from statements
    regexExportFrom.lastIndex = 0;
    while ((match = regexExportFrom.exec(content)) !== null) {
        const importPath = match[1];
        if (isTypeOnlyStatement(match[0])) continue;
        const result = await checkImportPath(importPath, filePath);
        if (result.shouldFlag) {
            issues.push({
                line: content.substring(0, match.index).split('\n').length,
                importPath,
                expectedPath: result.expectedPath,
                statement: match[0]
            });
        }
    }

    return { filePath, issues };
}

async function main() {
    const rootDir = process.argv[2] || process.cwd();
    console.log(`Checking for missing .js extensions in ${rootDir}...\n`);

    let totalIssues = 0;
    let filesWithIssues = 0;

    for await (const filePath of walkDirectory(rootDir)) {
        const { issues } = await checkFile(filePath);

        if (issues.length > 0) {
            console.log(`\x1b[33m${filePath}\x1b[0m`);
            filesWithIssues++;

            for (const issue of issues) {
                totalIssues++;
                console.log(`  Line ${issue.line}: ${issue.importPath} -> ${issue.expectedPath}`);
                console.log(`    ${issue.statement}`);
            }
            console.log('');
        }
    }

    if (totalIssues === 0) {
        console.log('\x1b[32mNo missing .js extensions found!\x1b[0m');
    } else {
        console.log(
            `\x1b[31mFound ${totalIssues} missing .js extensions in ${filesWithIssues} files.\x1b[0m`
        );
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
