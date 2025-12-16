<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';

    import { getContext } from 'svelte';
    import ExamplesGrid from 'svelteplot/ui/ExamplesGrid.svelte';

    const pages = import.meta.glob('../**/*.svelte', {
        eager: true
    }) as Record<
        string,
        {
            title: string;
            description?: string;
            sortKey?: number;
            transforms?: string[];
        }
    >;

    // Screenshots are under `static/examples` (Vite publicDir).
    // Do not import from publicDir; construct URLs directly.

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
        if (pagesByTransform[page.params.group]) {
            // If the group matches a transform, return those pages
            return pagesByTransform[page.params.group];
        }
        return Object.keys(pages).filter((d) =>
            d
                .replace(/^..\//, '')
                .startsWith(`${page.params.group}/`)
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
        pagesByTransform[page.params.group]
            ? 'transform'
            : 'mark'
    );
</script>

{#if subPages.length}
    <a href={resolve('/examples')}>Examples</a>

    <h1>{page.params.group}</h1>
    <p>
        Examples showing the use of the <a
            href={resolve(`/${type}s/${page.params.group}`)}
            >{page.params.group} {type}</a
        >.
    </p>
    {#if indexKey}
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
