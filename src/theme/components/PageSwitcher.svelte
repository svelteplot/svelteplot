<script lang="ts">
    import { page } from '$app/state';
    import type { Pathname } from '$app/types';
    import themOptions from 'virtual:sveltepress/theme-default';
    import Next from './icons/Next.svelte';
    import Prev from './icons/Prev.svelte';
    import { pages } from './layout';
    import { resolve } from '$app/paths';

    type SwitchPage = { to: Pathname; title?: string };

    const routeId = $derived(page.route.id ?? '');
    const i18n = $derived((themOptions.i18n ?? {}) as Record<string, string | undefined>);

    const switchPages = $derived(
        $pages.filter((p): p is SwitchPage => {
            const maybePage = p as Record<string, unknown>;
            return typeof maybePage.to === 'string' && maybePage.to.startsWith('/');
        })
    );

    const activeIdx = $derived(
        routeId
            ? switchPages.findIndex((p) =>
                  routeId.endsWith('/') ? p.to === routeId : p.to.startsWith(routeId)
              )
            : -1
    );

    const prevPage = $derived(activeIdx > 0 ? switchPages[activeIdx - 1] : null);
    const nextPage = $derived(
        activeIdx >= 0 && activeIdx < switchPages.length - 1 ? switchPages[activeIdx + 1] : null
    );

    const DEFAULT_PREVIOUS_TEXT = 'Previous';
    const DEFAULT_NEXT_TEXT = 'Next';
</script>

<div class="page-switcher">
    <div class:switcher={!!prevPage}>
        {#if prevPage}
            <a href={resolve(prevPage.to as any)} class="trigger">
                <div class="hint">
                    {i18n.previousPage || DEFAULT_PREVIOUS_TEXT}
                </div>
                <div class="title">
                    <div class="switch-icon">
                        <Prev />
                    </div>
                    <div class="title-label">
                        {prevPage.title ?? prevPage.to}
                    </div>
                </div>
            </a>
        {/if}
    </div>
    <div class="right" class:switcher={!!nextPage}>
        {#if nextPage}
            <a href={resolve(nextPage.to as any)} class="trigger">
                <div class="hint">
                    {i18n.nextPage || DEFAULT_NEXT_TEXT}
                </div>
                <div class="title">
                    <div class="title-label">
                        {nextPage.title ?? nextPage.to}
                    </div>
                    <div class="switch-icon">
                        <Next />
                    </div>
                </div>
            </a>
        {/if}
    </div>
</div>

<style>
    .page-switcher {
        --at-apply: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 border-t-solid border-t border-light-7 dark:border-gray-7 pt-4 sm:pt-8 mt-4';
    }
    .switcher {
        --at-apply: 'border-solid border-1 border-light-7 dark:border-gray-7 rounded-lg flex-grow cursor-pointer hover:border-svp-primary transition-300 transition-colors';
    }
    .hint {
        --at-apply: 'text-gray-4 text-3';
    }
    .title {
        --at-apply: 'flex items-center text-svp-primary mt-3';
    }
    .right .title {
        --at-apply: 'justify-end';
    }
    .title-label {
        --at-apply: 'ml-2';
    }
    .right .title-label {
        --at-apply: 'mr-2 ml-none';
    }
    .right {
        --at-apply: 'text-right';
    }
    .switch-icon {
        --at-apply: 'text-5';
    }
    .trigger {
        --at-apply: 'px-4 py-2 block';
    }
</style>
