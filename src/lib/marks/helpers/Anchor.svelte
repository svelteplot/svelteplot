<script>
    import { resolveProp } from '$lib/helpers/resolve.js';

    let { datum = {}, options = {}, children } = $props();

    const href = $derived(resolveProp(options.href, datum, null));
    const target = $derived(resolveProp(options.target, datum, null));
    const rel = $derived(resolveProp(options.rel, datum, null));
    const type = $derived(resolveProp(options.type, datum, null));
    const download = $derived(resolveProp(options.download, datum, null));

    // filter data attributes from options
    const dataAttributes = $derived(
        Object.fromEntries(
            Object.entries(options).filter(([key]) => key.startsWith('data-sveltekit-'))
        )
    );
</script>

{#if href}
    <!-- we can't use <a> directly here because Svelte confuses it with the 
 HTMLAElement which breaks the rendering -->
    <svelte:element
        this={'a'}
        {href}
        {target}
        {rel}
        {type}
        {download}
        {...dataAttributes}
        aria-label="link"
        xmlns="http://www.w3.org/2000/svg">
        {@render children?.()}
    </svelte:element>
{:else}
    {@render children?.()}
{/if}
