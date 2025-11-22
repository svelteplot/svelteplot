<script>
    import { page } from '$app/state';
    import themeOptions from 'virtual:sveltepress/theme-default';

    const routeId = page.route.id;

    /**
     * @typedef {object} Props
     * @property {'md' | 'svelte'} [pageType] - The type of the page
     */

    /** @type {Props} */
    const { pageType = 'md' } = $props();

    const DEFAULT_TEXT = 'Improve this page';
</script>

{#if themeOptions.editLink}
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <a
        class="edit-link"
        href={themeOptions.editLink.replace(':route', `${routeId}/+page.${pageType}`)}
        target="_blank"
        tabindex="0">
        <div class="edit-text">
            {themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT}
        </div>
    </a>
{/if}

<style>
    .edit-link {
        --at-apply: 'flex items-center text-svp-primary hover:text-svp-hover cursor-pointer';
    }

    .edit-text {
        --at-apply: 'ml-1';
    }
</style>
