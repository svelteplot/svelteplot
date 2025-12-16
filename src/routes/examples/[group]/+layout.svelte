<script lang="ts">
    import { page } from '$app/state';

    import '../../../app.scss';

    const groupTitle = $derived(page.params.group);
</script>

<svelte:head>
    <title>
        {groupTitle} - SveltePlot
    </title>
</svelte:head>

<div class="theme-default--page-layout">
    <div class="content">
        <slot />
    </div>
</div>

<style>
    .content {
        margin-left: auto;
        margin-right: auto;

        :global {
            a {
                transition: color 0.2s ease-out;
            }
            a:hover {
                color: var(--svp-accent);
            }
        }
    }
</style>
