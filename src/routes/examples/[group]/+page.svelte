<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';

    import type { Component } from 'svelte';
    import ExamplesGrid from '$shared/docs/ExamplesGrid.svelte';

    type ExampleModule = {
        default: Component<any>;
        title: string;
        description?: string;
        sortKey?: number;
        transforms?: string[];
    };

    const pages = import.meta.glob('../**/*.svelte', {
        eager: true
    }) as Record<string, ExampleModule>;

    // Screenshots are under `static/examples` (Vite publicDir).
    // Do not import from publicDir; construct URLs directly.
    const group = $derived(page.params.group ?? '');

    const indexKey = $derived(
        Object.keys(pages).find(
            (d) =>
                d
                    .replace(/^..\//, '')
                    .replace('/_index.svelte', '') === group
        )
    );
    const indexMod = $derived(
        indexKey ? pages[indexKey] : null
    );

    const pagesByTransform = $derived(
        Object.entries(pages).reduce(
            (acc, [path, mod]) => {
                if (mod.transforms) {
                    mod.transforms.forEach((transform) => {
                        if (!acc[transform]) {
                            acc[transform] = [];
                        }
                        acc[transform].push(path);
                    });
                }
                return acc;
            },
            {} as Record<string, string[]>
        )
    );

    const subPages = $derived.by(() => {
        if (pagesByTransform[group]) {
            // If the group matches a transform, return those pages
            return pagesByTransform[group];
        }
        return Object.keys(pages).filter((d) =>
            d.replace(/^..\//, '').startsWith(`${group}/`)
        );
    });

    const examples = $derived(
        subPages
            .filter(
                (page) => !page.endsWith('/_index.svelte')
            )
            .sort((a, b) => {
                const sortA = pages[a].sortKey ?? 10;
                const sortB = pages[b].sortKey ?? 10;
                return sortA - sortB;
            })
            .map((page) => ({
                page,
                title: pages[page].title,
                key: page
                    .replace(/^..\//, '')
                    .replace('.svelte', ''),
                url: `/examples/${page.replace(/^..\//, './').replace('.svelte', '')}`
            }))
    );

    const type: 'mark' | 'transform' = $derived(
        pagesByTransform[group] ? 'transform' : 'mark'
    );
    const docsHref = $derived(`/${type}s/${group}`);
</script>

{#if subPages.length}
    <a href={resolve('/examples')}>Examples</a>

    <h1>{page.params.group}</h1>
    <p>
        Examples showing the use of the
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={docsHref}>{page.params.group} {type}</a>.
    </p>
    {#if indexMod}
        <indexMod.default />
    {/if}
    <ExamplesGrid {examples} />
{:else}
    <h2>Not found</h2>
{/if}

<style>
    h1 {
        text-transform: capitalize;
    }
</style>
