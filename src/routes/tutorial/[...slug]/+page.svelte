<script lang="ts">
    import { browser } from '$app/environment';
    import { afterNavigate, goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { SplitPane } from '@rich_harris/svelte-split-pane';
    import Editor from '@sveltejs/repl/editor';
    import Bundler from '@sveltejs/repl/bundler';
    import Viewer from '@sveltejs/repl/viewer';
    import { Workspace, type File, type Item } from '@sveltejs/repl/workspace';
    import type { PageProps } from './$types.js';
    import { SvelteMap, SvelteSet } from 'svelte/reactivity';

    let { data }: PageProps = $props();

    const tree = $derived.by(() => {
        const groups = new SvelteMap<
            string,
            {
                title: string;
                chapters: { title: string; exercises: { slug: string; title: string }[] }[];
            }
        >();
        for (const stub of data.stubs) {
            if (!groups.has(stub.group))
                groups.set(stub.group, { title: stub.group, chapters: [] });
            const g = groups.get(stub.group)!;
            let ch = g.chapters.find((c) => c.title === stub.chapter);
            if (!ch) {
                ch = { title: stub.chapter, exercises: [] };
                g.chapters.push(ch);
            }
            ch.exercises.push({ slug: stub.slug, title: stub.title });
        }
        return Array.from(groups.values());
    });

    let nav_open = $state(false);
    let open_groups = new SvelteSet([data.exercise.group]);
    let open_chapters = new SvelteSet([data.exercise.chapter]);

    function toggle_group(group: string) {
        if (open_groups.has(group)) open_groups.delete(group);
        else open_groups.add(group);
    }

    function toggle_chapter(chapter: string) {
        if (open_chapters.has(chapter)) open_chapters.delete(chapter);
        else open_chapters.add(chapter);
    }

    const text_exts = new Set([
        '.svelte',
        '.ts',
        '.js',
        '.json',
        '.css',
        '.html',
        '.md',
        '.csv',
        '.txt',
        '.svg',
        '.env'
    ]);

    function make_items(files: Record<string, string>): Item[] {
        return Object.entries(files).map(([name, contents]) => {
            const basename = name.split('/').pop()!;
            const ext = basename.includes('.') ? basename.slice(basename.lastIndexOf('.')) : '';
            return {
                type: 'file' as const,
                name: '/' + name,
                basename,
                contents,
                text: text_exts.has(ext)
            };
        });
    }

    function is_solved(workspace_files: Item[], b: Record<string, string>): boolean {
        if (Object.keys(b).length === 0) return true;
        for (const [name, expected] of Object.entries(b)) {
            const file = workspace_files.find((f) => f.name === '/' + name);
            if (!file || file.type !== 'file') return false;
            if (file.contents.trim() !== expected.trim()) return false;
        }
        return true;
    }

    let svelte_version = $state('latest');
    let solved = $state(false);
    let dark_mode = $state(false);
    $effect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        dark_mode = mq.matches;
        const handler = (e: MediaQueryListEvent) => (dark_mode = e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    });

    const bundler = browser
        ? new Bundler({
              svelte_version,
              onversion: (v) => (svelte_version = v),
              onstatus: () => {}
          })
        : null;

    const workspace = new Workspace(make_items(data.exercise.a), {
        initial: '/' + data.exercise.focus,
        svelte_version,
        onupdate(file) {
            bundler?.bundle(
                workspace.files
                    .filter((f): f is File => f.type === 'file' && f.name.startsWith('/src/lib/'))
                    .map((f) => ({ ...f, name: f.name.slice(9) })),
                { runes: true, svelte_version }
            );
            solved = is_solved(workspace.files, data.exercise.b);
        },
        onreset(items) {
            bundler?.bundle(
                items
                    .filter((f): f is File => f.type === 'file' && f.name.startsWith('/src/lib/'))
                    .map((f) => ({ ...f, name: f.name.slice(9) })),
                { runes: true, svelte_version }
            );
            solved = false;
        }
    });

    afterNavigate(() => {
        workspace.reset(
            make_items(data.exercise.a),
            { tailwind: false },
            '/' + data.exercise.focus
        );
        solved = false;
        nav_open = false;
        open_groups.clear();
        open_groups.add(data.exercise.group);
        open_chapters.clear();
        open_chapters.add(data.exercise.chapter);
    });

    function toggle_solution() {
        const next = !solved;
        const target = solved ? data.exercise.a : data.exercise.b;
        workspace.set(make_items({ ...data.exercise.a, ...target }));
        // workspace.set() calls onreset synchronously, which sets solved = false.
        // Restore the intended value after onreset runs.
        solved = next;
    }
</script>

<svelte:head>
    <title>{data.exercise.title} • SveltePlot Tutorial</title>
</svelte:head>

<div class="tutorial">
    <SplitPane id="tutorial" type="columns" pos="35%" min="260px" max="-400px">
        {#snippet a()}
            <div class="prose-pane">
                <div class="prose-nav">
                    <button class="nav-trigger" onclick={() => (nav_open = !nav_open)}>
                        <span class="nav-trigger-label">
                            {data.exercise.group} / {data.exercise.chapter} / {data.exercise.title}
                        </span>
                        <svg
                            class="nav-chevron"
                            class:open={nav_open}
                            viewBox="0 0 10 6"
                            width="10"
                            height="6">
                            <path
                                d="M0 0 L5 6 L10 0"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>

                    {#if nav_open}
                        <div class="nav-backdrop" onclick={() => (nav_open = false)}></div>
                        <div class="nav-menu">
                            {#each tree as group (group.title)}
                                <div class="nav-group">
                                    <button
                                        class="nav-group-btn"
                                        onclick={() => toggle_group(group.title)}>
                                        <svg
                                            class="nav-folder-chevron"
                                            class:open={open_groups.has(group.title)}
                                            viewBox="0 0 6 10"
                                            width="6"
                                            height="10">
                                            <path
                                                d="M0 0 L6 5 L0 10"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        {group.title}
                                    </button>
                                    {#if open_groups.has(group.title)}
                                        {#each group.chapters as ch (ch.title)}
                                            <div class="nav-chapter">
                                                <button
                                                    class="nav-chapter-btn"
                                                    onclick={() => toggle_chapter(ch.title)}>
                                                    <svg
                                                        class="nav-folder-chevron"
                                                        class:open={open_chapters.has(ch.title)}
                                                        viewBox="0 0 6 10"
                                                        width="6"
                                                        height="10">
                                                        <path
                                                            d="M0 0 L6 5 L0 10"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="1.5"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                    {ch.title}
                                                </button>
                                                {#if open_chapters.has(ch.title)}
                                                    {#each ch.exercises as ex (ex.slug)}
                                                        <a
                                                            href={resolve(`/tutorial/${ex.slug}`)}
                                                            class="nav-exercise"
                                                            class:active={ex.slug ===
                                                                data.exercise.slug}>
                                                            {ex.title}
                                                        </a>
                                                    {/each}
                                                {/if}
                                            </div>
                                        {/each}
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
                <div class="prose-inner">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html data.exercise.html}
                </div>

                <div class="prose-footer">
                    {#if data.exercise.prev}
                        <a
                            href={resolve(`/tutorial/${data.exercise.prev.slug}`)}
                            class="nav-link prev">← {data.exercise.prev.title}</a>
                    {:else}
                        <span></span>
                    {/if}

                    {#if Object.keys(data.exercise.b).length > 0}
                        <button class="solve-btn" onclick={toggle_solution}>
                            {solved ? 'Reset' : 'Solve'}
                        </button>
                    {:else}
                        <span></span>
                    {/if}

                    {#if data.exercise.next}
                        <a
                            href={resolve(`/tutorial/${data.exercise.next.slug}`)}
                            class="nav-link next">{data.exercise.next.title} →</a>
                    {:else}
                        <span></span>
                    {/if}
                </div>
            </div>
        {/snippet}

        {#snippet b()}
            <SplitPane id="editor-output" type="columns" pos="50%" min="200px" max="-200px">
                {#snippet a()}
                    <div class="editor-pane">
                        {#if workspace.files.filter((f) => f.type === 'file' && !f.basename.startsWith('+')).length > 1}
                            <div class="file-tabs">
                                {#each workspace.files as file (file.name)}
                                    {#if file.type === 'file' && !file.basename.startsWith('+')}
                                        <button
                                            class="tab"
                                            class:active={workspace.current?.name === file.name}
                                            onclick={() => workspace.select(file.name)}>
                                            {file.basename}
                                        </button>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                        <Editor {workspace} />
                    </div>
                {/snippet}

                {#snippet b()}
                    <div class="output-pane">
                        {#if browser && bundler}
                            <Viewer
                                relaxed
                                {bundler}
                                status={null}
                                error={null}
                                theme={dark_mode ? 'dark' : 'light'} />
                        {/if}
                    </div>
                {/snippet}
            </SplitPane>
        {/snippet}
    </SplitPane>
</div>

<style>
    .tutorial {
        height: calc(100dvh - var(--header-height, 60px));
        display: flex;
        flex-direction: column;
        /* make SplitPane dividers visible */
        --color: var(--sk-border);
    }

    .prose-pane {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-size: 1.2rem;
        background: var(--sk-bg-2);
        border-right: 1px solid var(--sk-border);
        overflow: hidden;
    }

    .prose-nav {
        flex-shrink: 0;
        position: relative;
        border-bottom: 1px solid var(--sk-border);
        background: var(--sk-bg-1);
    }

    .nav-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        height: 2.25rem;
        padding: 0 0.75rem 0 1.75rem;
        background: none;
        border: none;
        color: var(--sk-fg-2);
        font: var(--sk-font-ui-medium);
        line-height: 1.4;
        cursor: pointer;
        text-align: left;
    }

    .nav-trigger:hover {
        background: var(--sk-bg-2);
    }

    .nav-trigger-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .nav-chevron {
        flex-shrink: 0;
        transition: transform 0.15s;
        opacity: 0.5;
    }
    .nav-chevron.open {
        transform: rotate(180deg);
    }

    .nav-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99;
    }

    .nav-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        background: var(--sk-bg-1);
        border: 1px solid var(--sk-border);
        border-top: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        max-height: 60vh;
        overflow-y: auto;
    }

    .nav-group-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.45rem 0.75rem;
        background: none;
        border: none;
        color: var(--sk-fg-1);
        font: var(--sk-font-ui-medium);
        font-weight: 600;
        cursor: pointer;
        text-align: left;
    }
    .nav-group-btn:hover {
        background: var(--sk-bg-2);
    }

    .nav-folder-chevron {
        flex-shrink: 0;
        transition: transform 0.15s;
        opacity: 0.5;
    }
    .nav-folder-chevron.open {
        transform: rotate(90deg);
    }

    .nav-chapter {
        padding-bottom: 0.25rem;
    }

    .nav-chapter-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.75rem 0.15rem 1.25rem;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        font: var(--sk-font-ui-small);
        color: var(--sk-fg-4);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .nav-chapter-btn:hover {
        background: var(--sk-bg-2);
        color: var(--sk-fg-2);
    }

    .nav-exercise {
        display: block;
        padding: 0.3rem 0.75rem 0.3rem 2.25rem;
        font: var(--sk-font-ui-medium);
        color: var(--sk-fg-2);
        text-decoration: none;
        border-left: 2px solid transparent;
    }
    .nav-exercise:hover {
        background: var(--sk-bg-2);
        color: var(--sk-fg-1);
    }
    .nav-exercise.active {
        color: var(--sk-fg-accent);
        border-left-color: var(--sk-fg-accent);
        background: var(--sk-bg-2);
    }

    .prose-inner {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem 1.75rem;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .prose-inner .chapter-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--sk-fg-4);
        margin: 0 0 0.4rem;
    }

    .prose-inner h2 {
        margin: 0 0 1rem;
        font-size: 1.2rem;
    }

    .prose-inner :global(a) {
        color: var(--sk-fg-accent);
        text-decoration: underline;
    }

    .prose-inner :global(pre) {
        background: var(--sk-bg-3);
        border: 1px solid var(--sk-border);
        border-radius: var(--sk-border-radius);
        padding: 0.75rem 1rem;
        overflow-x: auto;
        font: var(--sk-font-mono);
        font-size: 0.82rem;
        margin: 1rem 0;
    }

    .prose-inner :global(code) {
        font: var(--sk-font-mono);
        font-size: 0.82rem;
        background: var(--sk-bg-3);
        padding: 0.1em 0.35em;
        border-radius: 3px;
    }

    .prose-inner :global(pre code) {
        background: none;
        padding: 0;
    }

    /* shiki dual-theme: use light colors by default, dark colors when dark mode */
    .prose-inner :global(.shiki) {
        background-color: var(--shiki-light-bg, var(--sk-bg-3)) !important;
        border: 1px solid var(--sk-border);
        border-radius: var(--sk-border-radius);
        padding: 0.75rem 1rem;
        overflow-x: auto;
        font: var(--sk-font-mono);
        font-size: 0.82rem;
        margin: 1rem 0;
    }
    .prose-inner :global(.shiki span) {
        color: var(--shiki-light) !important;
    }
    @media (prefers-color-scheme: dark) {
        .prose-inner :global(.shiki) {
            background-color: var(--shiki-dark-bg, var(--sk-bg-3)) !important;
        }
        .prose-inner :global(.shiki span) {
            color: var(--shiki-dark) !important;
        }
    }

    /* diff line highlighting */
    .prose-inner :global(.shiki .line) {
        display: inline-block;
        width: 100%;
        padding: 0 1rem;
        margin: 0 -1rem;
    }

    .prose-inner :global(.shiki .line--file-header) {
        opacity: 0.4;
        font-style: italic;
    }
    .prose-inner :global(.shiki .inline-add),
    .prose-inner :global(.shiki .inline-add > *),
    .prose-inner :global(.shiki .line--added > *) {
        background: rgb(0 180 0 / 0.1) !important;
        color: light-dark(#0b670b, #a3f4a3) !important;
        border-radius: 2px;
    }
    .prose-inner :global(.shiki .inline-remove),
    .prose-inner :global(.shiki .inline-remove > *),
    .prose-inner :global(.shiki .line--deleted > *) {
        background: rgb(200 0 0 / 0.15) !important;
        color: rgb(255, 111, 111) !important;
        border-radius: 2px;
        opacity: 1;
    }

    .prose-footer {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0.5rem 1rem 8px;
        border-top: 1px solid var(--sk-border);
        background: var(--sk-bg-2);
        gap: 0.5rem;
        font-size: 0.82rem;
    }

    .nav-link {
        color: var(--sk-fg-accent);
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .nav-link:hover {
        text-decoration: underline;
    }
    .nav-link.next {
        text-align: right;
    }

    .solve-btn {
        padding: 0.3rem 0.9rem;
        background: var(--sk-fg-accent);
        color: white;
        border: none;
        border-radius: var(--sk-border-radius);
        cursor: pointer;
        font-size: 0.8rem;
        white-space: nowrap;
    }
    .solve-btn:hover {
        opacity: 0.85;
    }

    .editor-pane {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--sk-border);
    }

    .file-tabs {
        display: flex;
        flex-shrink: 0;
        height: 2.25rem;
        border-bottom: 1px solid var(--sk-border);
        background: var(--sk-bg-2);
        overflow-x: auto;
    }

    .tab {
        height: 100%;
        padding: 0 0.9rem;
        font: var(--sk-font-mono);
        font-size: 0.78rem;
        color: var(--sk-fg-3);
        background: none;
        border: none;
        border-right: 1px solid var(--sk-border);
        cursor: pointer;
        white-space: nowrap;
    }

    .tab:hover {
        color: var(--sk-fg-1);
        background: var(--sk-bg-3);
    }

    .tab.active {
        color: var(--sk-fg-1);
        background: var(--sk-bg-1);
        border-bottom: 2px solid var(--sk-fg-accent);
    }

    .output-pane {
        position: relative;
        height: 100%;
        background: white;
    }
</style>
