import { marked, type Tokens } from 'marked';
import { getSingletonHighlighter } from 'shiki';
import { shikiDiffNotation, shikiFileHeader } from './shikiDiffNotation.js';

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

let hl_promise: ReturnType<typeof getSingletonHighlighter> | null = null;

function get_highlighter() {
    if (!hl_promise) {
        hl_promise = getSingletonHighlighter({
            themes: ['github-light', 'github-dark'],
            langs: ['javascript', 'typescript', 'svelte', 'css', 'html', 'bash', 'json', 'text']
        });
    }
    return hl_promise;
}

let marked_configured = false;

async function ensure_marked_configured() {
    if (marked_configured) return;
    const hl = await get_highlighter();
    marked.use({
        renderer: {
            code({ text, lang }: Tokens.Code): string {
                const language = lang?.toLowerCase() ?? '';
                if (language) {
                    try {
                        return hl.codeToHtml(text, {
                            lang: language,
                            themes: { light: 'github-light', dark: 'github-dark' },
                            defaultColor: false,
                            transformers: [
                                shikiFileHeader(),
                                shikiDiffNotation({
                                    classLineAdd: 'line--added',
                                    classLineRemove: 'line--deleted'
                                })
                            ]
                        });
                    } catch {
                        // unknown language — fall through
                    }
                }
                const esc = (s: string) =>
                    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `<pre class="shiki"><code><span class="line">${esc(text)}</span></code></pre>`;
            }
        }
    });
    marked_configured = true;
}

async function render_markdown(body: string): Promise<string> {
    await ensure_marked_configured();
    return (await marked(body)) as string;
}

const TUTORIAL_ROOT = '/src/content/tutorial';

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
    groupAssetPrefix: string;
}

function build_exercise_list(): RawExercise[] {
    const list: RawExercise[] = [];

    // Find all group dirs (e.g. 01-basics, 02-marks) — dirs that contain chapter subdirs
    const groups = sorted_keys(mds, TUTORIAL_ROOT + '/').reduce((acc, p) => {
        const rel = p.slice(TUTORIAL_ROOT.length + 1);
        const parts = rel.split('/');
        if (parts.length >= 4 && parts[0] !== '+assets') {
            if (!acc.includes(parts[0])) acc.push(parts[0]);
        }
        return acc;
    }, [] as string[]);

    for (const group of groups) {
        const groupBase = `${TUTORIAL_ROOT}/${group}`;

        // Chapter dirs within group
        const chapters = sorted_keys(mds, groupBase + '/').reduce((acc, p) => {
            const rel = p.slice(groupBase.length + 1);
            const parts = rel.split('/');
            if (parts.length >= 3 && parts[0] !== '+assets' && parts[1] !== '+assets') {
                if (!acc.includes(parts[0])) acc.push(parts[0]);
            }
            return acc;
        }, [] as string[]);

        for (const chapter of chapters) {
            const chapterBase = `${groupBase}/${chapter}`;
            const chapterMeta = mds[`${chapterBase}/index.md`] ?? '';
            const { meta: cm } = parse_front_matter(chapterMeta);
            const chapterTitle = cm.title ?? chapter;

            // Exercise dirs within chapter
            const exercises = sorted_keys(mds, chapterBase + '/').reduce((acc, p) => {
                const rel = p.slice(chapterBase.length + 1);
                const parts = rel.split('/');
                if (parts.length >= 2 && parts[0] !== '+assets' && parts[0] !== 'index.md') {
                    if (!acc.includes(parts[0])) acc.push(parts[0]);
                }
                return acc;
            }, [] as string[]);

            for (const ex of exercises) {
                const mdPath = `${chapterBase}/${ex}/index.md`;
                if (!mds[mdPath]) continue;
                const { meta } = parse_front_matter(mds[mdPath]);
                list.push({
                    slug: `${chapter}/${ex}`,
                    title: meta.title ?? ex,
                    chapter: chapterTitle,
                    mdPath,
                    assetPrefix: `${chapterBase}/${ex}/+assets/`,
                    chapterAssetPrefix: `${chapterBase}/+assets/`,
                    groupAssetPrefix: `${groupBase}/+assets/`
                });
            }
        }
    }

    return list;
}

const exercise_list = build_exercise_list();
const exercise_map = new Map(exercise_list.map((e, i) => [e.slug, { ...e, index: i }]));

export function get_exercise_stubs(): ExerciseStub[] {
    return exercise_list.map(({ slug, title, chapter }) => ({ slug, title, chapter }));
}

export async function load_exercise(slug: string): Promise<Exercise | null> {
    const entry = exercise_map.get(slug);
    if (!entry) return null;

    const { meta, body } = parse_front_matter(mds[entry.mdPath]);
    const index = entry.index;

    // Merge shared assets → chapter assets → exercise app-a
    const shared = get_files(entry.groupAssetPrefix);
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
        html: await render_markdown(body),
        a,
        b,
        focus: focus.replace(/^\//, ''),
        prev: prev ? { slug: prev.slug, title: prev.title, chapter: prev.chapter } : null,
        next: next ? { slug: next.slug, title: next.title, chapter: next.chapter } : null
    };
}
