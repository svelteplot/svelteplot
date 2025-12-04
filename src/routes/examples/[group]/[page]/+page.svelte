<script lang="ts">
    import { page } from '$app/state';
    import { HighlightSvelte } from 'svelte-highlight';
    import codeStyleLight from 'svelte-highlight/styles/atom-one-light';
    import codeStyleDark from 'svelte-highlight/styles/atom-one-dark';

    import { resolve } from '$app/paths';
    import Next from '../../../../theme/components/icons/Next.svelte';
    import Prev from '../../../../theme/components/icons/Prev.svelte';
    import { useDark } from 'svelteplot/ui/isDark.svelte';
    import CodeBlock from '../../../../theme/components/CodeBlock.svelte';

    const pages = import.meta.glob('../../**/*.svelte', {
        eager: true
    });
    const pagesSrc = import.meta.glob('../../**/*.svelte', {
        eager: true,
        query: '?raw',
        import: 'default'
    });

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

    let { data } = $props();

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

    const [prevPage, nextPage] = $derived.by(() => {
        if (!plotKey) return [null, null];
        const keys = sortedPages.map((d) =>
            d
                .replace(/^..\/..\//, '')
                .replace('.svelte', '')
        );
        const index = keys.indexOf(key);
        let prev = null;
        let next = null;
        const prevNext = [
            index > 0 ? keys[index - 1] : null,
            index >= 0 && index < keys.length - 1
                ? keys[index + 1]
                : null
        ];

        return prevNext.map((key) => ({
            key,
            title: key
                ? pages[
                      Object.keys(pages).find(
                          (d) =>
                              d
                                  .replace(/^..\/..\//, '')
                                  .replace(
                                      '.svelte',
                                      ''
                                  ) === key
                      )!
                  ].title
                : null
        }));
    });

    function cleanCode(code: string) {
        if (code.includes('<script lang="ts">')) {
            // filter the code found between script tags to remove import statements,
            // including multi-line imports
            const [beforeScript, script, svelte] =
                code.split(/<\/?script[^>]*>/);

            const cleanedScript = script
                .split(';')
                .filter((line) => {
                    const trimmed = line.trim();
                    return !(
                        trimmed.startsWith('import ') ||
                        trimmed.includes('ExamplesData') ||
                        trimmed === ''
                    );
                })
                .join(';')
                .trim();

            return `<scr${'ipt'} lang="ts">\n    // imports etc.\n    ${cleanedScript}\n</scr${'ipt'}>\n\n${svelte.trim()}`;
        }
        return code.trim();
    }

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
    <h1 class="page-title">{mod.title}</h1>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {#if mod.description}<p>{@html mod.description}</p>{/if}

    {#key data}
        <div class="screenshot">
            <mod.default {...data} />
        </div>
    {/key}

    {#key plotKey}
        <div class="svp-code-block-wrapper">
            <div class="svp-code-block">
                <CodeBlock
                    lang="svelte"
                    isDark={ds.isDark}
                    code={cleanCode(
                        pagesSrc[plotKey].substring(
                            pages[plotKey].fullCode
                                ? pagesSrc[plotKey].indexOf(
                                      '<script lang="ts">'
                                  )
                                : pagesSrc[
                                      plotKey
                                  ].lastIndexOf(
                                      '</scr' + 'ipt>'
                                  ) + 9
                        )
                    )} />
            </div>
        </div>
    {/key}

    {#if pages[plotKey].repl}
        <p>
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
            <a href={pages[plotKey].repl} target="_blank"
                >Open in Svelte playground</a>
        </p>
    {/if}

    <!-- show links to prev and next page -->
    <div class="page-switcher">
        {#each [prevPage, nextPage] as page, i (i)}
            <div
                class={[
                    !!page.key && 'switcher',
                    i === 1 && 'right'
                ]}>
                {#if page.key}
                    <a
                        href={resolve(
                            `/examples/${page.key}`
                        )}
                        class="trigger">
                        <div class="title">
                            {#if i === 0}
                                <Prev />
                            {/if}
                            <div class="title-label">
                                {page.title}
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

<style>
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
</style>
