<script lang="ts">
    import { resolve } from '$app/paths';
    import { shuffle } from 'd3-array';
    import { untrack } from 'svelte';
    import { slide } from 'svelte/transition';

    const exampleImages = import.meta.glob('../../../static/examples/*/*.png', {
        eager: true,
        query: {
            enhanced: true,
            w: 440
        }
    });

    const examplePages = import.meta.glob('../../routes/examples/*/*.svelte', {
        eager: true
    });

    let { examples } = $props();
    let showcase = $state([]);

    let shuffled = $state(false);

    $effect(() => {
        if (shuffled) return;
        showcase = shuffle(
            untrack(() => examples)
                .slice()
                .map((d) => ({
                    key: d,
                    title: examplePages[`../../routes/examples/${d}.svelte`]?.title
                }))
        );
        shuffled = true;
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
</script>

<div class="example-grid-background">
    {#each showcase as example (example.key)}
        <a animate:slide href={resolve(`/examples/${example.key}`)} title={example.title}
            ><enhanced:img
                src={exampleImages[
                    `../../../static/examples/${example.key}${isDark ? '.dark' : ''}.png`
                ].default}
                alt={example.title} /></a>
    {/each}
</div>

<style lang="scss">
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
