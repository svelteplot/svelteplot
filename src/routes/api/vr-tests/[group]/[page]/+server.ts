import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

const ensureDir = async (dir: string) => {
    await fs.mkdir(dir, { recursive: true }).catch((err) => {
        if (err && (err as any).code !== 'EEXIST') throw err;
    });
};

const exists = async (fp: string) => {
    try {
        await fs.access(fp);
        return true;
    } catch {
        return false;
    }
};

export const POST: RequestHandler = async ({ params }) => {
    const { group, page } = params;
    if (!group || !page) {
        throw error(400, 'Missing group or page parameter');
    }
    // basic sanitization of path segments
    const safe = (s: string) => !s.includes('..') && !s.includes('\\') && !s.startsWith('/');
    if (!safe(group) || !safe(page)) {
        throw error(400, 'Invalid path segment');
    }

    const staticDir = path.resolve('static');
    const srcDir = path.resolve('src');
    const latestBase = path.join(staticDir, '__vr', 'latest', group, page);
    const baselineBase = path.join(srcDir, 'snapshots', group, page);

    const variants = [
        { mode: 'light', suffix: '' },
        { mode: 'dark', suffix: '.dark' }
    ] as const;

    const copied: Array<'light' | 'dark'> = [];
    const missing: Array<'light' | 'dark'> = [];

    for (const v of variants) {
        const src = `${latestBase}${v.suffix}.png`;
        const dst = `${baselineBase}${v.suffix}.png`;
        const hasSrc = await exists(src);
        if (!hasSrc) {
            missing.push(v.mode);
            continue;
        }
        await ensureDir(path.dirname(dst));
        await fs.copyFile(src, dst);
        copied.push(v.mode);
    }

    if (copied.length === 0) {
        throw error(404, 'No latest snapshots found to approve');
    }

    return json({ ok: true, group, page, copied, missing });
};
