<script lang="ts">
    import { resolve } from '$app/paths';
    import { useDark } from './isDark.svelte';

    const exampleImages = import.meta.glob('../../snapshots/*/*.png', {
        eager: true,
        query: {
            enhanced: true,
            w: 440
        }
    });

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

    const ds = useDark();

    function sortPages(a: string, b: string) {
        const sortA = pages[a].sortKey ?? 10;
        const sortB = pages[b].sortKey ?? 10;
        return sortA - sortB;
    }
</script>

<div class="column-container">
    {#each Object.entries(paths).sort( (a, b) => a[0].localeCompare(b[0]) ) as [group, groupPages] (group)}
        <div>
            <h2 id={group}>
                <a href={resolve(`/examples/${group}`)}
                    >{pages[groupPages.find((p) => p.endsWith('/_index.svelte'))]?.title ??
                        group}</a>
            </h2>
            <div class="example-grid">
                {#each groupPages
                    .sort(sortPages)
                    .filter((p) => !p.endsWith('/_index.svelte')) as page (page)}
                    {@const imageKey = `../../snapshots/${page
                        .replace('./', '')
                        .replace('.svelte', ds.isDark ? '.dark.png' : '.png')}`}
                    <a
                        animate:slide
                        href={resolve(page.replace('./', './examples/').replace('.svelte', ''))}
                        ><div>
                            {#if exampleImages[imageKey]}
                                <enhanced:img
                                    title={pages[page].title}
                                    src={exampleImages[imageKey].default}
                                    alt={pages[page].title} />
                            {/if}
                            <div class="title">{pages[page].title}</div>
                        </div></a>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    :global(.content) h2 {
        margin-top: 1rem !important;
        margin-bottom: 1rem;
        text-transform: capitalize;
        border: 0;
        a {
            text-decoration: none;
            color: inherit;
        }
    }

    .column-container {
        container-type: inline-size;
    }

    .example-grid {
        --example-grid-columns: 5;

        /* width: 100%; */
        display: grid;
        /* overflow-x: clip; */
        grid-template-columns: repeat(var(--example-grid-columns), 1fr);
        grid-auto-rows: 1fr;
        gap: 1.25rem;

        a {
            text-decoration: none;
            color: inherit;
        }

        .title {
            font-size: 0.75rem;
            opacity: 0.8;
            line-height: 1.2;
            text-decoration: none;
        }
    }

    @container (max-width: 800px) {
        .example-grid {
            --example-grid-columns: 4;
        }
    }
    @container (max-width: 600px) {
        .example-grid {
            --example-grid-columns: 3;
        }
    }
    @container (max-width: 500px) {
        .example-grid {
            --example-grid-columns: 2;
        }
    }

    .example-grid :global(img) {
        height: auto !important;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        width: 100%;
        height: auto;

        position: relative;
        transition: transform 0.05s ease-out;
        &:hover {
            transform: scale(1.5);
            object-fit: contain;
            z-index: 1;

            background: fixed var(--svelteplot-bg);

            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    }
</style>
