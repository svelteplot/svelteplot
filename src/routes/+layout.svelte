<script lang="ts">
    import { afterNavigate, beforeNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import '../app.scss';
    import { shuffle } from 'd3-array';
    import { untrack } from 'svelte';
    import { slide } from 'svelte/transition';

    const exampleImages = import.meta.glob('../../static/examples/*/*.png', {
        eager: true,
        query: {
            enhanced: true,
            w: 440
        }
    });

    let showcase = $state(
        [
            'difference/trade-balance',
            'difference/apple-yoy',
            'axis/datawrapper-ticks',
            'line/geo-line',
            'rect/stacked-histogram',
            'box/box-x-faceted',
            'box/box-y',
            'waffle/stacked-x',
            'line/running-mean',
            'vector/spike-map',
            'brush/overview-detail',
            'waffle/custom-symbol',
            'area/streamgraph',
            'difference/anomaly-baseline',
            'dot/dodge-faceted',
            'area/smoothed-area',
            'tick/tick-x',
            'cell/temperatures-threshold',
            'image/image-beeswarm',
            'rect/marimekko',
            'dot/1-colored-scatterplot',
            'link/spherical-link',
            'line/gradient-line',
            'vector/wind',
            'bar/faceted-bars',
            'custom/histogram-topline',
            'box/box-y-facet',
            'rect/marimekko-faceted',
            'geo/earthquakes',
            'rect/binned',
            'rule/data-rules',
            'dot/beeswarm-bubbles',
            'arrow/metro',
            'regression/grouped',
            'geo/us-choropleth',
            'regression/log'
        ].map((d) => ({
            key: d
        }))
    );

    afterNavigate(() => {
        const content = document.querySelector('.content');
        if (content) {
            // headline version links
            content
                .querySelectorAll('h1 + .admonition-info, h2 + .admonition-info')
                .forEach((el) => {
                    if (el.querySelector('.admonition-content').innerText.startsWith('added in')) {
                        const version = el
                            .querySelector('.admonition-content')
                            .innerText.replace('added in ', '')
                            .trim();
                        const header = el.previousElementSibling;
                        el.remove();
                        const a = document.createElement('a');
                        a.innerHTML = `<span class="admonition-content">^${version}</span>`;
                        a.target = '_blank';
                        a.title = `Added in version ${version}`;
                        a.classList.add('version-link');
                        a.classList.add('admonition-info');
                        a.href = `https://github.com/svelteplot/svelteplot/releases/tag/v${version}`;
                        header?.appendChild(a);
                    }
                });
            // inline version links
            content.querySelectorAll('em').forEach((el) => {
                if (el.innerText.startsWith('added in')) {
                    const version = el.innerText.replace('added in ', '').trim();
                    const parent = el.parentElement;
                    el.remove();
                    const a = document.createElement('a');
                    a.innerHTML = `<span class="admonition-content">^${version}</span>`;
                    a.target = '_blank';
                    a.title = `Added in version ${version}`;
                    a.classList.add('version-link');
                    a.classList.add('admonition-info');
                    a.href = `https://github.com/svelteplot/svelteplot/releases/tag/v${version}`;
                    parent?.appendChild(a);
                }
            });
        }
    });

    let shuffled = $state(false);

    $effect(() => {
        if (shuffled) return;
        showcase = shuffle(untrack(() => showcase).slice());
        shuffled = true;
    });

    beforeNavigate(() => {
        if (page.url.pathname === '/') {
            showcase = shuffle(showcase.slice());
        }
    });

    let isDark = $state(false);

    $effect(() => {
        // watch dark class on html element
        const observer = new MutationObserver(() => {
            isDark = document.documentElement.classList.contains('dark');
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        isDark = document.documentElement.classList.contains('dark');
        return () => observer.disconnect();
    });

    const showExampleGrid = $derived(shuffled && page.url.pathname === '/');
</script>

<slot />

{#if showExampleGrid}
    <div class="example-grid-background">
        {#each showcase as example (example.key)}
            <a animate:slide href={resolve(`/examples/${example.key}`)}
                ><enhanced:img
                    src={exampleImages[
                        `../../static/examples/${example.key}${isDark ? '.dark' : ''}.png`
                    ].default}
                    alt={example.key} /></a>
        {/each}
    </div>
{/if}

<style lang="scss">
    :global(.version-link) {
        font-size: 11px;
        margin-left: 0.75em;
        text-decoration: none;
        opacity: 0.8;
        vertical-align: super;
        background-color: rgb(118 51 219 / 30%);
        color: #7633db;
        padding: 0.3rem;
        line-height: 1;
        border-radius: 0.15rem;
        display: inline-block;
        text-decoration: none !important;
        font-weight: normal;
    }
    :root {
        --example-grid-columns: 6;
    }
    @media (max-width: 900px) {
        :root {
            --example-grid-columns: 5;
        }
    }
    @media (max-width: 800px) {
        :root {
            --example-grid-columns: 4;
        }
    }
    @media (max-width: 600px) {
        :root {
            --example-grid-columns: 3;
        }
    }
    @media (max-width: 500px) {
        :root {
            --example-grid-columns: 2;
        }
    }
    .example-grid-background {
        /* width: 100%; */
        display: grid;
        overflow-x: clip;
        grid-template-columns: repeat(var(--example-grid-columns), 1fr);
        grid-auto-rows: 1fr;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem 1.5rem;
    }

    .example-grid-background :global(img) {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 2;
        object-fit: cover;
        position: relative;
        padding: 8px;

        // scale by 20% on hover
        transition: transform 0.3s ease;
        &:hover {
            transform: scale(1.2);
            z-index: 1;

            background: fixed var(--svelteplot-bg);
            // shadow
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    }
</style>
