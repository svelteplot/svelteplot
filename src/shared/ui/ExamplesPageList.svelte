<script lang="ts">
    import { resolve } from '$app/paths';
    let {
        paths,
        pages
    }: {
        paths: Record<string, string[]>;
        pages: Record<
            string,
            {
                title: string;
                description?: string;
                sortKey?: number;
                transforms?: string[];
            }
        >;
    } = $props();

    function sortPages(a: string, b: string) {
        const sortA = pages[a].sortKey ?? 10;
        const sortB = pages[b].sortKey ?? 10;
        return sortA - sortB;
    }
</script>

<div class="column-container">
    {#each Object.entries(paths).sort( (a, b) => a[0].localeCompare(b[0]) ) as [group, groupPages] (group)}
        <div>
            <h3>
                <a href={resolve(`/examples/${group}`)}
                    >{pages[groupPages.find((p) => p.endsWith('/_index.svelte'))]?.title ??
                        group}</a>
            </h3>
            <ul>
                {#each groupPages
                    .sort(sortPages)
                    .filter((p) => !p.endsWith('/_index.svelte')) as page (page)}
                    <li>
                        <a href={resolve(page.replace('./', './examples/').replace('.svelte', ''))}
                            >{pages[page].title}</a>
                    </li>
                {/each}
            </ul>
        </div>
    {/each}
</div>

<style>
    .column-container {
        columns: 2;
        column-gap: 1rem;
        column-fill: balance;
        > div {
            padding-top: 1em;
            break-before: column;
            break-inside: avoid-column;
        }
        h3 {
            break-before: avoid-column;
            text-transform: capitalize;
        }
    }
</style>
