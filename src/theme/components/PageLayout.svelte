<script>
    import { afterNavigate, beforeNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { tick } from 'svelte';
    import siteConfig from 'virtual:sveltepress/site';
    import themeOptions from 'virtual:sveltepress/theme-default';
    import EditPage from './EditPage.svelte';
    import Home from './Home.svelte';
    import InlineExamplesGrid from '$shared/docs/InlineExamplesGrid.svelte';
    import HeroImage from './home/HeroImage.svelte';
    import LastUpdate from './LastUpdate.svelte';
    import { anchors, pages, showHeader, sidebar } from './layout';
    import PageSwitcher from './PageSwitcher.svelte';
    import { resolve } from '$app/paths';
    import ActionButton from './ActionButton.svelte';

    const routeId = $derived(page.route.id);

    // The frontmatter info. This would be injected by sveltepress
    const { fm, children, heroImage } = $props();

    const {
        title,
        description,
        pageType,
        lastUpdate,
        anchors: fmAnchors = [],
        home,
        sidebar: fmSidebar = true,
        header = true
    } = fm;

    $sidebar = fmSidebar;
    $showHeader = header;

    const isHome = $derived(routeId === '/');

    anchors.set(fmAnchors);

    let ready = $state(false);

    beforeNavigate(() => {
        ready = false;
    });

    afterNavigate(() => {
        tick().then(() => {
            ready = true;
        });
    });
</script>

<svelte:head>
    <title
        >{title || page?.data?.title
            ? `${title || page?.data?.title} - ${siteConfig.title}`
            : siteConfig.title}</title>
    <meta name="description" content={description || siteConfig.description} />
</svelte:head>

{#snippet defaultHeroImage()}
    {#if fm.heroImage}
        <HeroImage heroImage={fm.heroImage} />
    {/if}
{/snippet}

{#if !isHome}
    <div class="theme-default--page-layout pb-4">
        <div class="content">
            {#if title}
                <h1 class="page-title">
                    {title}
                    {#if fm.addedIn}
                        <a
                            class="version-link admonition-info"
                            href="https://github.com/svelteplot/svelteplot/releases/tag/v{fm.addedIn}"
                            target="_blank"
                            title="Added in version {fm.addedIn}">
                            <span class="admonition-content">^{fm.addedIn}</span>
                        </a>
                    {/if}
                </h1>
            {/if}
            {#if description}
                <p class="page-description">
                    {description}
                </p>
            {/if}
            {#if fm.examples?.length}
                <InlineExamplesGrid keys={fm.examples} />
            {/if}
            {#if fm.links}
                <div class="links">
                    {#if fm.links?.examples}
                        <ActionButton
                            small
                            to={resolve(fm.links?.examples)}
                            label="More examples" />
                    {/if}
                    {#if fm.links?.api}
                        <ActionButton small to={resolve(fm.links?.api)} label="API reference" />
                    {/if}
                </div>
            {/if}
            {@render children?.()}

            <div class="meta" class:without-edit-link={!themeOptions.editLink}>
                {#if themeOptions.editLink}
                    <EditPage {pageType} />
                {/if}
                <LastUpdate {lastUpdate} />
            </div>
            {#if ready && $pages.length}
                <PageSwitcher />
            {/if}
        </div>
    </div>
{:else}
    {#if home !== false}
        <Home {...fm} {siteConfig} heroImage={heroImage ?? defaultHeroImage}></Home>
    {/if}
    {@render children?.()}
{/if}

<style>
    :global(.theme-default--page-layout h1 .svp-title-anchor),
    :global(.theme-default--page-layout h2 .svp-title-anchor),
    :global(.theme-default--page-layout h3 .svp-title-anchor),
    :global(.theme-default--page-layout h4 .svp-title-anchor),
    :global(.theme-default--page-layout h5 .svp-title-anchor),
    :global(.theme-default--page-layout h6 .svp-title-anchor) {
        --at-apply: 'absolute left-0 top-[50%] flex items-center opacity-0 pointer-events-none hover:text-svp-hover transition-all transition-200';
        transform: translate(-100%, -50%);
    }

    :global(.theme-default--page-layout h2 .svp-title-anchor) {
        transform: translate(-100%, calc((-100% + 1rem) / 2));
    }
    :global(.theme-default--page-layout h1),
    :global(.theme-default--page-layout h2),
    :global(.theme-default--page-layout h3),
    :global(.theme-default--page-layout h4),
    :global(.theme-default--page-layout h5),
    :global(.theme-default--page-layout h6) {
        --at-apply: 'relative';
    }
    :global(.theme-default--page-layout h2) {
        --at-apply: 'border-t-solid border-t border-light-7 dark:border-gray-7 pt-4 mt-8 mb-4';
    }
    :global(.theme-default--page-layout h1:hover .svp-title-anchor),
    :global(.theme-default--page-layout h2:hover .svp-title-anchor),
    :global(.theme-default--page-layout h3:hover .svp-title-anchor),
    :global(.theme-default--page-layout h4:hover .svp-title-anchor),
    :global(.theme-default--page-layout h5:hover .svp-title-anchor),
    :global(.theme-default--page-layout h6:hover .svp-title-anchor) {
        --at-apply: 'pointer-events-auto opacity-100';
    }
    :global(.theme-default--page-layout img) {
        --at-apply: 'max-w-full';
    }
    .links {
        --at-apply: 'flex gap-4 mt-4 mb-8';
    }

    .content {
        --at-apply: 'sm:w-[45vw] mx-auto pb-8 sm:pb-28 w-[90vw]';
    }
    .page-title {
        --at-apply: 'mt-none';
    }
    .meta {
        --at-apply: 'sm:flex justify-between mt-20 column';
    }
    .without-edit-link {
        --at-apply: 'justify-end';
    }
</style>
