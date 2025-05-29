<script>
    import { page } from '$app/state';
    import { HighlightSvelte } from 'svelte-highlight';
    import codeStyleLight from 'svelte-highlight/styles/atom-one-light';
    import codeStyleDark from 'svelte-highlight/styles/atom-one-dark';

    import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    import { getContext } from 'svelte';

    const pages = import.meta.glob('../../**/*.svelte', {
        eager: true
    });
    const pagesSrc = import.meta.glob('../../**/*.svelte', {
        eager: true,
        query: '?raw',
        import: 'default'
    });

    const parentPage = $derived(
        Object.keys(pages).find(
            (d) =>
                d
                    .replace(/^..\/..\//, '')
                    .replace('.svelte', '') ===
                `${page.params.group}/_index`
        )
    );

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
</script>

<svelte:head>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html $isDark ? codeStyleDark : codeStyleLight}
</svelte:head>

{#if plotKey}
    <div class="breadcrumb">
        <a href="/examples">Examples</a> <span>/</span>
        <a href="/examples/{page.params.group}"
            >{pages[parentPage].title}</a>
    </div>
    <h1 class="page-title">{mod.title}</h1>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {#if mod.description}<p>{@html mod.description}</p>{/if}
    <mod.default />

    <div class="svp-code-block-wrapper">
        <div class="svp-code-block">
            <HighlightSvelte
                lang="svelte"
                code={pagesSrc[plotKey].substring(
                    pagesSrc[plotKey].indexOf('<Plot')
                )} />
        </div>
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
    .list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        width: 100%;
        margin: 2rem 0;
    }

    .list > div {
        display: flex;
        flex-direction: column;
        align-items: left;
        row-gap: 0.3rem;

        > a {
            border: 1px solid #88888822;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            padding: 1.5ex;
        }

        &:hover {
            > a {
                border: 1px solid currentColor;
            }
            h4 a {
                text-decoration: underline;
            }
        }
    }

    .list img {
        width: 100%;
        box-sizing: border-box;
        border-radius: 3px;
        transition: transform 0.2s ease-in-out;
    }

    .list h4 {
        margin: 0rem;
        font-weight: normal;
        font-size: 13px;
        line-height: 1;
        > a {
            text-decoration: none;
        }
    }
    .breadcrumb span {
        opacity: 0.5;
    }
</style>
