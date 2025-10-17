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
        'geo/earthquakes',
        'area/streamgraph',

        'regression/grouped',
        'vector/spike-map',
        'vector/wind',
        'axis/datawrapper-ticks'
    ];
</script>

<script lang="ts">
    import { groupBy } from 'es-toolkit';
    import {
        SVELTEPRESS_CONTEXT_KEY,
        type SveltepressContext
    } from '@sveltepress/theme-default/context';
    import { getContext } from 'svelte';
    import ExamplesGrid from 'svelteplot/ui/ExamplesGrid.svelte';
    import { resolve } from '$app/paths';
    import ExamplesPageList from 'svelteplot/ui/ExamplesPageList.svelte';

    const { isDark } = getContext<SveltepressContext>(
        SVELTEPRESS_CONTEXT_KEY
    );

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
                screenshot: resolve(
                    `/examples/${page
                        .replace(/^..\//, '')
                        .replace(
                            '.svelte',
                            $isDark ? '.dark.png' : '.png'
                        )}`
                )
            }))
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
    examples.
</p>

<ExamplesGrid {examples} />

<h2>Organized by marks</h2>

<ExamplesPageList {paths} {pages} />

<h2>Organized by transforms</h2>

<ExamplesPageList paths={pagesByTransform} {pages} />
