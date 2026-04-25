import { marked } from 'marked';

export interface ExerciseStub {
    slug: string;
    title: string;
    chapter: string;
}

export interface Exercise {
    slug: string;
    title: string;
    chapter: string;
    html: string;
    /** starting file state: path → content, paths relative to /src/lib/ */
    a: Record<string, string>;
    /** solution file state (empty if no solution) */
    b: Record<string, string>;
    prev: ExerciseStub | null;
    next: ExerciseStub | null;
    focus: string;
}

// Eagerly import all tutorial content at build time
const mds = import.meta.glob('/src/content/tutorial/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

const assets = import.meta.glob('/src/content/tutorial/**', {
    query: '?raw',
    import: 'default',
    eager: true
}) as Record<string, string>;

function get_files(prefix: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [path, content] of Object.entries(assets)) {
        if (path.startsWith(prefix) && !path.endsWith('.md')) {
            result[path.slice(prefix.length)] = content as string;
        }
    }
    return result;
}

function parse_front_matter(md: string): { meta: Record<string, string>; body: string } {
    const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: md };
    const meta: Record<string, string> = {};
    for (const line of match[1].split('\n')) {
        const colon = line.indexOf(':');
        if (colon !== -1) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
    return { meta, body: match[2] };
}

function render_markdown(body: string): string {
    // Strip code diff markers (---deleted--- and +++added+++) — show the final state
    const cleaned = body
        .replace(/^---(.*)---$/gm, '')
        .replace(/^\+\+\+(.*)$/gm, '$1')
        .replace(/^(.*)\+\+\+$/gm, '$1');
    return marked(cleaned) as string;
}

// Build ordered exercise list once at module init
const BASE = '/src/content/tutorial/02-svelteplot';

function sorted_keys(obj: Record<string, string>, prefix: string) {
    return Object.keys(obj)
        .filter((k) => k.startsWith(prefix))
        .sort();
}

interface RawExercise {
    slug: string;
    title: string;
    chapter: string;
    mdPath: string;
    assetPrefix: string;
    chapterAssetPrefix: string;
}

function build_exercise_list(): RawExercise[] {
    const list: RawExercise[] = [];

    // Chapter dirs: 01-loading-data, 02-creating-a-plot, …
    const chapterPaths = sorted_keys(mds, BASE + '/').reduce((acc, p) => {
        const rel = p.slice(BASE.length + 1);
        const parts = rel.split('/');
        if (parts.length >= 3 && parts[0] !== '+assets' && parts[1] !== '+assets') {
            const chapter = parts[0];
            if (!acc.includes(chapter)) acc.push(chapter);
        }
        return acc;
    }, [] as string[]);

    for (const chapter of chapterPaths) {
        const chapterBase = `${BASE}/${chapter}`;
        const chapterMeta = mds[`${chapterBase}/index.md`] ?? '';
        const { meta: cm } = parse_front_matter(chapterMeta);
        const chapterTitle = cm.title ?? chapter;

        // Exercise dirs within chapter
        const exPaths = sorted_keys(mds, chapterBase + '/').reduce((acc, p) => {
            const rel = p.slice(chapterBase.length + 1);
            const parts = rel.split('/');
            if (parts.length >= 2 && parts[0] !== '+assets' && parts[0] !== 'index.md') {
                const ex = parts[0];
                if (!acc.includes(ex)) acc.push(ex);
            }
            return acc;
        }, [] as string[]);

        for (const ex of exPaths) {
            const mdPath = `${chapterBase}/${ex}/index.md`;
            if (!mds[mdPath]) continue;

            const { meta } = parse_front_matter(mds[mdPath]);
            list.push({
                slug: `${chapter}/${ex}`,
                title: meta.title ?? ex,
                chapter: chapterTitle,
                mdPath,
                assetPrefix: `${chapterBase}/${ex}/+assets/`,
                chapterAssetPrefix: `${chapterBase}/+assets/`
            });
        }
    }

    return list;
}

const exercise_list = build_exercise_list();
const exercise_map = new Map(exercise_list.map((e, i) => [e.slug, { ...e, index: i }]));

const SHARED_ASSET_PREFIX = `${BASE}/+assets/`;

export function get_exercise_stubs(): ExerciseStub[] {
    return exercise_list.map(({ slug, title, chapter }) => ({ slug, title, chapter }));
}

export function load_exercise(slug: string): Exercise | null {
    const entry = exercise_map.get(slug);
    if (!entry) return null;

    const { meta, body } = parse_front_matter(mds[entry.mdPath]);
    const index = entry.index;

    // Merge shared assets → chapter assets → exercise app-a
    const shared = get_files(SHARED_ASSET_PREFIX);
    const chapter_shared = get_files(entry.chapterAssetPrefix);
    const app_a_raw = get_files(`${entry.assetPrefix}app-a/`);
    const app_b_raw = get_files(`${entry.assetPrefix}app-b/`);

    // The REPL uses files prefixed with /src/lib/ as editable files
    // Filter to only src/lib/ files for the editor
    function only_lib(files: Record<string, string>) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(files)) {
            if (k.startsWith('src/lib/') || k.startsWith('src/routes/')) out[k] = v;
        }
        return out;
    }

    const a = { ...only_lib(shared), ...only_lib(chapter_shared), ...only_lib(app_a_raw) };
    const b = only_lib(app_b_raw);

    const prev = index > 0 ? exercise_list[index - 1] : null;
    const next = index < exercise_list.length - 1 ? exercise_list[index + 1] : null;

    const focus = meta.focus ?? '/src/lib/App.svelte';

    return {
        slug,
        title: meta.title ?? slug,
        chapter: entry.chapter,
        html: render_markdown(body),
        a,
        b,
        focus: focus.replace(/^\//, ''),
        prev: prev ? { slug: prev.slug, title: prev.title, chapter: prev.chapter } : null,
        next: next ? { slug: next.slug, title: next.title, chapter: next.chapter } : null
    };
}
