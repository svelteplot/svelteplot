import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageTsconfig = JSON.parse(
    readFileSync(path.join(repoRoot, 'packages/svelteplot/tsconfig.json'), 'utf8')
);

describe('packages/svelteplot/tsconfig.json', () => {
    it('maps svelteplot imports to src so svelte-check works without dist', () => {
        const paths = packageTsconfig.compilerOptions.paths;
        assert.ok(paths, 'compilerOptions.paths is required for package tests');
        assert.deepEqual(paths.svelteplot, ['./src/index.ts']);
        assert.deepEqual(paths['svelteplot/*'], ['./src/*']);
    });
});
