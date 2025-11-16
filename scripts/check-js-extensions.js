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

// Regular expressions to match import statements without .js extensions
const regexImportFrom =
    /import\s+(?:type\s+)?(?:{[^}]*}|\*\s+as\s+[^;]*|[^;{]*)\s+from\s+['"]([^'"]*)['"]/g;
const regexExportFrom =
    /export\s+(?:type\s+)?(?:{[^}]*}|\*\s+as\s+[^;]*)\s+from\s+['"]([^'"]*)['"]/g;

// Skip node_modules and build directories
const excludedDirs = ['node_modules', 'build', '.svelte-kit', 'dist', '.git', 'examples', 'tests'];

// Only check certain file types
const includedExtensions = ['.ts', '.js', '.svelte'];

// Paths that should have .js extensions (relative paths and alias paths)
const shouldHaveJsExtension = (importPath) => {
    // Skip Svelte imports
    if (importPath.endsWith('.svelte')) return false;

    // Skip npm package imports (those that don't start with . or /)
    if (
        !importPath.startsWith('.') &&
        !importPath.startsWith('/') &&
        !importPath.startsWith('$lib')
    )
        return false;

    // Skip imports with extensions already
    if (path.extname(importPath)) return false;

    return true;
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

    // Find all import statements
    let match;

    // Check import statements
    regexImportFrom.lastIndex = 0;
    while ((match = regexImportFrom.exec(content)) !== null) {
        const importPath = match[1];
        if (shouldHaveJsExtension(importPath)) {
            issues.push({
                line: content.substring(0, match.index).split('\n').length,
                importPath,
                statement: match[0]
            });
        }
    }

    // Check export from statements
    regexExportFrom.lastIndex = 0;
    while ((match = regexExportFrom.exec(content)) !== null) {
        const importPath = match[1];
        if (shouldHaveJsExtension(importPath)) {
            issues.push({
                line: content.substring(0, match.index).split('\n').length,
                importPath,
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
                console.log(
                    `  Line ${issue.line}: Missing .js extension in import: ${issue.importPath}`
                );
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
