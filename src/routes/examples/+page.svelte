<script module>
    export const frontmatter = {
        title: 'Examples',
        description: ''
    };
</script>

<script lang="ts">
    import { groupBy } from 'es-toolkit';
    import { getContext } from 'svelte';
    import { resolve } from '$app/paths';
    import ExamplesPagePreview from 'svelteplot/ui/ExamplesPagePreview.svelte';

    const pages = import.meta.glob('./**/*.svelte', {
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

    const paths = groupBy(
        Object.keys(pages).filter(
            (d) => !d.startsWith('./[group]')
        ),
        (d) => d.split('/')[1]
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
</script>

<p>
    It's easiest to learn a new framework by digging into
    examples. A lot of the examples here are based on
    examples from the wonderful <a
        href="https://observablehq.com/plot"
        >Observable Plot examples gallery</a
    >.
</p>

<!-- <ExamplesGrid {examples} /> -->
<h3>Jump to mark</h3>
<ul class="quick-links">
    {#each Object.keys(paths).sort( (a, b) => a.localeCompare(b) ) as group (group)}
        <li>
            <a href={resolve(`/examples/${group}`)}
                >{group}</a>
        </li>
    {/each}
</ul>

<h3>Jump to transform</h3>
<ul class="quick-links">
    {#each Object.keys(pagesByTransform).sort( (a, b) => a.localeCompare(b) ) as group (group)}
        <li>
            <a href={resolve(`/examples/${group}`)}
                >{group}</a>
        </li>
    {/each}
</ul>

<ExamplesPagePreview {paths} {pages} />

<!-- <ExamplesPageList {paths} {pages} /> -->

<ExamplesPagePreview paths={pagesByTransform} {pages} />

<style>
    h3 {
        margin: 0;
    }
    .quick-links {
        display: block;
        margin: 0 0 1rem 0;
        padding: 0;
        li {
            display: inline-block;
            font-size: 0.875rem;
            margin: 0;
            padding: 0 1.25rem 0.25rem 0;

            a {
                text-transform: capitalize;
            }
        }
    }
</style>
