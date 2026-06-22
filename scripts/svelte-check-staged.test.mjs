import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
    PACKAGE_TSCONFIG,
    ROOT_TSCONFIG,
    buildCheckPlans,
    filterDiagnostics,
    normalizeTargetPath,
    parseMachineVerboseOutput,
    runStagedCheck
} from './svelte-check-staged.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const fixture = readFileSync(
    path.join(__dirname, 'fixtures/svelte-check-staged/sample-output.txt'),
    'utf8'
);

describe('normalizeTargetPath', () => {
    it('converts absolute paths to repo-relative posix paths', () => {
        const abs = path.join(repoRoot, 'packages/svelteplot/src/transforms/stack.ts');
        assert.equal(
            normalizeTargetPath(repoRoot, abs),
            'packages/svelteplot/src/transforms/stack.ts'
        );
    });

    it('strips ./ prefix via resolution', () => {
        assert.equal(
            normalizeTargetPath(repoRoot, './packages/svelteplot/src/transforms/stack.ts'),
            'packages/svelteplot/src/transforms/stack.ts'
        );
    });
});

describe('parseMachineVerboseOutput', () => {
    it('parses timestamp-prefixed JSON diagnostics and COMPLETED totals', () => {
        const parsed = parseMachineVerboseOutput(fixture);
        assert.equal(parsed.completed, true);
        assert.equal(parsed.failure, null);
        assert.equal(parsed.totalErrors, 21);
        assert.equal(parsed.errors.length, 2);
        assert.equal(parsed.errors[1].filename, 'packages/svelteplot/src/transforms/stack.ts');
        assert.equal(parsed.errors[1].line, 1);
        assert.equal(
            parsed.errors[1].message,
            "Type 'string' is not assignable to type 'StackOrder'."
        );
    });

    it('ignores WARNING records when using threshold error output', () => {
        const parsed = parseMachineVerboseOutput(fixture);
        assert.ok(parsed.errors.every((e) => !e.filename.endsWith('Brush.svelte')));
    });

    it('detects FAILURE records', () => {
        const parsed = parseMachineVerboseOutput('999 FAILURE "tsconfig not found"\n');
        assert.equal(parsed.failure, 'tsconfig not found');
        assert.equal(parsed.completed, false);
    });

    it('handles messages with embedded quotes via JSON', () => {
        const line =
            '1 {"type":"ERROR","filename":"src/a.ts","start":{"line":0,"character":0},"end":{"line":0,"character":0},"message":"Expected \\"foo\\" but got bar","code":1}\n';
        const parsed = parseMachineVerboseOutput(line);
        assert.equal(parsed.errors[0].message, 'Expected "foo" but got bar');
    });

    it('requires COMPLETED for a successful parse', () => {
        const parsed = parseMachineVerboseOutput(
            '1 {"type":"ERROR","filename":"a.ts","start":{"line":0,"character":0},"end":{"line":0,"character":0},"message":"x","code":1}\n'
        );
        assert.equal(parsed.completed, false);
    });
});

describe('filterDiagnostics', () => {
    it('keeps only errors in target files', () => {
        const parsed = parseMachineVerboseOutput(fixture);
        const targets = new Set(['packages/svelteplot/src/transforms/stack.ts']);
        const matching = filterDiagnostics(parsed.errors, targets);
        assert.equal(matching.length, 1);
        assert.equal(matching[0].filename, 'packages/svelteplot/src/transforms/stack.ts');
    });

    it('matches Windows-style diagnostic paths to posix targets', () => {
        const errors = [
            {
                filename: 'packages\\svelteplot\\src\\transforms\\stack.ts',
                line: 1,
                column: 1,
                message: 'err'
            }
        ];
        const targets = new Set(['packages/svelteplot/src/transforms/stack.ts']);
        assert.equal(filterDiagnostics(errors, targets).length, 1);
    });
});

describe('buildCheckPlans', () => {
    it('uses package tsconfig for packages/svelteplot paths', () => {
        const plans = buildCheckPlans(['packages/svelteplot/tests/areaY.test.svelte.ts']);
        assert.equal(plans.length, 1);
        assert.equal(plans[0].tsconfig, PACKAGE_TSCONFIG);
        assert.equal(plans[0].needsSync, false);
        assert.deepEqual([...plans[0].targets], ['packages/svelteplot/tests/areaY.test.svelte.ts']);
    });

    it('uses root tsconfig for docs app paths', () => {
        const plans = buildCheckPlans(['src/routes/marks/area/+page.ts']);
        assert.equal(plans.length, 1);
        assert.equal(plans[0].tsconfig, ROOT_TSCONFIG);
        assert.equal(plans[0].needsSync, true);
    });

    it('runs both tsconfigs when commit spans package and docs app', () => {
        const plans = buildCheckPlans([
            'packages/svelteplot/src/transforms/stack.ts',
            'src/routes/marks/area/+page.ts'
        ]);
        assert.equal(plans.length, 2);
        assert.equal(plans[0].tsconfig, PACKAGE_TSCONFIG);
        assert.equal(plans[1].tsconfig, ROOT_TSCONFIG);
    });
});

describe('runStagedCheck', () => {
    it('exits 0 with no file arguments', () => {
        assert.equal(runStagedCheck(repoRoot, [], { runCheck: false }), 0);
    });

    it('exits 0 when targets are deleted paths only', () => {
        assert.equal(
            runStagedCheck(repoRoot, ['packages/does-not-exist/removed.ts'], { runCheck: false }),
            0
        );
    });
});
