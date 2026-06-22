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

/** @param {string} repoRoot */
export function getRepoRoot(repoRoot) {
    if (repoRoot) return repoRoot;
    const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
    if (result.status !== 0) {
        throw new Error('svelte-check-staged: not inside a git repository');
    }
    return result.stdout.trim();
}

/** @param {string} repoRoot @param {string} filePath */
export function normalizeTargetPath(repoRoot, filePath) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);
    return path.relative(repoRoot, resolved).split(path.sep).join('/');
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
                        filename: record.filename,
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
    return errors.filter((d) => targets.has(d.filename));
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

    const existing = [...targets].filter((f) => existsSync(path.join(root, f)));
    if (existing.length === 0) return 0;

    const targetSet = new Set(existing);

    if (!runCheck) return 0;

    const sync = spawnSync('pnpm', ['exec', 'svelte-kit', 'sync'], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
    });
    if (sync.status !== 0) {
        process.stderr.write(sync.stderr || sync.stdout || 'svelte-kit sync failed\n');
        return sync.status ?? 1;
    }

    const check = spawnSync(
        'pnpm',
        [
            'exec',
            'svelte-check',
            '--tsconfig',
            './tsconfig.json',
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
        process.stderr.write(`svelte-check failed: ${parsed.failure}\n`);
        return 1;
    }

    if (!parsed.completed) {
        process.stderr.write(
            'svelte-check-staged: incomplete svelte-check run (missing COMPLETED)\n'
        );
        if (check.status && check.status !== 0 && !check.stdout) {
            process.stderr.write(check.stdout || '');
        }
        return 1;
    }

    const matching = filterDiagnostics(parsed.errors, targetSet);

    if (matching.length > 0) {
        process.stderr.write('svelte-check errors in commit files:\n');
        for (const err of matching) {
            process.stderr.write(`  ${err.filename}:${err.line}:${err.column} ${err.message}\n`);
        }
        return 1;
    }

    if (parsed.totalErrors > 0) {
        process.stderr.write(
            `svelte-check: ${parsed.totalErrors} repo error(s) outside commit files (CI will catch)\n`
        );
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
