<script lang="ts">
    import { resolve } from '$app/paths';
    import { useDark } from '$shared/ui';

    let { keys }: { keys: string[] } = $props();

    const allModules = import.meta.glob('../../routes/examples/**/*.svelte', {
        eager: true
    }) as Record<string, { title?: string }>;

    const allImages: Record<string, any> = import.meta.glob('../../snapshots/*/*.png', {
        eager: true,
        query: { enhanced: true, w: 640 }
    });

    const ds = useDark();

    const examples = $derived(
        keys
            .map((key) => ({
                key,
                title: allModules[`../../routes/examples/${key}.svelte`]?.title ?? key,
                url: `/examples/${key}`
            }))
            .filter((ex) => allModules[`../../routes/examples/${ex.key}.svelte`])
    );
</script>

{#if examples.length}
    <div class="list">
        {#each examples as ex (ex.key)}
            <a href={resolve(ex.url as any)}>
                <div>
                    {#if allImages[`../../snapshots/${ex.key}.png`]}
                        <enhanced:img
                            src={ds.isDark && allImages[`../../snapshots/${ex.key}.dark.png`]
                                ? allImages[`../../snapshots/${ex.key}.dark.png`].default.img.src
                                : allImages[`../../snapshots/${ex.key}.png`].default.img.src}
                            alt={ex.title} />
                    {/if}
                </div>
                <!-- <h4>{ex.title}</h4> -->
            </a>
        {/each}
    </div>
{/if}

<style>
    .list {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        width: 100%;
        margin: 2rem 0;
    }

    .list > a {
        display: flex;
        flex-direction: column;
        align-items: left;
        row-gap: 0.3rem;
        text-decoration: none;

        > div {
            border: 1px solid #88888822;
            border-radius: 2px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            padding: 1.5ex 1.5ex 0.4ex 1.5ex;
        }

        &:hover {
            text-decoration: underline;
            color: var(--svp-text);
            > div {
                border: 1px solid var(--svp-text);
            }
        }
    }

    .list :global(img) {
        width: 100%;
        box-sizing: border-box;
        border-radius: 3px;
    }

    .list h4 {
        margin: 0rem;
        font-weight: normal;
        font-size: 13px;
        line-height: 1;
    }
</style>
