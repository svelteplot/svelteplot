<script>
    import { resolve } from '$app/paths';
    import { useDark } from './isDark.svelte';
    let { examples } = $props();

    const exampleImages = import.meta.glob('../../snapshots/*/*.png', {
        eager: true,
        query: {
            enhanced: true,
            w: 640
        }
    });

    const ds = useDark();
</script>

<div class="list">
    {#each examples as page, i (i)}
        <a href={resolve(page.url)}>
            <div>
                {#if exampleImages[`../../snapshots/${page.key}.png`]}
                    <enhanced:img
                        src={ds.isDark
                            ? exampleImages[`../../snapshots/${page.key}.dark.png`].default.img.src
                            : exampleImages[`../../snapshots/${page.key}.png`].default.img.src}
                        alt={page.title} />
                {/if}
            </div>
            <h4>
                {page.title}
            </h4>
        </a>
    {/each}
</div>

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
        transition: transform 0.2s ease-in-out;
    }

    .list h4 {
        margin: 0rem;
        font-weight: normal;
        font-size: 13px;
        line-height: 1;
    }
</style>
