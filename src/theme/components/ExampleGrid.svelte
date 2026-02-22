<script lang="ts">
    import { shuffle } from 'd3-array';
    import { untrack } from 'svelte';
    import { useDark } from '$shared/ui';
    import { resolve } from '$app/paths';

    type ExampleImageModule = { default: string };
    type ExamplePageModule = { title?: string };
    type ShowcaseItem = { key: string; title: string };
    type Props = { examples?: string[] };

    const exampleImages = import.meta.glob<ExampleImageModule>('../../snapshots/*/*.png', {
        eager: true,
        query: {
            enhanced: true,
            w: 440
        }
    });

    const examplePages = import.meta.glob<ExamplePageModule>('../../routes/examples/*/*.svelte', {
        eager: true
    });

    let { examples = [] }: Props = $props();
    let showcase = $state<ShowcaseItem[]>([]);

    let shuffled = $state(false);

    const ds = useDark();

    function getExampleImageSrc(exampleKey: string, isDark: boolean): string {
        const imagePath = `../../snapshots/${exampleKey}${isDark ? '.dark' : ''}.png`;
        return (exampleImages[imagePath] as ExampleImageModule | undefined)?.default ?? '';
    }

    function getExamplePath(exampleKey: string): `/examples/${string}` {
        return `/examples/${exampleKey}`;
    }

    $effect(() => {
        if (shuffled) return;
        showcase = shuffle(
            untrack(() => examples)
                .slice()
                .map((d: string) => ({
                    key: d,
                    title: examplePages[`../../routes/examples/${d}.svelte`]?.title ?? d
                }))
        );
        shuffled = true;
    });
</script>

<div class="example-grid-background">
    {#each showcase as example (example.key)}
        <a href={resolve(getExamplePath(example.key))} title={example.title}
            ><enhanced:img
                src={getExampleImageSrc(example.key, ds.isDark)}
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
        padding: 6px;
        border-radius: 3px;
        cursor: pointer;

        // scale by 20% on hover
        transition:
            transform 0.15s ease-in-out,
            object-fit 0.15s ease-in-out;
        &:hover {
            transform: scale(1.4);
            z-index: 1;
            object-fit: contain;
            // aspect-ratio: 1 / 1;

            background: fixed var(--svelteplot-bg);
            // shadow
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
    }
</style>
