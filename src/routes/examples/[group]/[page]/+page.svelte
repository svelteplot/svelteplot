<script lang="ts">
    import { page } from '$app/state';
    import codeStyleLight from 'svelte-highlight/styles/atom-one-light';
    import codeStyleDark from 'svelte-highlight/styles/atom-one-dark';

    import { resolve } from '$app/paths';
    import type { Component } from 'svelte';
    import Next from '../../../../theme/components/icons/Next.svelte';
    import Prev from '../../../../theme/components/icons/Prev.svelte';
    import { useDark } from '$shared/ui';
    import CodeBlock from '../../../../theme/components/CodeBlock.svelte';

    import {
        createREPLState,
        encodePlaygroundState
    } from './replUtils';

    type ExampleModule = {
        default: Component<any>;
        title: string;
        description?: string;
        sortKey?: number;
        fullCode?: boolean;
        data?: Record<string, string>;
    };

    type NavLink = {
        key: string | null;
        title: string | null;
    };

    const pages = import.meta.glob('../../**/*.svelte', {
        eager: true
    }) as Record<string, ExampleModule>;
    const pagesSrc = import.meta.glob('../../**/*.svelte', {
        eager: true,
        query: '?raw',
        import: 'default'
    }) as Record<string, string>;

    function toPathKey(exampleKey: string) {
        return `../../${exampleKey}.svelte`;
    }

    function getModule(exampleKey: string) {
        return pages[toPathKey(exampleKey)] ?? null;
    }

    const sortedPages = Object.entries(pages)
        .filter(([key]) => key.split('/').length === 4)
        // sort by sortKey if present
        .sort(([a, aMod], [b, bMod]) => {
            const aKey = aMod.sortKey ?? 10;
            const bKey = bMod.sortKey ?? 10;
            return aKey - bKey;
        })
        // now sort by the part after the second slash
        .sort(([a], [b]) =>
            a.split('/')[2].localeCompare(b.split('/')[2])
        )
        .map(([key, mod]) => key);

    let { data }: { data: Record<string, unknown> } =
        $props();

    const key = $derived(
        `${page.params.group}/${page.params.page}`
    );

    const plotKey = $derived(
        Object.keys(pages).find(
            (d) =>
                d
                    .replace(/^..\/..\//, '')
                    .replace('.svelte', '') === key
        )
    );
    const mod = $derived(plotKey ? pages[plotKey] : null);
    const source = $derived(
        plotKey ? pagesSrc[plotKey] : null
    );

    const [prevPage, nextPage] = $derived.by(
        (): [NavLink, NavLink] => {
            if (!plotKey) {
                return [
                    { key: null, title: null },
                    { key: null, title: null }
                ];
            }

            const keys = sortedPages.map((d) =>
                d
                    .replace(/^..\/..\//, '')
                    .replace('.svelte', '')
            );
            const index = keys.indexOf(key);
            const prevNext: [string | null, string | null] =
                [
                    index > 0 ? keys[index - 1] : null,
                    index >= 0 && index < keys.length - 1
                        ? keys[index + 1]
                        : null
                ];

            const toNavLink = (
                value: string | null
            ): NavLink => {
                if (!value)
                    return { key: null, title: null };
                return {
                    key: value,
                    title: getModule(value)?.title ?? null
                };
            };

            return [
                toNavLink(prevNext[0]),
                toNavLink(prevNext[1])
            ];
        }
    );

    function cleanCode(code: string) {
        if (code.includes('<script lang="ts">')) {
            // filter the code found between script tags to remove import statements,
            // including multi-line imports
            const [beforeScript, script, svelte] =
                code.split(/<\/?script[^>]*>/);

            const cleanedScript =
                script

                    .split(';')
                    .filter((line) => {
                        const trimmed = line.trim();
                        return !(
                            trimmed.startsWith('import ') ||
                            trimmed.includes(
                                'ExamplesData'
                            ) ||
                            trimmed === ''
                        );
                    })
                    .join(';')
                    .trim() + 'x';

            return `<scr${'ipt'} lang="ts">\n    // imports etc.\n    ${cleanedScript}\n</scr${'ipt'}>\n\n${svelte.trim()}`;
        }
        return code.trim();
    }

    const sourceSimple = $derived(
        (source ?? '')
            .replace(/\((\w+) as any\)/g, '$1')
            .replace(/ as any/g, '')
            .replace(/: any(\W)/g, '$1')
    );

    const replHash = $derived(
        encodePlaygroundState(
            createREPLState(
                mod?.title ?? '',
                key,
                sourceSimple ?? '',
                mod?.data ?? {},
                (data ?? {}) as any
            )
        )
    );

    const ds = useDark();
</script>

<svelte:head>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html ds.isDark ? codeStyleDark : codeStyleLight}
</svelte:head>

{#if plotKey}
    <div class="breadcrumb">
        <a href={resolve('/examples')}>Examples</a>
        <span>/</span>
        <a href={resolve(`/examples/${page.params.group}`)}
            >{page.params.group}</a>
    </div>
    <h1 class="page-title">{mod?.title}</h1>
    {#if mod?.description}
        <p>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html mod.description}
        </p>
    {/if}

    {#key data}
        <div class="screenshot">
            {#if mod}<mod.default {...data} />{/if}
        </div>
    {/key}

    {#key source}
        <div class="svp-code-block-wrapper">
            <div class="svp-code-block">
                {#if source && mod}
                    <CodeBlock
                        lang="svelte"
                        code={cleanCode(
                            sourceSimple.substring(
                                mod.fullCode
                                    ? sourceSimple.indexOf(
                                          '<script lang="ts">'
                                      )
                                    : sourceSimple.lastIndexOf(
                                          '</scr' + 'ipt>'
                                      ) + 9
                            )
                        )} />
                {/if}
            </div>
        </div>
    {/key}

    {#await replHash then hash}
        <p>
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
            <a
                href="https://svelte.dev/playground/hello-world?version=5{hash}"
                target="_blank"
                >Open in Svelte playground</a>
        </p>
    {/await}

    <!-- show links to prev and next page -->
    <div class="page-switcher">
        {#each [prevPage, nextPage] as nav, i (i)}
            <div
                class={[
                    !!nav.key && 'switcher',
                    i === 1 && 'right'
                ]}>
                {#if nav.key}
                    <a
                        href={resolve(
                            `/examples/${nav.key}`
                        )}
                        class="trigger">
                        <div class="title">
                            {#if i === 0}
                                <Prev />
                            {/if}
                            <div class="title-label">
                                {nav.title}
                            </div>
                            {#if i === 1}
                                <Next />
                            {/if}
                        </div>
                    </a>
                {/if}
            </div>
        {/each}
    </div>
{:else}
    <h2>Not found</h2>
{/if}

<style lang="scss">
    .svp-code-block-wrapper {
        margin-top: 2rem;
        :global {
            .svp-code-block > pre {
                margin: 0;
            }
            .hljs {
                padding: 0;
                background-color: transparent;
                font-family: var(--svp-code-font);
            }
        }
    }
    .breadcrumb {
        a {
            text-transform: capitalize;
        }
        span {
            opacity: 0.5;
        }
    }

    .page-switcher {
        --at-apply: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8';
    }
    .switcher {
        --at-apply: ' flex-grow cursor-pointer transition-300 transition-colors';
    }

    .title {
        --at-apply: 'flex items-center ';
    }
    .right .title {
        --at-apply: 'justify-end';
    }
    .title-label {
        --at-apply: 'ml-2';
    }
    .right .title-label {
        --at-apply: 'mr-2 ml-none';
    }
    .right {
        --at-apply: 'text-right';
    }

    .trigger {
        --at-apply: ' block';
    }
    :global(.svp-table) {
        // style the wx-svelte-grid table
        --wx-table-border: #cccccc;
    }

    .screenshot {
        :global(.container) {
            container-type: inline-size;
        }

        :global(.two-cols) {
            display: flex;
            gap: 1em;
        }

        :global(.two-cols figure) {
            flex: 50%;
        }

        :global(.two-cols svg) {
            max-width: 100%;
        }
    }

    @container (width < 500px) {
        .screenshot :global(.two-cols) {
            flex-direction: column;
        }
    }
</style>
