<script>
    import { page } from '$app/state';

    import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    import { getContext } from 'svelte';
    import ExamplesGrid from 'svelteplot/ui/ExamplesGrid.svelte';

    const pages = import.meta.glob('../**/*.svelte', {
        eager: true
    });

    const screenshots = import.meta.glob(
        '/static/examples/**/*.png',
        {
            eager: true,
            import: 'default',
            query: '?url'
        }
    );

    const indexKey = $derived(
        Object.keys(pages).find(
            (d) =>
                d
                    .replace(/^..\//, '')
                    .replace('/_index.svelte', '') ===
                page.params.group
        )
    );
    const indexMod = $derived(
        indexKey ? pages[indexKey] : null
    );

    const subPages = $derived(
        Object.keys(pages).filter((d) =>
            d
                .replace(/^..\//, '')
                .startsWith(`${page.params.group}/`)
        )
    );

    const examples = $derived(
        subPages
            .filter(
                (page) => !page.endsWith('/_index.svelte')
            )
            .map((page) => ({
                page,
                title: pages[page].title,
                url: `/examples/${page.replace(/^..\//, './').replace('.svelte', '')}`,
                screenshot: screenshots[
                    page
                        .replace(
                            /^..\//,
                            '/static/examples/'
                        )
                        .replace(
                            '.svelte',
                            $isDark ? '.dark.png' : '.png'
                        )
                ]?.replace('/static', '')
            }))
    );
</script>

{#if subPages.length}
    {#if indexKey}
        <a href="/examples">Examples</a>
        <indexMod.default />

        <ExamplesGrid {examples} />
    {/if}
{:else}
    <h2>Not found</h2>
{/if}
