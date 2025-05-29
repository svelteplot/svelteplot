<script module>
    export const frontmatter = {
        title: 'Examples',
        description: 'Some description'
    };

    // list of maybe 9 nice examples showcases
    const showcase = [
        'line/gradient-line',
        'dot/1-colored-scatterplot',
        'geo/us-choropleth',
        'axis/datawrapper-ticks'
    ];
</script>

<script>
    import { groupBy } from 'es-toolkit';
    import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context';
    import { getContext } from 'svelte';
    import ExamplesGrid from 'svelteplot/ui/ExamplesGrid.svelte';
    const { isDark } = getContext(SVELTEPRESS_CONTEXT_KEY);

    const pages = import.meta.glob('./**/*.svelte', {
        eager: true
    });

    const paths = groupBy(
        Object.keys(pages).filter(
            (d) => !d.startsWith('./[group]')
        ),
        (d) => d.split('/')[1]
    );

    const screenshots = import.meta.glob(
        '/static/examples/**/*.png',
        {
            eager: true,
            import: 'default',
            query: '?url'
        }
    );

    const examples = $derived(
        showcase
            .map((url) =>
                Object.keys(pages).find(
                    (p) => p === `./${url}.svelte`
                )
            )
            .map((page) => ({
                page,
                title: pages[page].title,
                url: `/examples/${page.replace(/^..\//, './').replace('.svelte', '')}`,
                screenshot: screenshots[
                    page
                        .replace(
                            /^.\//,
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

<p>
    Sometimes it's easiest to learn a new framework by
    digging into examples.
</p>

<ExamplesGrid {examples} />

<div class="column-container">
    {#each Object.entries(paths) as [group, groupPages] (group)}
        <div>
            <h3>
                <a href="/examples/{group}"
                    >{pages[
                        groupPages.find((p) =>
                            p.endsWith('/_index.svelte')
                        )
                    ].title}</a>
            </h3>
            <ul>
                {#each groupPages.filter((p) => !p.endsWith('/_index.svelte')) as page (page)}
                    <li>
                        <a
                            href={page
                                .replace('./', 'examples/')
                                .replace('.svelte', '')}
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
        }
    }
</style>
