#!/usr/bin/env node
/**
 * Pre-commit helper: run full svelte-check, but only fail on errors in target files.
 *
 * Limitations:
 * - Still analyzes the whole project (~10–15s); only the gate is scoped to targets.
 * - Cannot catch new errors in unstaged files caused by types exported from staged files.
 * - Skips when all targets are deleted paths (nothing left to type-check).
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RECORD_RE = /^(\d+)\s+([\s\S]+)$/;

export const PACKAGE_PREFIX = 'packages/svelteplot/';
export const PACKAGE_TSCONFIG = 'packages/svelteplot/tsconfig.json';
export const ROOT_TSCONFIG = './tsconfig.json';

/** @param {string} target repo-relative posix path */
export function isDiagnosableTarget(target) {
    if (target === 'vite.config.js' || target === 'vite.config.ts') return true;
    if (target.startsWith('src/') || target.startsWith('test/') || target.startsWith('tests/')) {
        return true;
    }
    if (target.startsWith(PACKAGE_PREFIX)) {
        const rest = target.slice(PACKAGE_PREFIX.length);
        return rest.startsWith('src/') || rest.startsWith('tests/');
    }
    return false;
}

/** @param {string[]} targetPaths */
export function filterDiagnosableTargets(targetPaths) {
    return targetPaths.filter(isDiagnosableTarget);
}

/**
 * @param {string[]} targetPaths repo-relative posix paths
 * @returns {Array<{ tsconfig: string, targets: Set<string>, needsSync: boolean }>}
 */
export function buildCheckPlans(targetPaths) {
    const packageTargets = [];
    const rootTargets = [];

    for (const target of targetPaths) {
        if (target.startsWith(PACKAGE_PREFIX)) packageTargets.push(target);
        else rootTargets.push(target);
    }

    /** @type {Array<{ tsconfig: string, targets: Set<string>, needsSync: boolean }>} */
    const plans = [];

    if (packageTargets.length > 0) {
        plans.push({
            tsconfig: PACKAGE_TSCONFIG,
            targets: new Set(packageTargets),
            needsSync: false
        });
    }

    if (rootTargets.length > 0) {
        plans.push({
            tsconfig: ROOT_TSCONFIG,
            targets: new Set(rootTargets),
            needsSync: true
        });
    }

    return plans;
}

/**
 * @param {string} root
 * @param {{ tsconfig: string, targets: Set<string>, needsSync: boolean }} plan
 * @returns {{ code: number, matching: Array<{ filename: string, line: number, column: number, message: string }>, outsideErrors: number }}
 */
function runCheckPlan(root, plan) {
    if (plan.needsSync) {
        const sync = spawnSync('pnpm', ['exec', 'svelte-kit', 'sync'], {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
        if (sync.status !== 0) {
            process.stderr.write(sync.stderr || sync.stdout || 'svelte-kit sync failed\n');
            return { code: sync.status ?? 1, matching: [], outsideErrors: 0 };
        }
    }

    const check = spawnSync(
        'pnpm',
        [
            'exec',
            'svelte-check',
            '--tsconfig',
            plan.tsconfig,
            '--output',
            'machine-verbose',
            '--threshold',
            'error'
        ],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );

    if (check.stderr) process.stderr.write(check.stderr);

    const parsed = parseMachineVerboseOutput(check.stdout ?? '');

    if (parsed.failure) {
        process.stderr.write(`svelte-check failed (${plan.tsconfig}): ${parsed.failure}\n`);
        return { code: 1, matching: [], outsideErrors: 0 };
    }

    if (!parsed.completed) {
        process.stderr.write(
            `svelte-check-staged: incomplete svelte-check run for ${plan.tsconfig} (missing COMPLETED)\n`
        );
        if (check.status && check.status !== 0 && !check.stdout) {
            process.stderr.write(check.stdout || '');
        }
        return { code: 1, matching: [], outsideErrors: 0 };
    }

    const matching = filterDiagnostics(parsed.errors, plan.targets);
    const outsideErrors = parsed.totalErrors - matching.length;

    return { code: 0, matching, outsideErrors: Math.max(0, outsideErrors) };
}

/** @param {string} repoRoot */
export function getRepoRoot(repoRoot) {
    if (repoRoot) return repoRoot;
    const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
    if (result.status !== 0) {
        throw new Error('svelte-check-staged: not inside a git repository');
    }
    return result.stdout.trim();
}

/** @param {string} filePath */
export function toPosixPath(filePath) {
    return filePath.replace(/\\/g, '/');
}

/** @param {string} repoRoot @param {string} filePath */
export function normalizeTargetPath(repoRoot, filePath) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);
    return toPosixPath(path.relative(repoRoot, resolved));
}

/**
 * @param {string} output machine-verbose stdout from svelte-check
 * @returns {{ errors: Array<{ filename: string, line: number, column: number, message: string }>, completed: boolean, failure: string | null, totalErrors: number }}
 */
export function parseMachineVerboseOutput(output) {
    /** @type {Array<{ filename: string, line: number, column: number, message: string }>} */
    const errors = [];
    let completed = false;
    /** @type {string | null} */
    let failure = null;
    let totalErrors = 0;

    for (const rawLine of output.split('\n')) {
        const line = rawLine.trimEnd();
        if (!line) continue;

        const match = RECORD_RE.exec(line);
        if (!match) continue;

        const payload = match[2];

        if (payload.startsWith('{')) {
            try {
                const record = JSON.parse(payload);
                if (record.type === 'ERROR' && record.filename) {
                    errors.push({
                        filename: toPosixPath(record.filename),
                        line: (record.start?.line ?? 0) + 1,
                        column: (record.start?.character ?? 0) + 1,
                        message: record.message ?? ''
                    });
                }
            } catch {
                // ignore malformed JSON diagnostic lines
            }
            continue;
        }

        if (payload.startsWith('COMPLETED ')) {
            completed = true;
            const totals = /^COMPLETED \d+ FILES (\d+) ERRORS/.exec(payload);
            if (totals) totalErrors = Number(totals[1]);
            continue;
        }

        if (payload.startsWith('FAILURE ')) {
            failure = payload.slice('FAILURE '.length).replace(/^"|"$/g, '');
        }
    }

    return { errors, completed, failure, totalErrors };
}

/**
 * @param {Array<{ filename: string, line: number, column: number, message: string }>} errors
 * @param {Set<string>} targets repo-relative posix paths
 */
export function filterDiagnostics(errors, targets) {
    return errors.filter((d) => targets.has(toPosixPath(d.filename)));
}

/**
 * @param {string} repoRoot
 * @param {string[]} fileArgs paths from pre-commit (staged files or --all-files)
 * @param {{ runCheck?: boolean }} [options]
 * @returns {number} exit code
 */
export function runStagedCheck(repoRoot, fileArgs, options = {}) {
    const runCheck = options.runCheck ?? true;
    const root = getRepoRoot(repoRoot);

    const targets = new Set(
        fileArgs.map((f) => normalizeTargetPath(root, f)).filter((f) => f && !f.startsWith('..'))
    );

    if (targets.size === 0) return 0;

    const existing = filterDiagnosableTargets(
        [...targets].filter((f) => existsSync(path.join(root, f)))
    );
    if (existing.length === 0) return 0;

    if (!runCheck) return 0;

    const plans = buildCheckPlans(existing);
    /** @type {Array<{ filename: string, line: number, column: number, message: string }>} */
    const matching = [];

    for (const plan of plans) {
        const result = runCheckPlan(root, plan);
        if (result.code !== 0) return result.code;
        matching.push(...result.matching);
        if (result.outsideErrors > 0) {
            process.stderr.write(
                `svelte-check (${plan.tsconfig}): ${result.outsideErrors} error(s) outside commit files (CI will catch)\n`
            );
        }
    }

    if (matching.length > 0) {
        process.stderr.write('svelte-check errors in commit files:\n');
        for (const err of matching) {
            process.stderr.write(`  ${err.filename}:${err.line}:${err.column} ${err.message}\n`);
        }
        return 1;
    }

    return 0;
}

const isMain =
    process.argv[1] &&
    path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
    const code = runStagedCheck(undefined, process.argv.slice(2));
    process.exit(code);
}
